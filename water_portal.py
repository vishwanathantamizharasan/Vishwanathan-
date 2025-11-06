"""
Team Code Index:
Part 1 - Data Management & Initialization  : Rithwik
Part 2 - Admin CRUD Operations             : Aditya Wankhade
Part 3 - Advanced Admin Features           : Vishwanathan
Part 4 - Client Interface & Main Menu      : Darshan
"""

# -------------------------
# IMPORTS (allowed only)
# -------------------------
import sys
import csv
from typing import Any, Dict, List, Optional

import pandas as pd
import numpy as np

# -------------------------
# CONFIG
# -------------------------
DATA_FILE = "water_data.csv"
BILLS_FILE = "bills_export.csv"
BACKUP_FILE = "backup.csv"
AUDIT_FILE = "audit_log.csv"
SUMMARY_FILE = "summary_report.csv"
ADMIN_PASS = "admin123"
COLUMNS = [
    "customer_id", "name", "address", "phone",
    "last_month_reading", "current_reading",
    "consumption", "tariff_per_unit", "last_updated",
    "paid", "paid_date"
]
# Overdue rule: unpaid AND consumption > 0
# (No datetime allowed per instruction)
OVERDUE_CRITERIA = "UNPAID_WITH_CONSUMPTION"

PAGINATION_SIZE = 10  # rows per page when viewing tables

# -------------------------
# Utility functions used by many parts
# -------------------------

def _ensure_schema(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure expected columns exist and types are normalized."""
    for col in COLUMNS:
        if col not in df.columns:
            df[col] = "" if col in ("name", "address", "phone", "last_updated", "paid_date") else 0
    # numeric normalization
    for col in ("last_month_reading", "current_reading", "consumption", "tariff_per_unit"):
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
    df["customer_id"] = pd.to_numeric(df["customer_id"], errors="coerce").fillna(0).astype(int)
    # normalize paid column to boolean-like values (True/False or False)
    df["paid"] = df["paid"].replace({None: False, "": False, "False": False, "False ": False}).astype(object)
    return df

def pretty_print_df(df: pd.DataFrame, limit: Optional[int] = None) -> None:
    """Print DataFrame to CLI with optional limit and without index for neatness."""
    if df.empty:
        print("[INFO] No records to display.")
        return
    disp = df.copy()
    if "bill_amount" in disp.columns:
        disp["bill_amount"] = disp["bill_amount"].apply(lambda v: f"{v:.2f}")
    if limit:
        print(disp.head(limit).to_string(index=False))
    else:
        print(disp.to_string(index=False))

def paginate_df(df: pd.DataFrame, page_size: int = PAGINATION_SIZE) -> None:
    """Show DataFrame pages interactively on CLI."""
    if df.empty:
        print("[INFO] No records.")
        return
    total = len(df)
    pages = (total + page_size - 1) // page_size
    page = 0
    while True:
        start = page * page_size
        end = start + page_size
        print(f"\n-- Page {page+1}/{pages} -- (showing rows {start+1} to {min(end,total)})")
        print(df.iloc[start:end].to_string(index=False))
        cmd = input("n=next, p=prev, q=quit: ").strip().lower()
        if cmd == "n" and page < pages - 1:
            page += 1
        elif cmd == "p" and page > 0:
            page -= 1
        elif cmd == "q":
            break
        else:
            print("Invalid or no more pages.")

def read_int(prompt: str, default: Optional[int] = None) -> int:
    while True:
        s = input(prompt).strip()
        if s == "" and default is not None:
            return default
        if s.isdigit():
            return int(s)
        print("Please enter a valid integer.")

def read_float(prompt: str, default: Optional[float] = None) -> float:
    while True:
        s = input(prompt).strip()
        if s == "" and default is not None:
            return default
        try:
            return float(s)
        except Exception:
            print("Please enter a valid number (e.g., 123.45).")

def confirm(prompt: str = "Are you sure? (y/n): ") -> bool:
    ans = input(prompt).strip().lower()
    return ans in ("y", "yes")

def cli_info(msg: str) -> None:
    print(f"[INFO] {msg}")

def cli_warn(msg: str) -> None:
    print(f"[WARN] {msg}")

def cli_error(msg: str) -> None:
    print(f"[ERROR] {msg}")

def append_audit(action: str, detail: str) -> None:
    """Append a simple audit row to AUDIT_FILE using pandas append semantics."""
    try:
        df_a = pd.read_csv(AUDIT_FILE, dtype=str)
    except Exception:
        df_a = pd.DataFrame(columns=["timestamp", "action", "detail"])
    import time
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    new = {"timestamp": ts, "action": action, "detail": detail}
    df_a = pd.concat([df_a, pd.DataFrame([new])], ignore_index=True)
    df_a.to_csv(AUDIT_FILE, index=False)

# =====================================================
# PART 1: DATA MANAGEMENT & INITIALIZATION
# Rithwik
# =====================================================

def init_storage():
    """Create main CSV if missing with correct header. Use pandas only."""
    try:
        pd.read_csv(DATA_FILE)
        cli_info(f"Using existing {DATA_FILE}.")
    except Exception:
        df_empty = pd.DataFrame(columns=COLUMNS)
        df_empty.to_csv(DATA_FILE, index=False)
        cli_info(f"Created {DATA_FILE} with header.")
    # ensure audit file exists
    try:
        pd.read_csv(AUDIT_FILE)
    except Exception:
        pd.DataFrame(columns=["timestamp", "action", "detail"]).to_csv(AUDIT_FILE, index=False)
    # ensure backup file exists optionally
    try:
        pd.read_csv(BACKUP_FILE)
    except Exception:
        pd.DataFrame(columns=COLUMNS).to_csv(BACKUP_FILE, index=False)

def load_data() -> pd.DataFrame:
    """Load CSV into DataFrame and normalize schema."""
    try:
        df = pd.read_csv(DATA_FILE, dtype=str)
    except Exception:
        # create and reload
        df = pd.DataFrame(columns=COLUMNS)
        df.to_csv(DATA_FILE, index=False)
        df = pd.read_csv(DATA_FILE, dtype=str)
    df = _ensure_schema(df)
    return df

def save_data(df: pd.DataFrame) -> None:
    """Save DataFrame to CSV, ensuring schema and default columns."""
    df_out = _ensure_schema(df.copy())
    df_out.to_csv(DATA_FILE, index=False)
    cli_info(f"Saved {len(df_out)} records to {DATA_FILE}")
    append_audit("save_data", f"Saved {len(df_out)} records")

def backup_data():
    """Create a simple backup by copying DataFrame to BACKUP_FILE."""
    try:
        df = load_data()
        df.to_csv(BACKUP_FILE, index=False)
        cli_info(f"Backup saved to {BACKUP_FILE}")
        append_audit("backup", f"Backup created ({len(df)} rows)")
    except Exception as e:
        cli_error(f"Backup failed: {e}")

def next_customer_id(df: pd.DataFrame) -> int:
    if df.empty:
        return 1
    return int(df["customer_id"].max()) + 1

# =====================================================
# PART 2: ADMIN CRUD OPERATIONS
# Aditya Wankhade
# =====================================================

def add_customer():
    df = load_data()
    cid = next_customer_id(df)
    cli_info(f"Adding new customer; assigned ID {cid}")
    name = input("Name: ").strip() or f"Customer{cid}"
    address = input("Address: ").strip()
    phone = input("Phone: ").strip()
    last_read = read_float("Last month reading (units) [0]: ", default=0.0)
    tariff = read_float("Tariff per unit [1.0]: ", default=1.0)
    # store last_updated as manual note (string) — e.g., "2025-11-07"
    last_updated = input("Last updated date (YYYY-MM-DD) [leave blank]: ").strip()
    new = {
        "customer_id": cid,
        "name": name,
        "address": address,
        "phone": phone,
        "last_month_reading": float(last_read),
        "current_reading": float(last_read),
        "consumption": 0.0,
        "tariff_per_unit": float(tariff),
        "last_updated": last_updated,
        "paid": False,
        "paid_date": ""
    }
    df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
    save_data(df)
    append_audit("add_customer", f"id={cid}, name={name}")
    cli_info(f"Customer {cid} added successfully.")

def update_consumption():
    df = load_data()
    if df.empty:
        cli_warn("No customers available to update.")
        return
    cid = read_int("Enter customer ID to update: ")
    if cid not in df["customer_id"].values:
        cli_error("Customer ID not found.")
        return
    idx = df.index[df["customer_id"] == cid][0]
    prev = float(df.at[idx, "current_reading"])
    cli_info(f"Previous reading for ID {cid}: {prev}")
    new_read = read_float("Enter new current reading: ", default=prev)
    # update readings
    df.at[idx, "last_month_reading"] = prev
    df.at[idx, "current_reading"] = float(new_read)
    df.at[idx, "consumption"] = float(new_read) - float(prev)
    # last_updated stored as manual note
    last_updated = input("Enter last_updated date (YYYY-MM-DD) [leave blank to keep]: ").strip()
    if last_updated:
        df.at[idx, "last_updated"] = last_updated
    df.at[idx, "paid"] = False
    df.at[idx, "paid_date"] = ""
    save_data(df)
    append_audit("update_consumption", f"id={cid}, prev={prev}, new={new_read}")
    cli_info("Consumption updated and marked UNPAID.")

def delete_customer():
    df = load_data()
    if df.empty:
        cli_warn("No customers to delete.")
        return
    cid = read_int("Enter customer ID to delete: ")
    if cid not in df["customer_id"].values:
        cli_error("Customer not found.")
        return
    if confirm(f"Delete customer {cid}? This will create a backup first. (y/n): "):
        backup_data()
        df = df[df["customer_id"] != cid].reset_index(drop=True)
        save_data(df)
        append_audit("delete_customer", f"id={cid}")
        cli_info(f"Customer {cid} deleted.")
    else:
        cli_info("Delete cancelled.")

def view_all_customers(limit: Optional[int] = None):
    df = load_data()
    if df.empty:
        cli_warn("No data.")
        return
    disp = df.copy()
    disp["bill_amount"] = disp.apply(lambda r: calculate_bill_row(r), axis=1)
    if limit is not None:
        pretty_print_df(disp.head(limit))
    else:
        paginate_df(disp)

def export_customers_csv(path: str):
    """Export the main data file to a different CSV path (user-specified)."""
    try:
        df = load_data()
        df.to_csv(path, index=False)
        cli_info(f"Exported customers to {path}")
        append_audit("export_customers", path)
    except Exception as e:
        cli_error(f"Export failed: {e}")

# =====================================================
# PART 3: ADVANCED ADMIN FEATURES
# Vishwanathan
# =====================================================

# Billing calculation types: simple flat rate, or slab-based
def calculate_bill_flat(cons: float, tariff: float) -> float:
    return round(cons * tariff, 2)

def calculate_bill_slabs(cons: float, slabs: List[Dict[str, float]]) -> float:
    """
    slabs: list of dicts with keys 'upto' and 'rate'
    Example: slabs = [{'upto': 30, 'rate': 1.0}, {'upto': 60, 'rate': 2.0}, {'upto': None, 'rate': 3.0}]
    'upto' None indicates remaining
    """
    remaining = cons
    total = 0.0
    for slab in slabs:
        upto = slab.get("upto")
        rate = float(slab.get("rate", 0.0))
        if upto is None:
            # remaining slab
            total += remaining * rate
            remaining = 0
            break
        take = min(remaining, max(upto, 0))
        total += take * rate
        remaining -= take
        if remaining <= 0:
            break
    return round(max(total, 0.0), 2)

# Default slab example (can be updated via admin)
DEFAULT_SLABS = [
    {"upto": 30, "rate": 1.0},
    {"upto": 60, "rate": 2.0},
    {"upto": None, "rate": 3.0}
]
USE_SLABS = False  # toggle between flat tariff_per_unit and slab billing

def calculate_bill_row(row: Any) -> float:
    """Return bill amount depending on slab mode or flat tariff."""
    try:
        cons = float(row.get("consumption", 0.0))
    except Exception:
        cons = 0.0
    try:
        tariff = float(row.get("tariff_per_unit", 1.0))
    except Exception:
        tariff = 1.0
    if USE_SLABS:
        return calculate_bill_slabs(cons, DEFAULT_SLABS)
    else:
        return calculate_bill_flat(cons, tariff)

def summary_report(detailed: bool = False):
    """Show statistics and optionally export summary CSV."""
    df = load_data()
    if df.empty:
        cli_warn("No data for summary.")
        return
    cons = df["consumption"].astype(float).to_numpy()
    total = float(np.nansum(cons))
    avg = float(np.nanmean(cons)) if len(cons) else 0.0
    highest = float(np.nanmax(cons)) if len(cons) else 0.0
    p50 = float(np.nanpercentile(cons, 50)) if len(cons) else 0.0
    p90 = float(np.nanpercentile(cons, 90)) if len(cons) else 0.0

    print("\n--- SUMMARY ---")
    print(f"Total consumption : {total:.2f} units")
    print(f"Average consumption : {avg:.2f} units")
    print(f"Median consumption : {p50:.2f} units")
    print(f"90th percentile : {p90:.2f} units")
    print(f"Highest consumption : {highest:.2f} units")
    # Top consumers table
    top = df.sort_values("consumption", ascending=False).head(10)[["customer_id", "name", "consumption"]]
    print("\nTop 10 consumers:")
    print(top.to_string(index=False))

    if detailed:
        # Create a CSV summary with basic stats per-customer
        out = df.copy()
        out["bill_amount"] = out.apply(lambda r: calculate_bill_row(r), axis=1)
        out_summary = out[["customer_id", "name", "consumption", "tariff_per_unit", "bill_amount"]]
        out_summary.to_csv(SUMMARY_FILE, index=False)
        cli_info(f"Detailed summary exported to {SUMMARY_FILE}")
        append_audit("summary_export", SUMMARY_FILE)

def export_bills():
    """Produce bills_export.csv (snapshot) containing bill_amount for each customer."""
    df = load_data()
    if df.empty:
        cli_warn("No data to export bills.")
        return
    out = df.copy()
    out["bill_amount"] = out.apply(lambda r: calculate_bill_row(r), axis=1)
    # last_generated marker kept empty as date strings are optional
    out["bill_generated_on"] = ""
    out.to_csv(BILLS_FILE, index=False)
    cli_info(f"Bills exported to {BILLS_FILE}")
    append_audit("export_bills", BILLS_FILE)

def update_tariff_single(cid: int, new_tariff: float):
    """Helper to update tariff for a single customer programmatically."""
    df = load_data()
    if cid not in df["customer_id"].values:
        raise ValueError("Customer ID not found")
    df.loc[df["customer_id"] == cid, "tariff_per_unit"] = float(new_tariff)
    save_data(df)
    append_audit("update_tariff_single", f"id={cid}, tariff={new_tariff}")

def update_tariff():
    """Admin interactive tariff update: single or bulk."""
    df = load_data()
    if df.empty:
        cli_warn("No data for tariff update.")
        return
    print("1) Update single customer tariff")
    print("2) Update tariffs by filter (e.g., consumption > X)")
    print("3) Set global tariff")
    print("4) Toggle slab billing (current: {})".format("ON" if USE_SLABS else "OFF"))
    ch = input("Choice: ").strip()
    if ch == "1":
        cid = read_int("Customer ID: ")
        if cid not in df["customer_id"].values:
            cli_error("Customer not found.")
            return
        new_tariff = read_float("New tariff per unit: ")
        update_tariff_single(cid, new_tariff)
        cli_info(f"Updated tariff for {cid}")
    elif ch == "2":
        # filter-based update: e.g., consumption > threshold
        thresh = read_float("Set consumption threshold (customers with consumption > threshold will be updated): ")
        new_tariff = read_float("New tariff per unit for matched customers: ")
        mask = df["consumption"].astype(float) > float(thresh)
        matched = df[mask]
        if matched.empty:
            cli_warn("No customers matched that filter.")
            return
        df.loc[mask, "tariff_per_unit"] = float(new_tariff)
        save_data(df)
        append_audit("bulk_tariff_update", f"thr={thresh}, tariff={new_tariff}, matched={len(matched)}")
        cli_info(f"Updated tariff for {len(matched)} customers.")
    elif ch == "3":
        new_tariff = read_float("Enter global tariff per unit: ")
        df["tariff_per_unit"] = float(new_tariff)
        save_data(df)
        append_audit("global_tariff_update", f"{new_tariff}")
        cli_info("Global tariff updated.")
    elif ch == "4":
        # Toggle slab billing mode
        global USE_SLABS
        USE_SLABS = not USE_SLABS
        cli_info(f"Slab billing toggled to {'ON' if USE_SLABS else 'OFF'}")
        append_audit("toggle_slab", f"{USE_SLABS}")
    else:
        cli_error("Invalid option.")

def mark_paid():
    df = load_data()
    if df.empty:
        cli_warn("No data.")
        return
    cid = read_int("Enter customer ID to mark as paid: ")
    if cid not in df["customer_id"].values:
        cli_error("Customer not found.")
        return
    df.loc[df["customer_id"] == cid, "paid"] = True
    df.loc[df["customer_id"] == cid, "paid_date"] = ""  # no datetime; can be filled manually
    save_data(df)
    append_audit("mark_paid", f"id={cid}")
    cli_info(f"Customer {cid} marked as PAID")

def list_overdue():
    """Simplified overdue: unpaid AND consumption > 0"""
    df = load_data()
    if df.empty:
        cli_warn("No data.")
        return
    mask = (df["paid"] == False) & (df["consumption"].astype(float) > 0)
    overdue = df[mask]
    if overdue.empty:
        cli_info("No overdue accounts.")
        return
    overdue["bill_amount"] = overdue.apply(lambda r: calculate_bill_row(r), axis=1)
    pretty_print_df(overdue[["customer_id", "name", "phone", "consumption", "bill_amount"]])

def search_customer():
    df = load_data()
    if df.empty:
        cli_warn("No data.")
        return
    q = input("Search query (name or phone, partial OK): ").strip().lower()
    if not q:
        cli_warn("Empty query.")
        return
    mask = df["name"].fillna("").str.lower().str.contains(q, na=False) | df["phone"].fillna("").str.contains(q, na=False)
    hits = df[mask]
    if hits.empty:
        cli_info("No matches found.")
        return
    hits = hits.copy()
    hits["bill_amount"] = hits.apply(lambda r: calculate_bill_row(r), axis=1)
    pretty_print_df(hits[["customer_id", "name", "phone", "consumption", "bill_amount"]])

def bulk_update_consumption_from_csv(path: str):
    """
    Import a CSV with columns: customer_id,current_reading
    For each row, update current_reading and recalc consumption.
    """
    try:
        df_main = load_data()
        df_in = pd.read_csv(path, dtype=str)
        updates = 0
        for _, r in df_in.iterrows():
            try:
                cid = int(r.get("customer_id", "").strip())
                new_read = float(r.get("current_reading", "").strip())
            except Exception:
                continue
            if cid in df_main["customer_id"].values:
                idx = df_main.index[df_main["customer_id"] == cid][0]
                prev = float(df_main.at[idx, "current_reading"])
                df_main.at[idx, "last_month_reading"] = prev
                df_main.at[idx, "current_reading"] = new_read
                df_main.at[idx, "consumption"] = new_read - prev
                df_main.at[idx, "paid"] = False
                updates += 1
        save_data(df_main)
        append_audit("bulk_update_consumption", f"path={path}, updates={updates}")
        cli_info(f"Bulk update complete: {updates} records updated.")
    except FileNotFoundError:
        cli_error("Import file not found.")
    except Exception as e:
        cli_error(f"Bulk import failed: {e}")

# =====================================================
# PART 4: CLIENT INTERFACE & MAIN MENU
# Darshan
# =====================================================

def client_register():
    add_customer()

def client_view():
    df = load_data()
    if df.empty:
        cli_warn("No data.")
        return
    cid = read_int("Enter your Customer ID: ")
    if cid not in df["customer_id"].values:
        cli_error("Customer ID not found.")
        return
    rec = df[df["customer_id"] == cid].iloc[0].to_dict()
    bill = calculate_bill_row(rec)
    print("\n--- CLIENT RECORD ---")
    print(f"ID: {rec['customer_id']}")
    print(f"Name: {rec['name']}")
    print(f"Phone: {rec['phone']}")
    print(f"Last reading: {rec['last_month_reading']}  Current: {rec['current_reading']}")
    print(f"Consumption: {rec['consumption']} units")
    print(f"Tariff/unit: {rec['tariff_per_unit']}")
    print(f"Bill amount: {bill:.2f}")
    print(f"Paid: {rec.get('paid', False)}  Paid date: {rec.get('paid_date','')}")

def import_customers_from_csv(path: str):
    """
    Import CSV with header columns: name,address,phone,last_reading,tariff
    Uses csv.DictReader for robust parsing.
    """
    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            df_main = load_data()
            next_id = next_customer_id(df_main)
            added = 0
            for row in reader:
                name = row.get("name", f"Customer{next_id}")
                address = row.get("address", "")
                phone = row.get("phone", "")
                try:
                    last_read = float(row.get("last_reading", 0) or 0)
                except Exception:
                    last_read = 0.0
                try:
                    tariff = float(row.get("tariff", 1.0) or 1.0)
                except Exception:
                    tariff = 1.0
                new = {
                    "customer_id": next_id,
                    "name": name,
                    "address": address,
                    "phone": phone,
                    "last_month_reading": last_read,
                    "current_reading": last_read,
                    "consumption": 0.0,
                    "tariff_per_unit": tariff,
                    "last_updated": "",
                    "paid": False,
                    "paid_date": ""
                }
                df_main = pd.concat([df_main, pd.DataFrame([new])], ignore_index=True)
                next_id += 1
                added += 1
            save_data(df_main)
            append_audit("import_customers", f"path={path}, added={added}")
            cli_info(f"Imported {added} customers from {path}")
    except FileNotFoundError:
        cli_error("Import file not found.")
    except Exception as e:
        cli_error(f"Import failed: {e}")

def show_help():
    print("""
=== HELP: Water Utility Consumption Portal ===
Commands are available via menus. Key operations:
 - Admin:
    * Add Customer
    * Update Consumption
    * Delete Customer
    * View All Customers (paginated)
    * Summary Report (with optional export)
    * Export Bills
    * Update Tariff (single/bulk/global)
    * Mark Paid
    * List Overdue
    * Search Customer
    * Backup Data
    * Import customers from CSV
 - Client:
    * Register (calls Add Customer)
    * View My Record (using customer ID)
 - General:
    * Demo mode: creates sample data
    * Use CSV import/export for batch operations
Note: This implementation uses only pandas, numpy, and csv.
""")

def admin_menu():
    while True:
        print("\n==== ADMIN MENU ====")
        print("1. Add Customer")
        print("2. Update Consumption")
        print("3. Delete Customer")
        print("4. View All Customers (paginated)")
        print("5. Summary Report")
        print("6. Export Bills CSV")
        print("7. Update Tariff / Toggle Slab Billing")
        print("8. Mark Bill Paid")
        print("9. List Overdue Accounts")
        print("10. Search Customer")
        print("11. Backup Data")
        print("12. Import customers from CSV")
        print("13. Bulk update consumption from CSV")
        print("14. Export customers to custom CSV path")
        print("0. Logout")
        ch = input("Choice: ").strip()
        if ch == "1":
            add_customer()
        elif ch == "2":
            update_consumption()
        elif ch == "3":
            delete_customer()
        elif ch == "4":
            view_all_customers()
        elif ch == "5":
            det = input("Export detailed summary? (y/n): ").strip().lower()
            summary_report(detailed=(det == "y"))
        elif ch == "6":
            export_bills()
        elif ch == "7":
            update_tariff()
        elif ch == "8":
            mark_paid()
        elif ch == "9":
            list_overdue()
        elif ch == "10":
            search_customer()
        elif ch == "11":
            backup_data()
        elif ch == "12":
            path = input("Enter CSV file path to import customers: ").strip()
            import_customers_from_csv(path)
        elif ch == "13":
            path = input("Enter CSV path for bulk consumption updates (cols: customer_id,current_reading): ").strip()
            bulk_update_consumption_from_csv(path)
        elif ch == "14":
            path = input("Enter target CSV path for exporting customers: ").strip()
            export_customers_csv(path)
        elif ch == "0":
            break
        else:
            cli_error("Invalid option. Enter the menu number.")

def client_menu():
    while True:
        print("\n==== CLIENT MENU ====")
        print("1. Register (Add Customer)")
        print("2. View My Record")
        print("3. Help")
        print("0. Back")
        ch = input("Choice: ").strip()
        if ch == "1":
            client_register()
        elif ch == "2":
            client_view()
        elif ch == "3":
            show_help()
        elif ch == "0":
            break
        else:
            cli_error("Invalid option.")

def create_demo_data():
    sample = [
        ("Ravi Kumar", "Vellore", "9000000001", 420, 2.5),
        ("Sneha Patel", "Chennai", "9000000002", 305, 2.5),
        ("Amit Singh", "Bangalore", "9000000003", 640, 2.0),
        ("Meera Rao", "Hyderabad", "9000000004", 150, 3.0),
        ("Karan Iyer", "Coimbatore", "9000000005", 275, 2.2),
        ("Priya Sharma", "Chennai", "9000000006", 315, 2.5),
        ("Vikram Rao", "Vellore", "9000000007", 485, 2.0)
    ]
    df = load_data()
    next_id = next_customer_id(df)
    added = 0
    for name, addr, phone, last_read, tariff in sample:
        new = {
            "customer_id": next_id,
            "name": name,
            "address": addr,
            "phone": phone,
            "last_month_reading": float(last_read),
            "current_reading": float(last_read),
            "consumption": 0.0,
            "tariff_per_unit": float(tariff),
            "last_updated": "",
            "paid": False,
            "paid_date": ""
        }
        df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
        next_id += 1
        added += 1
    save_data(df)
    append_audit("demo_data", f"Added {added} demo rows")
    cli_info(f"Demo: Added {added} sample customers.")

def main_menu():
    init_storage()
    while True:
        print("\n💧 WATER UTILITY CONSUMPTION PORTAL (EXPANDED) 💧")
        print("1. Admin Login")
        print("2. Client Access")
        print("3. Demo: populate sample data")
        print("4. Help")
        print("0. Exit")
        ch = input("Enter choice: ").strip()
        if ch == "1":
            pw = input("Enter admin password: ").strip()
            if pw == ADMIN_PASS:
                admin_menu()
            else:
                cli_error("Incorrect admin password.")
        elif ch == "2":
            client_menu()
        elif ch == "3":
            if confirm("This will append demo data to CSV (OK to run multiple times). Continue? (y/n): "):
                create_demo_data()
        elif ch == "4":
            show_help()
        elif ch == "0":
            cli_info("Goodbye.")
            break
        else:
            cli_error("Invalid choice. Enter a menu number.")

# CLI arg support
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].lower() in ("demo", "--demo"):
        init_storage()
        create_demo_data()
        main_menu()
    else:
        main_menu()

