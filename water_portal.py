"""
=====================================================
    WATER UTILITY CONSUMPTION PORTAL - ENHANCED CLI
=====================================================

Course    : BACSE1010
Project   : Water Utility Consumption Portal (CLI)
Libraries : pandas, numpy, (Python stdlib)
Author(s) : Team: Vishwanathan, Aditya Wankhade, Darshan, Ritwik
"""

# =====================================================
# PART 0: IMPORTS & CONFIG
# (general / shared)
# =====================================================
import os
import sys
import csv
import shutil
import tempfile
import logging
from datetime import datetime, timedelta
import time
from typing import Any, Dict

import pandas as pd
import numpy as np

# ======= Configuration =======
DATA_FILE = "water_data.csv"
BILL_FOLDER = "bills"
BACKUP_FOLDER = "backups"
LOG_FILE = "portal.log"
OVERDUE_DAYS = 30
ADMIN_PASS = "admin123"  # simple - for demo only

# ensure folder config
os.makedirs(BILL_FOLDER, exist_ok=True)
os.makedirs(BACKUP_FOLDER, exist_ok=True)

# ======= Logging setup ========
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("water_portal")

# =====================================================
# PART 1: DATA MANAGEMENT & INITIALIZATION
# Vishwanathan
# =====================================================

def atomic_save(df: pd.DataFrame, path: str) -> None:
    
    """Save DataFrame to CSV atomically (write to temp then rename)."""
    
    fd, tmp = tempfile.mkstemp(prefix="tmp_", suffix=".csv", dir=".")
    
    os.close(fd)
    
    try:
        df.to_csv(tmp, index=False)
        shutil.move(tmp, path)
   
    except Exception:
     
        if os.path.exists(tmp):
            os.remove(tmp)
      
        raise

def init_storage() -> None:
    """Create data file with header if it doesn't exist."""
   
    if not os.path.exists(DATA_FILE):
        columns = [
            "customer_id", "name", "address", "phone",
        
            "last_month_reading", "current_reading",
            "consumption", "tariff_per_unit", "last_updated",
        
            "paid", "paid_date"
        ]
        df = pd.DataFrame(columns=columns)
    
        atomic_save(df, DATA_FILE)
        logger.info("Initialized storage with headers.")
    
    else:
        logger.info("Data file exists: %s", DATA_FILE)

def load_data() -> pd.DataFrame:
    """Load CSV into DataFrame with safe dtypes."""
   
    try:
        df = pd.read_csv(DATA_FILE, dtype=str)
        # ensure consistent columns
        expected = [
            "customer_id", "name", "address", "phone",
       
            "last_month_reading", "current_reading",
            "consumption", "tariff_per_unit", "last_updated",
        
            "paid", "paid_date"
        ]
       
        for col in expected:
       
            if col not in df.columns:
                df[col] = ""
        # convert numeric columns safely
       
        for col in ("last_month_reading", "current_reading", "consumption", "tariff_per_unit"):
      
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
      
        df["customer_id"] = pd.to_numeric(df["customer_id"], errors="coerce").fillna(0).astype(int)
      
        df["paid"] = df["paid"].astype(object).fillna(False)
      
        return df
   
    except FileNotFoundError:
        init_storage()
        return load_data()

def save_data(df: pd.DataFrame) -> None:
  
    """Persist DataFrame to CSV safely."""
    # ensure ordering of columns
   
    cols = [
       
        "customer_id", "name", "address", "phone",
       
        "last_month_reading", "current_reading",
      
        "consumption", "tariff_per_unit", "last_updated",
      
        "paid", "paid_date"
    ]
    df = df[cols]
  
    atomic_save(df, DATA_FILE)
    logger.info("Saved data (rows=%d).", len(df))

def next_customer_id(df: pd.DataFrame) -> int:
    
    if df.empty:
        return 1
    maxid = int(pd.to_numeric(df["customer_id"], errors="coerce").fillna(0).max())
   
    return maxid + 1

# =====================================================
# PART 2: ADMIN CRUD OPERATIONS
# Aditya Wankhade
# =====================================================

def read_int(prompt: str, default: int = None) -> int:
    while True:
        val = input(prompt).strip()
        if val == "" and default is not None:
            return default
        if val.isdigit():
            return int(val)
        print("Please enter a valid integer.")

def read_float(prompt: str, default: float = None) -> float:
    while True:
        val = input(prompt).strip()
        if val == "" and default is not None:
            return default
        try:
            return float(val)
        except ValueError:
            print("Please enter a valid number (e.g., 123.45).")

def confirm(prompt: str = "Are you sure? (y/n): ") -> bool:
    ans = input(prompt).strip().lower()
    return ans in ("y", "yes")

def add_customer() -> None:
    df = load_data()
    cid = next_customer_id(df)
    print(f"\n--- Add Customer (ID will be {cid}) ---")
    name = input("Name: ").strip() or f"Customer{cid}"
    address = input("Address: ").strip()
    phone = input("Phone: ").strip()
    last_read = read_float("Last month reading (units) [0]: ", default=0.0)
    tariff = read_float("Tariff per unit [1.0]: ", default=1.0)

    new = {
        "customer_id": cid,
        "name": name,
        "address": address,
        "phone": phone,
        "last_month_reading": last_read,
        "current_reading": last_read,
        "consumption": 0.0,
        "tariff_per_unit": tariff,
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "paid": False,
        "paid_date": ""
    }
    df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
    save_data(df)
    print(f"✅ Added customer {cid} - {name}")
    logger.info("Added customer id=%s, name=%s", cid, name)

def update_consumption() -> None:
    df = load_data()
    if df.empty:
        print("No customers yet.")
        return
    cid = read_int("Enter customer ID to update reading: ")
    if cid not in df["customer_id"].values:
        print("Customer not found.")
        return
    idx = df.index[df["customer_id"] == cid][0]
    prev = float(df.at[idx, "current_reading"])
    print(f"Previous current reading: {prev}")
    new_read = read_float("Enter new current reading: ", default=prev)
    df.at[idx, "last_month_reading"] = prev
    df.at[idx, "current_reading"] = new_read
    df.at[idx, "consumption"] = new_read - prev
    df.at[idx, "last_updated"] = datetime.now().strftime("%Y-%m-%d")
    df.at[idx, "paid"] = False
    df.at[idx, "paid_date"] = ""
    save_data(df)
    print("✅ Consumption updated.")
    logger.info("Updated consumption for customer_id=%s : prev=%s new=%s", cid, prev, new_read)

def delete_customer() -> None:
    df = load_data()
    if df.empty:
        print("No customers to delete.")
        return
    cid = read_int("Enter customer ID to delete: ")
    if cid not in df["customer_id"].values:
        print("Customer not found.")
        return
    if confirm(f"Delete customer {cid}? This action will backup current file before removing. (y/n): "):
        backup_data()
        df = df[df["customer_id"] != cid].reset_index(drop=True)
        save_data(df)
        print(f"✅ Customer {cid} removed.")
        logger.info("Deleted customer id=%s", cid)
    else:
        print("Delete cancelled.")

def view_all_customers(limit: int = None) -> None:
    df = load_data()
    if df.empty:
        print("No data.")
        return
    disp = df.copy()
    disp["bill_amount"] = disp.apply(calculate_bill_row, axis=1)
    if limit:
        print(disp.head(limit).to_string(index=False))
    else:
        print(disp.to_string(index=False))

# =====================================================
# PART 3: ADVANCED ADMIN FEATURES
# Darshan
# =====================================================

def recalc_consumption_for(idx: int, df: pd.DataFrame) -> pd.DataFrame:
    prev = float(df.at[idx, "last_month_reading"])
    curr = float(df.at[idx, "current_reading"])
    df.at[idx, "consumption"] = curr - prev
    df.at[idx, "last_updated"] = datetime.now().strftime("%Y-%m-%d")
    return df

def calculate_bill_row(row: Any) -> float:
    cons = float(row.get("consumption", 0.0))
    tariff = float(row.get("tariff_per_unit", 1.0))
    return round(cons * tariff, 2)

def summary_report() -> None:
    df = load_data()
    if df.empty:
        print("No data.")
        return
    cons = df["consumption"].astype(float).to_numpy()
    total = np.nansum(cons)
    avg = np.nanmean(cons) if len(cons) else 0.0
    highest = np.nanmax(cons) if len(cons) else 0.0
    p90 = float(np.nanpercentile(cons, 90)) if len(cons) else 0.0
    print("\n--- SUMMARY ---")
    print(f"Total consumption: {total:.2f} units")
    print(f"Average consumption: {avg:.2f} units")
    print(f"Highest consumption: {highest:.2f} units")
    print(f"90th percentile: {p90:.2f} units")
    top = df.sort_values("consumption", ascending=False).head(5)[["customer_id", "name", "consumption"]]
    print("\nTop 5 Consumers:")
    print(top.to_string(index=False))

def export_bills() -> None:
    df = load_data()
    if df.empty:
        print("No data to bill.")
        return
    now = datetime.now()
    fname = os.path.join(BILL_FOLDER, f"bills_{now.strftime('%Y_%m')}.csv")
    out = df.copy()
    out["bill_amount"] = out.apply(calculate_bill_row, axis=1)
    out["bill_generated_on"] = now.strftime("%Y-%m-%d")
    atomic_save(out, fname)
    print(f"💾 Bills exported to {fname}")
    logger.info("Exported bills to %s", fname)

def update_tariff() -> None:
    df = load_data()
    print("1) Update single customer tariff\n2) Update tariff for all customers")
    ch = input("Choice: ").strip()
    if ch == "1":
        cid = read_int("Customer ID: ")
        if cid not in df["customer_id"].values:
            print("Customer not found.")
            return
        new_tariff = read_float("New tariff per unit: ")
        idx = df.index[df["customer_id"] == cid][0]
        df.at[idx, "tariff_per_unit"] = new_tariff
        save_data(df)
        print("✅ Tariff updated for customer.")
        logger.info("Tariff updated for customer_id=%s to %s", cid, new_tariff)
    elif ch == "2":
        new_tariff = read_float("New global tariff per unit: ")
        df["tariff_per_unit"] = new_tariff
        save_data(df)
        print("✅ Global tariff updated.")
        logger.info("Global tariff updated to %s", new_tariff)
    else:
        print("Invalid choice.")

def mark_paid() -> None:
    df = load_data()
    cid = read_int("Enter customer ID to mark bill paid: ")
    if cid not in df["customer_id"].values:
        print("Customer not found.")
        return
    idx = df.index[df["customer_id"] == cid][0]
    df.at[idx, "paid"] = True
    df.at[idx, "paid_date"] = datetime.now().strftime("%Y-%m-%d")
    save_data(df)
    print(f"✅ Customer {cid} marked as PAID.")
    logger.info("Marked paid customer_id=%s", cid)

def list_overdue() -> None:
    df = load_data()
    if df.empty:
        print("No data.")
        return
    df["last_updated_dt"] = pd.to_datetime(df["last_updated"], errors="coerce")
    cutoff = datetime.now() - timedelta(days=OVERDUE_DAYS)
    overdue = df[(df["paid"] == False) & (df["last_updated_dt"] < cutoff)]
    if overdue.empty:
        print("No overdue accounts.")
    else:
        print("Overdue accounts:")
        print(overdue[["customer_id", "name", "phone", "last_updated", "consumption"]].to_string(index=False))
    df.drop(columns=["last_updated_dt"], inplace=True, errors="ignore")

def search_customer() -> None:
    df = load_data()
    q = input("Search by name or phone (partial OK): ").strip().lower()
    if q == "":
        print("Empty query.")
        return
    hits = df[df["name"].str.lower().str.contains(q, na=False) | df["phone"].str.contains(q, na=False)]
    if hits.empty:
        print("No matches.")
    else:
        hits["bill_amount"] = hits.apply(calculate_bill_row, axis=1)
        print(hits.to_string(index=False))

def backup_data() -> None:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = os.path.join(BACKUP_FOLDER, f"backup_{ts}.csv")
    shutil.copyfile(DATA_FILE, dest)
    print(f"🔁 Backup created: {dest}")
    logger.info("Backup created: %s", dest)

# =====================================================
# PART 4: CLIENT INTERFACE & MAIN MENU
# Ritwik
# =====================================================

def client_register() -> None:
    print("\n--- Client Registration ---")
    add_customer()

def client_view() -> None:
    df = load_data()
    cid = read_int("Enter your customer ID: ")
    rec = df[df["customer_id"] == cid]
    if rec.empty:
        print("Customer not found.")
        return
    rec = rec.iloc[0].to_dict()
    bill = calculate_bill_row(rec)
    print("\n--- Your Record ---")
    print(f"ID: {rec['customer_id']}")
    print(f"Name: {rec['name']}")
    print(f"Phone: {rec['phone']}")
    print(f"Last reading: {rec['last_month_reading']}  Current: {rec['current_reading']}")
    print(f"Consumption: {rec['consumption']} units")
    print(f"Tariff: {rec['tariff_per_unit']}")
    print(f"Bill Amount: {bill:.2f}")
    print(f"Paid: {rec.get('paid', False)}  Paid date: {rec.get('paid_date', '')}")

def import_customers_from_csv(path: str) -> None:
    """
    Bulk import customers from a CSV with columns: name,address,phone,last_reading,tariff
    customer_id will be auto-assigned.
    """
    if not os.path.exists(path):
        print("File not found:", path)
        return
    df_src = pd.read_csv(path, dtype=str)
    df = load_data()
    next_id = next_customer_id(df)
    added = 0
    for _, row in df_src.iterrows():
        try:
            name = row.get("name", f"Customer{next_id}")[:50]
            address = row.get("address", "")
            phone = row.get("phone", "")
            last_read = float(row.get("last_reading", 0) or 0)
            tariff = float(row.get("tariff", 1.0) or 1.0)
        except Exception:
            continue
        new = {
            "customer_id": next_id,
            "name": name,
            "address": address,
            "phone": phone,
            "last_month_reading": last_read,
            "current_reading": last_read,
            "consumption": 0.0,
            "tariff_per_unit": tariff,
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "paid": False,
            "paid_date": ""
        }
        df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
        next_id += 1
        added += 1
    save_data(df)
    print(f"Imported {added} customers from {path}")
    logger.info("Imported %d customers from %s", added, path)

def client_menu() -> None:
    while True:
        print("\n==== CLIENT MENU ====")
        print("1. Register")
        print("2. View My Record")
        print("0. Back")
        ch = input("Enter choice: ").strip()
        if ch == "1":
            client_register()
        elif ch == "2":
            client_view()
        elif ch == "0":
            break
        else:
            print("Invalid option.")

def admin_menu() -> None:
    while True:
        print("\n==== ADMIN MENU ====")
        print("1. Add Customer")
        print("2. Update Consumption")
        print("3. Delete Customer")
        print("4. View All Customers")
        print("5. Summary Report")
        print("6. Export Bills CSV")
        print("7. Update Tariff")
        print("8. Mark Bill Paid")
        print("9. List Overdue Accounts")
        print("10. Search Customer")
        print("11. Backup Data")
        print("12. Import customers from CSV")
        print("0. Logout")
        ch = input("Choice: ").strip()
        if ch == "1":
            add_customer()
        elif ch == "2":
            update_consumption()
        elif ch == "3":
            delete_customer()
        elif ch == "4":
            view_all_customers(limit=None)
        elif ch == "5":
            summary_report()
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
            path = input("Enter CSV path to import: ").strip()
            import_customers_from_csv(path)
        elif ch == "0":
            break
        else:
            print("Invalid option.")

def main_menu() -> None:
    init_storage()
    while True:
        print("\n💧 WATER UTILITY CONSUMPTION PORTAL (ENHANCED) 💧")
        print("1. Admin Login")
        print("2. Client Access")
        print("3. Demo: populate sample data")
        print("0. Exit")
        ch = input("Enter choice: ").strip()
        if ch == "1":
            pw = input("Enter admin password: ").strip()
            if pw == ADMIN_PASS:
                admin_menu()
            else:
                print("❌ Incorrect password.")
        elif ch == "2":
            client_menu()
        elif ch == "3":
            if confirm("This will create sample customers (for demo). Continue? (y/n): "):
                create_demo_data()
        elif ch == "0":
            print("Exiting... Goodbye!")
            break
        else:
            print("Invalid option.")

# =====================================================
# DEMO DATA & HELPERS
# =====================================================

def create_demo_data() -> None:
    df = load_data()
    if not df.empty:
        print("Warning: Existing data found. Use import or backup if needed.")
    sample = [
        ("Ravi Kumar", "Vellore", "9000000001", 420, 2.5),
        ("Sneha Patel", "Chennai", "9000000002", 305, 2.5),
        ("Amit Singh", "Bangalore", "9000000003", 640, 2.0),
        ("Meera Rao", "Hyderabad", "9000000004", 150, 3.0),
        ("Karan Iyer", "Coimbatore", "9000000005", 275, 2.2)
    ]
    next_id = next_customer_id(df)
    added = 0
    for name, addr, phone, last_read, tariff in sample:
        new = {
            "customer_id": next_id,
            "name": name,
            "address": addr,
            "phone": phone,
            "last_month_reading": last_read,
            "current_reading": last_read,
            "consumption": 0.0,
            "tariff_per_unit": tariff,
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "paid": False,
            "paid_date": ""
        }
        df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
        next_id += 1
        added += 1
    save_data(df)
    print(f"Demo: Added {added} sample customers.")
    logger.info("Demo data created (%d rows).", added)

# =====================================================
# ENTRY POINT
# =====================================================

def cli_arg_dispatch():
    # Very simple CLI arg support: allow "demo" arg
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ("demo", "--demo", "sample"):
            init_storage()
            create_demo_data()
            main_menu()
            sys.exit(0)
        else:
            print("Unknown arg:", arg)

if __name__ == "__main__":
    try:
        cli_arg_dispatch()
        main_menu()
    except KeyboardInterrupt:
        print("\nInterrupted by user. Exiting.")
    except Exception as e:
        logger.exception("Unhandled exception: %s", e)
        print("An unexpected error occurred. See portal.log for details.")

