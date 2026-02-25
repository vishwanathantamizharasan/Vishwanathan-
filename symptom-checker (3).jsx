import { useState } from "react";

// ── Haversine distance ────────────────────────────────────────────────────────
function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── Admin config ──────────────────────────────────────────────────────────────
const ADMIN_MOBILE = "8050200772";

// ── Simulated bookings store (in-memory) ─────────────────────────────────────
const BOOKINGS_STORE = [
  { id:"BK001", name:"Ananya Krishnan",  mobile:"9876543210", age:34, sex:"Female", condition:"Common Cold",   provider:"A P Clinic Family Health Care Centre",  date:"2026-02-22", time:"10:00 AM", status:"confirmed" },
  { id:"BK002", name:"Ravi Subramaniam", mobile:"9123456780", age:52, sex:"Male",   condition:"Cardiac Issue", provider:"Naruvi Hospitals",                       date:"2026-02-23", time:"9:00 AM",  status:"confirmed" },
  { id:"BK003", name:"Priya Menon",      mobile:"8765432190", age:27, sex:"Female", condition:"Migraine",      provider:"Shine Neuro & Spine Centre",             date:"2026-02-24", time:"11:00 AM", status:"pending"   },
  { id:"BK004", name:"Karthik Rajesh",   mobile:"7654321890", age:19, sex:"Male",   condition:"Dengue Fever",  provider:"Vellore CMC Hospital",                   date:"2026-02-25", time:"3:00 PM",  status:"confirmed" },
  { id:"BK005", name:"Deepa Natarajan",  mobile:"9988776655", age:45, sex:"Female", condition:"Arthritis",     provider:"Nalam Medical Center and Hospital",       date:"2026-02-26", time:"2:00 PM",  status:"pending"   },
];

// ── Real Vellore Providers ────────────────────────────────────────────────────
const ALL_PROVIDERS = [
  { id:1,  name:"Naruvi Hospitals",                    type:"hospital", subtitle:"Multi-Speciality · 24/7 Emergency",                  specialties:["General Practice","Cardiology","Gastroenterology","Pulmonology","Infectious Disease","Allergy & Immunology","Rheumatology"], rating:4.6, reviews:5290,  address:"72, Collector's Office Rd, Thottapalayam, Vellore 632004", hours:"Open 24 Hours, 7 Days", lat:12.9353, lng:79.1413, mapUrl:"https://maps.google.com/?q=Naruvi+Hospitals+Vellore" },
  { id:2,  name:"Vellore CMC Hospital",                type:"hospital", subtitle:"Christian Medical College · World-class Tertiary Care", specialties:["General Practice","Neurology","Cardiology","Gastroenterology","Pulmonology","Infectious Disease","Rheumatology","Allergy & Immunology"], rating:3.5, reviews:892,   address:"IDA Scudder Rd, Vellore 632004",                           hours:"Open 24 Hours, 7 Days", lat:12.9244, lng:79.1357, mapUrl:"https://maps.google.com/?q=CMC+Hospital+Vellore" },
  { id:3,  name:"Sri Narayani Hospital & Research Centre", type:"hospital", subtitle:"Multi-Speciality · 24/7 Emergency",               specialties:["General Practice","Neurology","Cardiology","Gastroenterology","Infectious Disease","Rheumatology"], rating:4.5, reviews:3413, address:"Azad Rd, Thirumalaikodi, Vellore 632055",                    hours:"Open 24 Hours, 7 Days", lat:12.8705, lng:79.0900, mapUrl:"https://maps.google.com/?q=Sri+Narayani+Hospital+Vellore" },
  { id:4,  name:"Dr. Sivakumar Multi Speciality Hospital", type:"hospital", subtitle:"DRSKMH · 24/7 Emergency · Gynaecology, Surgery",  specialties:["General Practice","Cardiology","Gastroenterology","Allergy & Immunology"], rating:4.6, reviews:968,  address:"C-3, Arcot Rd, opp. Collector Office, Sathuvachari, Vellore 632009", hours:"Open 24 Hours, 7 Days", lat:12.9344, lng:79.1525, mapUrl:"https://maps.google.com/?q=Dr+Sivakumar+Multi+Speciality+Hospital+Vellore" },
  { id:5,  name:"Shine Neuro & Spine Centre",           type:"doctor",   subtitle:"Dr. Sangeetha J · Neurologist & Spine Specialist",   specialties:["Neurology"], rating:4.8, reviews:345,  address:"19, Thennamara St, near Hotel Ranga, Kosapet, Vellore 632001", hours:"Mon–Sat: 9 AM–6 PM | Sun: 10 AM–1 PM", lat:12.9141, lng:79.1332, mapUrl:"https://maps.google.com/?q=Shine+Neuro+Spine+Centre+Vellore" },
  { id:6,  name:"Dr. A. Divya – General Physician",     type:"doctor",   subtitle:"Fever & Diabetes · 7,000+ Patients · Naruvi Hospital", specialties:["General Practice","Infectious Disease"], rating:4.0, reviews:1,  address:"Naruvi Hospital, Samuel Nagar, Thottapalayam, Vellore 632004", hours:"Mon–Sun: 8 AM–7 PM", lat:12.9351, lng:79.1414, mapUrl:"https://maps.google.com/?q=Naruvi+Hospitals+Vellore" },
  { id:7,  name:"A P Clinic Family Health Care Centre", type:"doctor",   subtitle:"Dr. Vasanth Raj · Family & General Medicine",          specialties:["General Practice","Infectious Disease"], rating:4.9, reviews:86,  address:"No 503, Phase-1 17th Cross Rd, Sathuvachari, Vellore 632009", hours:"Mon–Sun: 8 AM–1 PM & 5–9 PM", lat:12.9385, lng:79.1690, mapUrl:"https://maps.google.com/?q=AP+Clinic+Family+Health+Care+Sathuvachari+Vellore" },
  { id:8,  name:"Dr. Jayashree Lakshman Clinic",        type:"doctor",   subtitle:"General Physician · Fever, Back Pain, Acute Care",     specialties:["General Practice","Rheumatology"], rating:4.7, reviews:15,  address:"29, 1st East Main Rd, Gandhi Nagar, Vellore 632006", hours:"Mon–Sun: 10:30 AM–9 PM", lat:12.9513, lng:79.1377, mapUrl:"https://maps.google.com/?q=Dr+Jayashree+Lakshman+Clinic+Vellore" },
  { id:9,  name:"Vellore ENT & Allergy Centre",         type:"doctor",   subtitle:"Dr. Fayaz · ENT, Allergy & Asthma Specialist",         specialties:["Allergy & Immunology"], rating:3.7, reviews:216, address:"1315, South Avenue Rd, Sathuvachari, Vellore 632009", hours:"Mon–Sat: 8 AM–8:30 PM | Sun: 8 AM–12 PM", lat:12.9343, lng:79.1589, mapUrl:"https://maps.google.com/?q=Vellore+Speciality+Centre+Sathuvachari" },
  { id:10, name:"Nalam Medical Center and Hospital",    type:"hospital", subtitle:"Multi-Speciality · Ortho, Paediatrics, Medicine",      specialties:["General Practice","Rheumatology","Gastroenterology"], rating:3.6, reviews:415, address:"44, Arcot Road, Phase 2, Sathuvachari, Vellore 632009", hours:"Open 24 Hours, 7 Days", lat:12.9349, lng:79.1537, mapUrl:"https://maps.google.com/?q=Nalam+Medical+Center+Vellore" },
  { id:11, name:"Divya Clinic",                         type:"doctor",   subtitle:"Dr. Anitha · General Physician, Online Consult Available", specialties:["General Practice","Infectious Disease"], rating:5.0, reviews:17, address:"No 1C, East Coast Rd, Ezhil Nagar, Allapuram, Vellore 632002", hours:"Mon–Sat: 10 AM–1 PM & 5–9 PM | Sun: Closed", lat:12.8941, lng:79.1271, mapUrl:"https://maps.google.com/?q=Divya+Clinic+Allapuram+Vellore" },
  { id:12, name:"Dr. Prasannakumar's Clinic",           type:"doctor",   subtitle:"Paediatrician · Child & Infant Specialist",             specialties:["General Practice","Infectious Disease"], rating:4.9, reviews:249, address:"535, 40th St, Phase 2, Sathuvachari, Vellore 632009", hours:"Call clinic for timings", lat:12.9341, lng:79.1578, mapUrl:"https://maps.google.com/?q=Dr+Prasannakumar+Clinic+Sathuvachari+Vellore" },
];

const AREA_COORDS = {
  "sathuvachari":  { lat:12.9350, lng:79.1530, label:"Sathuvachari, Vellore" },
  "katpadi":       { lat:12.9716, lng:79.1442, label:"Katpadi, Vellore" },
  "kosapet":       { lat:12.9155, lng:79.1338, label:"Kosapet, Vellore" },
  "gandhi nagar":  { lat:12.9510, lng:79.1375, label:"Gandhi Nagar, Vellore" },
  "vellore":       { lat:12.9165, lng:79.1325, label:"Vellore" },
  "bagayam":       { lat:12.9028, lng:79.1524, label:"Bagayam, Vellore" },
  "thottapalayam": { lat:12.9353, lng:79.1413, label:"Thottapalayam, Vellore" },
  "allapuram":     { lat:12.8941, lng:79.1271, label:"Allapuram, Vellore" },
  "thirumalaikodi":{ lat:12.8705, lng:79.0900, label:"Thirumalaikodi, Vellore" },
  "cmc":           { lat:12.9244, lng:79.1357, label:"CMC Area, Vellore" },
};

const SYMPTOMS = ["Fever","Cough","Headache","Fatigue","Sore Throat","Shortness of Breath","Chest Pain","Nausea","Vomiting","Diarrhea","Abdominal Pain","Back Pain","Joint Pain","Skin Rash","Runny Nose","Loss of Taste/Smell","Dizziness","Muscle Aches","Swollen Lymph Nodes","Night Sweats"];

const DISEASE_MAP = [
  { disease:"COVID-19",          symptoms:["Fever","Cough","Fatigue","Loss of Taste/Smell","Shortness of Breath","Muscle Aches"], specialty:"Infectious Disease",   icon:"🦠", severity:"moderate", description:"A viral respiratory illness caused by SARS-CoV-2." },
  { disease:"Common Cold",       symptoms:["Runny Nose","Sore Throat","Cough","Headache","Fatigue"],                              specialty:"General Practice",     icon:"🤧", severity:"mild",     description:"A mild viral infection of the upper respiratory tract." },
  { disease:"Influenza",         symptoms:["Fever","Muscle Aches","Fatigue","Headache","Cough","Sore Throat"],                   specialty:"General Practice",     icon:"🌡️", severity:"moderate", description:"A contagious respiratory illness caused by influenza viruses." },
  { disease:"Gastroenteritis",   symptoms:["Nausea","Vomiting","Diarrhea","Abdominal Pain","Fever"],                            specialty:"Gastroenterology",     icon:"🤢", severity:"moderate", description:"Inflammation of the stomach and intestines, often from infection." },
  { disease:"Migraine",          symptoms:["Headache","Nausea","Dizziness","Fatigue"],                                          specialty:"Neurology",            icon:"🧠", severity:"moderate", description:"A neurological condition causing intense, debilitating headaches." },
  { disease:"Pneumonia",         symptoms:["Fever","Cough","Shortness of Breath","Chest Pain","Fatigue"],                       specialty:"Pulmonology",          icon:"🫁", severity:"severe",   description:"Infection that inflames the air sacs in one or both lungs." },
  { disease:"Allergic Reaction", symptoms:["Skin Rash","Runny Nose","Shortness of Breath","Swollen Lymph Nodes"],              specialty:"Allergy & Immunology", icon:"🌸", severity:"mild",     description:"An immune system response to a foreign substance." },
  { disease:"Arthritis",         symptoms:["Joint Pain","Fatigue","Swollen Lymph Nodes","Back Pain"],                          specialty:"Rheumatology",         icon:"🦴", severity:"chronic",  description:"Inflammation of one or more joints causing pain and stiffness." },
  { disease:"Cardiac Issue",     symptoms:["Chest Pain","Shortness of Breath","Dizziness","Fatigue","Nausea"],                 specialty:"Cardiology",           icon:"❤️", severity:"severe",   description:"Conditions affecting the heart's structure or function." },
  { disease:"Dengue Fever",      symptoms:["Fever","Headache","Joint Pain","Muscle Aches","Skin Rash","Fatigue"],               specialty:"Infectious Disease",   icon:"🦟", severity:"severe",   description:"A mosquito-borne tropical disease caused by dengue viruses." },
];

const SEV = { mild:"#22c55e", moderate:"#f59e0b", severe:"#ef4444", chronic:"#8b5cf6" };
const SEV_BG = { mild:"rgba(34,197,94,.1)", moderate:"rgba(245,158,11,.1)", severe:"rgba(239,68,68,.1)", chronic:"rgba(139,92,246,.1)" };

const Label = ({ children }) => (
  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:1.5, color:"rgba(232,228,217,.4)", marginBottom:8, textTransform:"uppercase" }}>{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Global
  const [step, setStep]       = useState("login");   // login | location | symptoms | analyzing | result | booking | confirmed | admin
  const [loginRole, setLoginRole] = useState("user"); // "user" | "admin"
  const [errors, setErrors]   = useState({});
  const [loginError, setLoginError] = useState("");

  // ── Profile (user)
  const [profile, setProfile] = useState({ name:"", mobile:"", age:"", sex:"" });

  // ── Admin login
  const [adminMobile, setAdminMobile] = useState("");
  const [bookings, setBookings]       = useState(BOOKINGS_STORE);
  const [adminTab, setAdminTab]       = useState("bookings"); // "bookings" | "providers" | "stats"

  // ── Location
  const [locStatus, setLocStatus]   = useState("idle");
  const [userLoc, setUserLoc]       = useState(null);
  const [manualInput, setManualInput] = useState("");

  // ── Symptoms / diagnosis
  const [selected, setSelected]   = useState([]);
  const [progress, setProgress]   = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);
  const [providers, setProviders] = useState([]);

  // ── Booking
  const [provider, setProvider] = useState(null);
  const [form, setForm]         = useState({ date:"", time:"", note:"" });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  // User login validation
  const validateUser = () => {
    const e = {};
    if (!profile.name.trim())                                 e.name   = "Please enter your full name.";
    if (!/^[6-9]\d{9}$/.test(profile.mobile))                e.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (!profile.age || profile.age < 1 || profile.age > 120) e.age   = "Enter a valid age (1–120).";
    if (!profile.sex)                                         e.sex    = "Please select your sex.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUserLogin = () => {
    if (validateUser()) { setLoginError(""); setStep("location"); }
  };

  // Admin login validation
  const handleAdminLogin = () => {
    if (adminMobile.trim() === ADMIN_MOBILE) {
      setLoginError(""); setStep("admin");
    } else {
      setLoginError("Access denied. This mobile number is not authorised as admin.");
    }
  };

  // GPS
  const requestGPS = () => {
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLoc({ lat:pos.coords.latitude, lng:pos.coords.longitude, label:"Your Current Location" }); setLocStatus("granted"); },
      ()  => setLocStatus("denied"),
      { timeout:10000 }
    );
  };

  const applyManual = () => {
    const key = manualInput.trim().toLowerCase();
    const found = Object.entries(AREA_COORDS).find(([k]) => key.includes(k));
    setUserLoc(found ? found[1] : { lat:12.9165, lng:79.1325, label: manualInput||"Vellore" });
    setLocStatus("granted");
  };

  const setAreaQuick = (area) => {
    const key = area.toLowerCase();
    const found = Object.entries(AREA_COORDS).find(([k]) => key.includes(k)||k.includes(key));
    setUserLoc(found ? found[1] : { lat:12.9165, lng:79.1325, label:area });
    setLocStatus("granted");
  };

  // Symptom analysis
  const toggle = s => setSelected(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);

  const analyze = () => {
    if (!selected.length) return;
    setStep("analyzing"); setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random()*15+5;
      if (p >= 100) {
        p = 100; clearInterval(iv);
        const scores = DISEASE_MAP.map(d => ({
          ...d, score: d.symptoms.filter(s=>selected.includes(s)).length / Math.max(d.symptoms.length, selected.length),
        })).sort((a,b) => b.score-a.score);
        const dx = scores[0]; setDiagnosis(dx);
        const matched = ALL_PROVIDERS
          .filter(p => p.specialties.includes(dx.specialty))
          .map(p => ({ ...p, dist: userLoc ? distKm(userLoc.lat, userLoc.lng, p.lat, p.lng) : null }))
          .sort((a,b) => (a.dist??999)-(b.dist??999));
        setProviders(matched);
        setTimeout(() => setStep("result"), 500);
      }
      setProgress(Math.min(p,100));
    }, 120);
  };

  // Confirm booking — saves to store
  const confirmBooking = () => {
    const newBooking = {
      id: "BK" + String(bookings.length + 1).padStart(3,"0"),
      name: profile.name, mobile: profile.mobile,
      age: profile.age,   sex: profile.sex,
      condition: diagnosis?.disease || "",
      provider: provider?.name || "",
      date: form.date, time: form.time, status:"pending",
    };
    setBookings(prev => [newBooking, ...prev]);
    setStep("confirmed");
  };

  // Full reset
  const reset = () => {
    setStep("login"); setLoginRole("user"); setErrors({}); setLoginError("");
    setProfile({ name:"", mobile:"", age:"", sex:"" }); setAdminMobile("");
    setLocStatus("idle"); setUserLoc(null); setManualInput("");
    setSelected([]); setDiagnosis(null); setProviders([]);
    setProvider(null); setForm({ date:"", time:"", note:"" });
  };

  // Admin toggle booking status
  const toggleStatus = (id) => {
    setBookings(prev => prev.map(b => b.id===id ? { ...b, status: b.status==="confirmed"?"pending":"confirmed" } : b));
  };

  const USER_STEPS = ["location","symptoms","result","booking","confirmed"];
  const currentUserStep = USER_STEPS.indexOf(step==="analyzing"?"symptoms":step);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#080d17", fontFamily:"Georgia,serif", color:"#e8e4d9", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .pf{font-family:'Playfair Display',serif}
        .dm{font-family:'DM Sans',sans-serif}
        .gbg{position:fixed;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(212,175,100,.025) 1px,transparent 1px),
          linear-gradient(90deg,rgba(212,175,100,.025) 1px,transparent 1px);background-size:55px 55px}
        .orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none}
        .fade{animation:fi .5s cubic-bezier(.22,1,.36,1)}
        @keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .stagger>*{opacity:0;animation:fi .5s cubic-bezier(.22,1,.36,1) forwards}
        .stagger>*:nth-child(1){animation-delay:.05s}.stagger>*:nth-child(2){animation-delay:.12s}
        .stagger>*:nth-child(3){animation-delay:.19s}.stagger>*:nth-child(4){animation-delay:.26s}
        .stagger>*:nth-child(5){animation-delay:.33s}.stagger>*:nth-child(6){animation-delay:.40s}

        /* Role tabs */
        .role-tab{flex:1;padding:12px;text-align:center;font-family:'DM Sans',sans-serif;font-size:14px;
          font-weight:500;cursor:pointer;border-radius:7px;transition:all .25s;user-select:none;
          color:rgba(232,228,217,.45);border:1.5px solid transparent}
        .role-tab:hover{color:rgba(232,228,217,.7)}
        .role-tab.user-active{background:rgba(212,175,100,.15);border-color:rgba(212,175,100,.4);
          color:#f0d990;box-shadow:0 0 16px rgba(212,175,100,.12)}
        .role-tab.admin-active{background:rgba(96,165,250,.12);border-color:rgba(96,165,250,.4);
          color:#93c5fd;box-shadow:0 0 16px rgba(96,165,250,.12)}

        /* Buttons */
        .btn{background:linear-gradient(135deg,#d4af64,#b8943f);color:#080d17;border:none;
          padding:13px 36px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
          border-radius:6px;cursor:pointer;transition:all .25s;letter-spacing:.3px}
        .btn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(212,175,100,.3)}
        .btn:disabled{opacity:.38;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-admin{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;border:none;
          padding:13px 36px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
          border-radius:6px;cursor:pointer;transition:all .25s}
        .btn-admin:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(59,130,246,.3)}
        .btnO{background:transparent;color:#d4af64;border:1.5px solid rgba(212,175,100,.5);
          padding:11px 28px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:6px;
          cursor:pointer;transition:all .2s}
        .btnO:hover{background:rgba(212,175,100,.1)}
        .btnGPS{background:rgba(96,165,250,.1);color:#93c5fd;border:1.5px solid rgba(96,165,250,.3);
          padding:13px 24px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:6px;
          cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px;justify-content:center}
        .btnGPS:hover{background:rgba(96,165,250,.2);border-color:rgba(96,165,250,.6)}
        .btn-sm{padding:6px 14px;font-family:'DM Sans',sans-serif;font-size:12px;border-radius:5px;cursor:pointer;border:1px solid;transition:all .2s}

        /* Inputs */
        input,textarea,select{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
          color:#e8e4d9;padding:11px 15px;border-radius:6px;font-family:'DM Sans',sans-serif;
          font-size:14px;width:100%;outline:none;transition:border-color .2s;-webkit-appearance:none}
        input:focus,textarea:focus,select:focus{border-color:rgba(212,175,100,.55);box-shadow:0 0 0 3px rgba(212,175,100,.07)}
        input::placeholder,textarea::placeholder{color:rgba(232,228,217,.28)}
        input.err,select.err{border-color:rgba(239,68,68,.5)!important}
        .errtxt{font-family:'DM Sans',sans-serif;font-size:12px;color:#f87171;margin-top:5px}
        select option{background:#0f1829;color:#e8e4d9}

        /* Cards */
        .card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px}
        .pc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;
          padding:18px;transition:all .25s;cursor:pointer}
        .pc:hover{border-color:rgba(212,175,100,.4);background:rgba(212,175,100,.04);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)}

        /* Sex pills */
        .sex-pill{cursor:pointer;padding:10px 0;border-radius:6px;text-align:center;
          border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);
          color:rgba(232,228,217,.48);font-family:'DM Sans',sans-serif;font-size:13px;
          transition:all .2s;user-select:none;flex:1}
        .sex-pill:hover{border-color:rgba(212,175,100,.38)}
        .sex-pill.on{border-color:#d4af64;background:rgba(212,175,100,.14);color:#f0d990;box-shadow:0 0 12px rgba(212,175,100,.12)}

        /* Chips */
        .chip{cursor:pointer;padding:8px 16px;border-radius:50px;border:1.5px solid rgba(212,175,100,.28);
          background:rgba(212,175,100,.04);color:#c9b87a;font-family:'DM Sans',sans-serif;font-size:13px;
          transition:all .2s;user-select:none}
        .chip:hover{border-color:rgba(212,175,100,.55);background:rgba(212,175,100,.1)}
        .chip.on{background:rgba(212,175,100,.18);border-color:#d4af64;color:#f0d990;box-shadow:0 0 14px rgba(212,175,100,.16)}

        /* Badges */
        .bh{background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.25);padding:3px 10px;border-radius:50px;font-size:11px;font-family:'DM Sans',sans-serif}
        .bd{background:rgba(212,175,100,.1);color:#d4af64;border:1px solid rgba(212,175,100,.25);padding:3px 10px;border-radius:50px;font-size:11px;font-family:'DM Sans',sans-serif}
        .bo{background:rgba(34,197,94,.09);color:#22c55e;border:1px solid rgba(34,197,94,.25);padding:3px 10px;border-radius:50px;font-size:11px;font-family:'DM Sans',sans-serif}
        .distb{background:rgba(212,175,100,.08);color:#d4af64;border:1px solid rgba(212,175,100,.18);padding:3px 10px;border-radius:50px;font-size:11px;font-family:'DM Sans',sans-serif}
        .mb{display:inline-flex;align-items:center;gap:5px;background:rgba(96,165,250,.1);
          border:1px solid rgba(96,165,250,.25);color:#60a5fa;padding:6px 13px;border-radius:5px;
          font-family:'DM Sans',sans-serif;font-size:12px;text-decoration:none;transition:all .2s;cursor:pointer}
        .mb:hover{background:rgba(96,165,250,.2)}

        /* Progress dots */
        .pdot{height:5px;border-radius:3px;background:rgba(255,255,255,.12);transition:all .35s}
        .pdot.done{background:rgba(212,175,100,.5)}
        .pdot.active{background:#d4af64;box-shadow:0 0 8px rgba(212,175,100,.5)}

        /* Divider */
        .divider{display:flex;align-items:center;gap:12px;margin:16px 0}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}
        .divider span{font-family:'DM Sans',sans-serif;font-size:11px;color:rgba(232,228,217,.3);letter-spacing:1px;text-transform:uppercase}

        /* Admin tabs */
        .atab{padding:9px 20px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;
          border-radius:6px;border:1px solid transparent;color:rgba(232,228,217,.45);transition:all .2s}
        .atab:hover{color:rgba(232,228,217,.75)}
        .atab.on{background:rgba(96,165,250,.12);border-color:rgba(96,165,250,.3);color:#93c5fd}

        /* Admin stat card */
        .stat-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:20px;text-align:center}

        /* Status badge */
        .status-confirmed{background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.3);padding:3px 10px;border-radius:50px;font-size:11px;font-family:'DM Sans',sans-serif}
        .status-pending{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.3);padding:3px 10px;border-radius:50px;font-size:11px;font-family:'DM Sans',sans-serif}

        /* Spin */
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .spin{animation:spin 1.2s linear infinite;display:inline-block}

        /* Symptom scroll */
        .symptom-wrap{display:flex;flex-wrap:wrap;gap:9px;max-height:280px;overflow-y:auto;padding-right:4px}
        .symptom-wrap::-webkit-scrollbar{width:4px}
        .symptom-wrap::-webkit-scrollbar-thumb{background:rgba(212,175,100,.3);border-radius:2px}

        /* Table */
        .tbl{width:100%;border-collapse:collapse}
        .tbl th{font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:1.5px;color:rgba(232,228,217,.38);
          text-transform:uppercase;padding:10px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,.07)}
        .tbl td{font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(232,228,217,.8);
          padding:12px 12px;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:middle}
        .tbl tr:hover td{background:rgba(255,255,255,.02)}

        .accent-line{width:48px;height:3px;background:linear-gradient(90deg,#d4af64,#8b6914);border-radius:2px;margin-bottom:22px}
        .admin-accent-line{width:48px;height:3px;background:linear-gradient(90deg,#3b82f6,#1d4ed8);border-radius:2px;margin-bottom:22px}
      `}</style>

      {/* ── Background ── */}
      <div className="gbg"/>
      <div className="orb" style={{width:500,height:500,top:-150,right:-150,background:"#d4af64",opacity:.1}}/>
      <div className="orb" style={{width:380,height:380,bottom:40,left:-120,background:"#3b82f6",opacity:.1}}/>
      <div className="orb" style={{width:220,height:220,top:"40%",left:"38%",background:"#8b5cf6",opacity:.05}}/>

      {/* ══════════════════════════════════════════════
          TOP BAR
      ══════════════════════════════════════════════ */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,.06)",padding:"15px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:10,backdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#d4af64,#8b6914)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 4px 14px rgba(212,175,100,.25)"}}>⚕</div>
          <div>
            <div className="pf" style={{fontSize:17,fontWeight:700,letterSpacing:.3}}>MediSense AI</div>
            <div className="dm" style={{fontSize:9,color:"rgba(232,228,217,.32)",letterSpacing:2}}>VELLORE · REAL PROVIDERS</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {step!=="login" && step!=="admin" && (
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              {USER_STEPS.map((s,i) => (
                <div key={s} className={`pdot ${i<currentUserStep?"done":i===currentUserStep?"active":""}`} style={{width:i===currentUserStep?22:8}}/>
              ))}
            </div>
          )}
          {step==="admin" && (
            <span className="dm" style={{fontSize:12,background:"rgba(96,165,250,.12)",border:"1px solid rgba(96,165,250,.3)",color:"#93c5fd",padding:"4px 12px",borderRadius:50}}>🛡 Admin Panel</span>
          )}
          {(profile.name || step==="admin") && (
            <div onClick={reset} style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:50,padding:"5px 14px 5px 5px",cursor:"pointer"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background: step==="admin"?"linear-gradient(135deg,#3b82f6,#1d4ed8)":"linear-gradient(135deg,#d4af64,#8b6914)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>
                {step==="admin" ? "A" : profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.6)"}}>
                {step==="admin" ? "Admin" : profile.name.split(" ")[0]}
              </span>
              <span className="dm" style={{fontSize:11,color:"rgba(232,228,217,.3)"}}>· Logout</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════════════ */}
      <div style={{maxWidth:900,margin:"0 auto",padding:"50px 22px 80px",position:"relative",zIndex:10}}>

        {/* ════════════════════════════
            LOGIN PAGE
        ════════════════════════════ */}
        {step==="login" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",minHeight:"78vh"}}>

            {/* Left branding */}
            <div className="stagger">
              <div className="accent-line"/>
              <div className="dm" style={{fontSize:11,letterSpacing:3,color:"#d4af64",marginBottom:12}}>WELCOME TO</div>
              <h1 className="pf" style={{fontSize:"clamp(30px,4.2vw,50px)",fontWeight:900,lineHeight:1.15,marginBottom:18}}>
                Your Personal<br/><em style={{color:"#d4af64"}}>Health Assistant</em>
              </h1>
              <p className="dm" style={{fontSize:15,color:"rgba(232,228,217,.5)",lineHeight:1.85,marginBottom:32}}>
                AI-powered symptom analysis connected to <strong style={{color:"rgba(232,228,217,.72)"}}>real hospitals & doctors in Vellore</strong>, sorted by distance from your location.
              </p>
              {[
                { icon:"🔬", title:"AI Symptom Analysis",      desc:"Smart matching across 10+ conditions"    },
                { icon:"📍", title:"Nearest Hospitals First",   desc:"GPS-based distance sorting in Vellore"   },
                { icon:"📅", title:"Instant Booking",           desc:"Schedule appointments in seconds"        },
                { icon:"🛡", title:"Admin Dashboard",           desc:"Manage all bookings & providers easily"  },
              ].map(f => (
                <div key={f.title} style={{display:"flex",gap:13,alignItems:"flex-start",marginBottom:14}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"rgba(212,175,100,.08)",border:"1px solid rgba(212,175,100,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{f.icon}</div>
                  <div>
                    <div className="dm" style={{fontSize:13,fontWeight:600,color:"#e8e4d9",marginBottom:2}}>{f.title}</div>
                    <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.4)"}}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — form card */}
            <div className="stagger">
              <div className="card" style={{padding:"32px 28px",borderColor:"rgba(212,175,100,.1)"}}>

                {/* ── Role toggle tabs ── */}
                <div style={{display:"flex",gap:8,marginBottom:28,background:"rgba(255,255,255,.03)",padding:6,borderRadius:10,border:"1px solid rgba(255,255,255,.07)"}}>
                  <div
                    className={`role-tab ${loginRole==="user"?"user-active":""}`}
                    onClick={()=>{ setLoginRole("user"); setLoginError(""); setErrors({}); }}
                  >
                    👤 User Login
                  </div>
                  <div
                    className={`role-tab ${loginRole==="admin"?"admin-active":""}`}
                    onClick={()=>{ setLoginRole("admin"); setLoginError(""); setErrors({}); }}
                  >
                    🛡 Admin Login
                  </div>
                </div>

                {/* ─── USER FORM ─── */}
                {loginRole==="user" && (
                  <div>
                    <div className="pf" style={{fontSize:21,fontWeight:700,marginBottom:5}}>Create your profile</div>
                    <div className="dm" style={{fontSize:13,color:"rgba(232,228,217,.4)",marginBottom:24,lineHeight:1.6}}>Your info helps us personalise recommendations.</div>

                    {/* Name */}
                    <div style={{marginBottom:16}}>
                      <Label>Full Name</Label>
                      <input className={errors.name?"err":""} placeholder="e.g. Ravi Kumar"
                        value={profile.name}
                        onChange={e=>{ setProfile({...profile,name:e.target.value}); setErrors({...errors,name:""}); }}
                        onKeyDown={e=>e.key==="Enter"&&handleUserLogin()}
                      />
                      {errors.name&&<div className="errtxt">⚠ {errors.name}</div>}
                    </div>

                    {/* Mobile */}
                    <div style={{marginBottom:16}}>
                      <Label>Mobile Number</Label>
                      <div style={{position:"relative"}}>
                        <span className="dm" style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(232,228,217,.4)",pointerEvents:"none"}}>+91</span>
                        <input className={errors.mobile?"err":""} style={{paddingLeft:42}}
                          placeholder="9XXXXXXXXX" maxLength={10}
                          value={profile.mobile}
                          onChange={e=>{ setProfile({...profile,mobile:e.target.value.replace(/\D/,"")}); setErrors({...errors,mobile:""}); }}
                          onKeyDown={e=>e.key==="Enter"&&handleUserLogin()}
                        />
                      </div>
                      {errors.mobile&&<div className="errtxt">⚠ {errors.mobile}</div>}
                    </div>

                    {/* Age + Sex */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                      <div>
                        <Label>Age</Label>
                        <input className={errors.age?"err":""} type="number" min={1} max={120} placeholder="e.g. 28"
                          value={profile.age}
                          onChange={e=>{ setProfile({...profile,age:e.target.value}); setErrors({...errors,age:""}); }}
                        />
                        {errors.age&&<div className="errtxt">⚠ {errors.age}</div>}
                      </div>
                      <div>
                        <Label>Sex</Label>
                        <div style={{display:"flex",gap:6}}>
                          {["Male","Female","Other"].map(s=>(
                            <div key={s} className={`sex-pill ${profile.sex===s?"on":""}`}
                              onClick={()=>{ setProfile({...profile,sex:s}); setErrors({...errors,sex:""}); }}>
                              {s==="Male"?"♂":s==="Female"?"♀":"⚧"}<br/>
                              <span style={{fontSize:11}}>{s}</span>
                            </div>
                          ))}
                        </div>
                        {errors.sex&&<div className="errtxt">⚠ {errors.sex}</div>}
                      </div>
                    </div>

                    <button className="btn" style={{width:"100%",padding:14,fontSize:15}} onClick={handleUserLogin}>
                      Get Started →
                    </button>
                    <div className="dm" style={{fontSize:11,color:"rgba(232,228,217,.25)",textAlign:"center",marginTop:14,lineHeight:1.7}}>🔒 Your data stays on this device and is never shared.</div>
                  </div>
                )}

                {/* ─── ADMIN FORM ─── */}
                {loginRole==="admin" && (
                  <div>
                    <div style={{textAlign:"center",marginBottom:24}}>
                      <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,rgba(59,130,246,.2),rgba(29,78,216,.3))",border:"1.5px solid rgba(96,165,250,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px"}}>🛡</div>
                      <div className="pf" style={{fontSize:21,fontWeight:700,marginBottom:5}}>Admin Access</div>
                      <div className="dm" style={{fontSize:13,color:"rgba(232,228,217,.4)",lineHeight:1.6}}>Restricted to authorised personnel only.</div>
                    </div>

                    <div style={{marginBottom:18}}>
                      <Label>Admin Mobile Number</Label>
                      <div style={{position:"relative"}}>
                        <span className="dm" style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"rgba(232,228,217,.4)",pointerEvents:"none"}}>+91</span>
                        <input
                          className={loginError?"err":""}
                          style={{paddingLeft:42}}
                          placeholder="Enter authorised number"
                          maxLength={10} type="tel"
                          value={adminMobile}
                          onChange={e=>{ setAdminMobile(e.target.value.replace(/\D/,"")); setLoginError(""); }}
                          onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()}
                        />
                      </div>
                      {loginError && (
                        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,padding:"10px 14px",marginTop:10}}>
                          <span>🔒</span>
                          <div className="dm" style={{fontSize:12,color:"#f87171",lineHeight:1.5}}>{loginError}</div>
                        </div>
                      )}
                    </div>

                    <button className="btn-admin" style={{width:"100%",padding:14,fontSize:15}} onClick={handleAdminLogin}>
                      Access Admin Panel →
                    </button>

                    <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(96,165,250,.06)",border:"1px solid rgba(96,165,250,.15)",borderRadius:6,padding:"10px 14px",marginTop:16}}>
                      <span style={{fontSize:14}}>ℹ️</span>
                      <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.4)",lineHeight:1.5}}>Only the registered admin mobile number can access this panel.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            ADMIN DASHBOARD
        ════════════════════════════ */}
        {step==="admin" && (
          <div className="fade">
            {/* Header */}
            <div style={{marginBottom:32}}>
              <div className="admin-accent-line"/>
              <div className="dm" style={{fontSize:11,letterSpacing:3,color:"#60a5fa",marginBottom:10}}>ADMIN PANEL</div>
              <h1 className="pf" style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,marginBottom:8}}>
                Welcome back, <em style={{color:"#93c5fd"}}>Admin</em>
              </h1>
              <div className="dm" style={{fontSize:14,color:"rgba(232,228,217,.45)"}}>Manage all bookings, providers and system stats for MediSense Vellore.</div>
            </div>

            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
              {[
                { label:"Total Bookings",    value: bookings.length,                                  color:"#d4af64", icon:"📅" },
                { label:"Confirmed",         value: bookings.filter(b=>b.status==="confirmed").length, color:"#22c55e", icon:"✅" },
                { label:"Pending",           value: bookings.filter(b=>b.status==="pending").length,   color:"#f59e0b", icon:"⏳" },
                { label:"Active Providers",  value: ALL_PROVIDERS.length,                             color:"#60a5fa", icon:"🏥" },
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div style={{fontSize:28,marginBottom:6}}>{s.icon}</div>
                  <div className="pf" style={{fontSize:28,fontWeight:900,color:s.color,marginBottom:4}}>{s.value}</div>
                  <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.42)"}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:16}}>
              {[["bookings","📋 All Bookings"],["providers","🏥 Providers"],["stats","📊 Condition Stats"]].map(([k,l])=>(
                <div key={k} className={`atab ${adminTab===k?"on":""}`} onClick={()=>setAdminTab(k)}>{l}</div>
              ))}
            </div>

            {/* ── Bookings Tab ── */}
            {adminTab==="bookings" && (
              <div className="fade">
                <div style={{overflowX:"auto"}}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>ID</th><th>Patient</th><th>Mobile</th><th>Age/Sex</th>
                        <th>Condition</th><th>Provider</th><th>Date & Time</th><th>Status</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b=>(
                        <tr key={b.id}>
                          <td><span className="dm" style={{fontSize:11,color:"#d4af64"}}>{b.id}</span></td>
                          <td><span style={{fontWeight:500}}>{b.name}</span></td>
                          <td>{b.mobile}</td>
                          <td>{b.age}y · {b.sex}</td>
                          <td>
                            <span className="dm" style={{fontSize:12}}>{DISEASE_MAP.find(d=>d.disease===b.condition)?.icon||"🔬"} {b.condition}</span>
                          </td>
                          <td><span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.65)"}}>{b.provider}</span></td>
                          <td><span className="dm" style={{fontSize:12}}>{b.date}<br/><span style={{color:"rgba(232,228,217,.45)"}}>{b.time}</span></span></td>
                          <td><span className={b.status==="confirmed"?"status-confirmed":"status-pending"}>{b.status}</span></td>
                          <td>
                            <button
                              className="btn-sm"
                              style={{
                                color: b.status==="confirmed"?"#f59e0b":"#22c55e",
                                borderColor: b.status==="confirmed"?"rgba(245,158,11,.35)":"rgba(34,197,94,.35)",
                                background: b.status==="confirmed"?"rgba(245,158,11,.07)":"rgba(34,197,94,.07)",
                              }}
                              onClick={()=>toggleStatus(b.id)}
                            >
                              {b.status==="confirmed"?"→ Pending":"→ Confirm"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.length===0 && (
                    <div style={{textAlign:"center",padding:"40px 0",color:"rgba(232,228,217,.35)"}}>
                      <div style={{fontSize:36,marginBottom:10}}>📋</div>
                      <div className="dm">No bookings yet.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Providers Tab ── */}
            {adminTab==="providers" && (
              <div className="fade">
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:13}}>
                  {ALL_PROVIDERS.map(p=>(
                    <div key={p.id} className="card" style={{padding:18}}>
                      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                        <span className={p.type==="hospital"?"bh":"bd"}>{p.type==="hospital"?"🏥 Hospital":"👨‍⚕️ Clinic"}</span>
                        <span className="bo">● Active</span>
                      </div>
                      <div className="pf" style={{fontSize:15,marginBottom:3,lineHeight:1.3}}>{p.name}</div>
                      <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.46)",marginBottom:7}}>{p.subtitle}</div>
                      <div className="dm" style={{fontSize:11,color:"rgba(232,228,217,.38)",marginBottom:4}}>📍 {p.address}</div>
                      <div className="dm" style={{fontSize:11,color:"rgba(232,228,217,.38)",marginBottom:10}}>🕐 {p.hours}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <span className="dm" style={{fontSize:13,color:"#d4af64"}}>★ {p.rating}</span>
                          <span className="dm" style={{fontSize:11,color:"rgba(232,228,217,.3)"}}>({p.reviews.toLocaleString()})</span>
                        </div>
                        <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="mb">🗺 Map</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Stats Tab ── */}
            {adminTab==="stats" && (
              <div className="fade">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                  {/* Conditions breakdown */}
                  <div className="card" style={{padding:22}}>
                    <div className="dm" style={{fontSize:11,letterSpacing:2,color:"rgba(232,228,217,.35)",marginBottom:18}}>BOOKINGS BY CONDITION</div>
                    {DISEASE_MAP.map(d=>{
                      const count = bookings.filter(b=>b.condition===d.disease).length;
                      const pct = bookings.length ? Math.round(count/bookings.length*100) : 0;
                      return (
                        <div key={d.disease} style={{marginBottom:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                            <span className="dm" style={{fontSize:13,color:"rgba(232,228,217,.7)"}}>{d.icon} {d.disease}</span>
                            <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.45)"}}>{count} ({pct}%)</span>
                          </div>
                          <div style={{background:"rgba(255,255,255,.07)",borderRadius:3,height:5,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${SEV[d.severity]},${SEV[d.severity]}88)`,borderRadius:3,transition:"width .5s ease"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Provider booking count */}
                  <div className="card" style={{padding:22}}>
                    <div className="dm" style={{fontSize:11,letterSpacing:2,color:"rgba(232,228,217,.35)",marginBottom:18}}>BOOKINGS BY PROVIDER</div>
                    {ALL_PROVIDERS.map(p=>{
                      const count = bookings.filter(b=>b.provider===p.name).length;
                      const pct = bookings.length ? Math.round(count/bookings.length*100) : 0;
                      if (count===0) return null;
                      return (
                        <div key={p.id} style={{marginBottom:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                            <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.7)"}}>{p.name}</span>
                            <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.45)"}}>{count}</span>
                          </div>
                          <div style={{background:"rgba(255,255,255,.07)",borderRadius:3,height:5,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#60a5fa,#3b82f6)",borderRadius:3,transition:"width .5s ease"}}/>
                          </div>
                        </div>
                      );
                    })}
                    {bookings.length===0&&<div className="dm" style={{color:"rgba(232,228,217,.35)",fontSize:13}}>No booking data yet.</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════
            LOCATION
        ════════════════════════════ */}
        {step==="location" && (
          <div className="fade" style={{maxWidth:500,margin:"0 auto",textAlign:"center",paddingTop:16}}>
            <div style={{fontSize:58,marginBottom:16}}>📍</div>
            <div className="dm" style={{fontSize:11,letterSpacing:3,color:"#d4af64",marginBottom:10}}>STEP 01 / YOUR LOCATION</div>
            <h2 className="pf" style={{fontSize:"clamp(24px,4vw,38px)",fontWeight:900,lineHeight:1.2,marginBottom:12}}>
              Hello, <em style={{color:"#d4af64"}}>{profile.name.split(" ")[0]}</em>!<br/>Where are you?
            </h2>
            <p className="dm" style={{fontSize:14,color:"rgba(232,228,217,.48)",lineHeight:1.8,marginBottom:30}}>
              We'll sort hospitals and clinics in Vellore closest to you first.
            </p>

            {(locStatus==="idle"||locStatus==="denied") && (
              <div style={{textAlign:"left"}}>
                {locStatus==="denied" && (
                  <div className="card" style={{padding:"12px 16px",marginBottom:14,borderColor:"rgba(239,68,68,.22)",background:"rgba(239,68,68,.05)"}}>
                    <div className="dm" style={{fontSize:12,color:"#f87171"}}>⚠️ Location access was denied. Please enter your area manually.</div>
                  </div>
                )}
                {locStatus==="idle" && <>
                  <button className="btnGPS" style={{width:"100%",marginBottom:6}} onClick={requestGPS}>
                    <span style={{fontSize:18}}>🛰</span> Use My GPS Location
                  </button>
                  <div className="dm" style={{fontSize:11,color:"rgba(232,228,217,.28)",textAlign:"center",marginBottom:4}}>Recommended for most accurate results</div>
                  <div className="divider"><span>or type your area</span></div>
                </>}
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <input placeholder="e.g. Sathuvachari, Katpadi, CMC..." value={manualInput}
                    onChange={e=>setManualInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&manualInput.trim()&&applyManual()}/>
                  <button className="btn" style={{padding:"11px 16px",whiteSpace:"nowrap"}} onClick={applyManual} disabled={!manualInput.trim()}>Go →</button>
                </div>
                <div className="dm" style={{fontSize:11,color:"rgba(232,228,217,.32)",marginBottom:9,letterSpacing:1}}>QUICK SELECT</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {["Sathuvachari","Katpadi","Kosapet","CMC","Gandhi Nagar","Allapuram"].map(a=>(
                    <div key={a} className="chip" style={{fontSize:12}} onClick={()=>setAreaQuick(a)}>{a}</div>
                  ))}
                </div>
              </div>
            )}
            {locStatus==="loading" && (
              <div style={{padding:"28px 0"}}>
                <div className="spin" style={{fontSize:42,marginBottom:12}}>🛰</div>
                <div className="dm" style={{color:"rgba(232,228,217,.46)"}}>Detecting your location…</div>
              </div>
            )}
            {locStatus==="granted" && userLoc && (
              <div className="fade">
                <div className="card" style={{padding:"16px 20px",borderColor:"rgba(34,197,94,.22)",background:"rgba(34,197,94,.05)",marginBottom:20,textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24}}>✅</span>
                    <div>
                      <div className="dm" style={{fontSize:13,fontWeight:600,color:"#22c55e",marginBottom:2}}>Location confirmed</div>
                      <div className="dm" style={{fontSize:13,color:"rgba(232,228,217,.55)"}}>{userLoc.label}</div>
                    </div>
                  </div>
                </div>
                <button className="btn" style={{width:"100%"}} onClick={()=>setStep("symptoms")}>Continue to Symptom Check →</button>
                <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.32)",marginTop:12,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}} onClick={()=>setLocStatus("idle")}>Change location</div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════
            SYMPTOMS
        ════════════════════════════ */}
        {step==="symptoms" && (
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22,flexWrap:"wrap"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(212,175,100,.08)",border:"1px solid rgba(212,175,100,.2)",borderRadius:50,padding:"5px 14px",cursor:"pointer"}} onClick={()=>setStep("location")}>
                <span style={{fontSize:12}}>📍</span>
                <span className="dm" style={{fontSize:12,color:"#d4af64"}}>{userLoc?.label}</span>
                <span className="dm" style={{fontSize:11,color:"rgba(212,175,100,.44)"}}>· Change</span>
              </div>
              <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:50,padding:"5px 14px"}}>
                <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.52)"}}>👤 {profile.name} · {profile.age}y · {profile.sex}</span>
              </div>
            </div>
            <div style={{marginBottom:32}}>
              <div className="dm" style={{fontSize:11,letterSpacing:3,color:"#d4af64",marginBottom:12}}>STEP 02 / SYMPTOM SELECTION</div>
              <h1 className="pf" style={{fontSize:"clamp(26px,4.5vw,44px)",fontWeight:900,lineHeight:1.15,marginBottom:13}}>
                What are you<br/><em style={{color:"#d4af64"}}>experiencing</em> today?
              </h1>
              <p className="dm" style={{fontSize:15,color:"rgba(232,228,217,.48)",maxWidth:500,lineHeight:1.8}}>Select all symptoms. AI will identify the condition and show nearest providers.</p>
            </div>
            <div className="symptom-wrap" style={{marginBottom:30}}>
              {SYMPTOMS.map(s=>(
                <div key={s} className={`chip ${selected.includes(s)?"on":""}`} onClick={()=>toggle(s)}>
                  {selected.includes(s)&&<span style={{marginRight:5}}>✓</span>}{s}
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <button className="btn" onClick={analyze} disabled={!selected.length}>Analyze My Symptoms →</button>
              <span className="dm" style={{fontSize:13,color:"rgba(232,228,217,.36)"}}>
                {selected.length===0?"Select at least one symptom":`${selected.length} symptom${selected.length>1?"s":""} selected`}
              </span>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            ANALYZING
        ════════════════════════════ */}
        {step==="analyzing" && (
          <div className="fade" style={{textAlign:"center",paddingTop:56}}>
            <div style={{fontSize:70,marginBottom:22}}>🔬</div>
            <h2 className="pf" style={{fontSize:30,marginBottom:12}}>Analyzing symptoms</h2>
            <p className="dm" style={{color:"rgba(232,228,217,.44)",marginBottom:40,fontSize:15}}>
              Matching {selected.length} symptom{selected.length>1?"s":""} for {profile.name} · Locating providers near {userLoc?.label}
            </p>
            <div style={{maxWidth:340,margin:"0 auto"}}>
              <div style={{background:"rgba(255,255,255,.07)",borderRadius:4,height:5,overflow:"hidden",marginBottom:9}}>
                <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#d4af64,#f0d990)",borderRadius:4,transition:"width .1s ease"}}/>
              </div>
              <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.35)"}}>{Math.round(progress)}%</div>
            </div>
            <div style={{marginTop:32,display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
              {["Pattern Recognition","Disease Matching","Distance Sorting"].map((t,i)=>(
                <div key={t} className="dm" style={{fontSize:12,color:progress>i*33?"#d4af64":"rgba(232,228,217,.2)",display:"flex",alignItems:"center",gap:5,transition:"color .4s"}}>
                  {progress>i*33?"✓":"○"} {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════
            RESULT
        ════════════════════════════ */}
        {step==="result" && diagnosis && (
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(212,175,100,.08)",border:"1px solid rgba(212,175,100,.2)",borderRadius:50,padding:"5px 14px",cursor:"pointer"}} onClick={()=>setStep("location")}>
                <span style={{fontSize:12}}>📍</span>
                <span className="dm" style={{fontSize:12,color:"#d4af64"}}>{userLoc?.label}</span>
              </div>
              <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:50,padding:"5px 14px"}}>
                <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.5)"}}>👤 {profile.name} · {profile.age}y · {profile.sex}</span>
              </div>
            </div>
            <div className="dm" style={{fontSize:11,letterSpacing:3,color:"#d4af64",marginBottom:16}}>STEP 03 / DIAGNOSIS & NEARBY PROVIDERS</div>

            <div className="card" style={{padding:"22px",marginBottom:24,borderColor:"rgba(212,175,100,.16)"}}>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <div style={{fontSize:50}}>{diagnosis.icon}</div>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,flexWrap:"wrap"}}>
                    <h2 className="pf" style={{fontSize:24,fontWeight:900}}>{diagnosis.disease}</h2>
                    <span className="dm" style={{fontSize:10,padding:"3px 10px",borderRadius:50,border:`1px solid ${SEV[diagnosis.severity]}`,color:SEV[diagnosis.severity],letterSpacing:1}}>{diagnosis.severity.toUpperCase()}</span>
                  </div>
                  <p className="dm" style={{color:"rgba(232,228,217,.52)",fontSize:14,marginBottom:9,lineHeight:1.7}}>{diagnosis.description}</p>
                  <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                    <div>
                      <div className="dm" style={{fontSize:10,color:"rgba(232,228,217,.3)",letterSpacing:1,marginBottom:3}}>SPECIALIST</div>
                      <div className="dm" style={{color:"#d4af64",fontSize:13}}>🏥 {diagnosis.specialty}</div>
                    </div>
                    <div>
                      <div className="dm" style={{fontSize:10,color:"rgba(232,228,217,.3)",letterSpacing:1,marginBottom:3}}>MATCHED SYMPTOMS</div>
                      <div className="dm" style={{color:"#e8e4d9",fontSize:13}}>{diagnosis.symptoms.filter(s=>selected.includes(s)).join(", ")||"General match"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",marginBottom:13,flexWrap:"wrap",gap:6}}>
              <div className="dm" style={{fontSize:11,letterSpacing:2,color:"rgba(232,228,217,.3)"}}>{providers.length} PROVIDERS · SORTED BY DISTANCE</div>
              <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.36)"}}>📍 From {userLoc?.label}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:12,marginBottom:28}}>
              {providers.map(p=>(
                <div key={p.id} className="pc" onClick={()=>{setProvider(p);setStep("booking")}}>
                  <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                    <span className={p.type==="hospital"?"bh":"bd"}>{p.type==="hospital"?"🏥 Hospital":"👨‍⚕️ Clinic"}</span>
                    <span className="bo">● Open</span>
                    {p.dist!=null&&<span className="distb">📍 {p.dist.toFixed(1)} km</span>}
                  </div>
                  <div className="pf" style={{fontSize:15,marginBottom:3,lineHeight:1.3}}>{p.name}</div>
                  <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.44)",marginBottom:7}}>{p.subtitle}</div>
                  <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.38)",marginBottom:3}}>📍 {p.address}</div>
                  <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.38)",marginBottom:10}}>🕐 {p.hours}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:9,borderTop:"1px solid rgba(255,255,255,.05)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span className="dm" style={{fontSize:13,color:"#d4af64"}}>★ {p.rating}</span>
                      <span className="dm" style={{fontSize:11,color:"rgba(232,228,217,.3)"}}>({p.reviews.toLocaleString()})</span>
                    </div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="mb" onClick={e=>e.stopPropagation()}>🗺 Map</a>
                      <span className="dm" style={{fontSize:12,color:"#d4af64"}}>Book →</span>
                    </div>
                  </div>
                </div>
              ))}
              {providers.length===0&&(
                <div className="card" style={{padding:24,gridColumn:"1/-1",textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:10}}>🏥</div>
                  <div className="dm" style={{color:"rgba(232,228,217,.46)"}}>No specialty-specific providers found. Please visit a general hospital.</div>
                </div>
              )}
            </div>
            <button className="btnO" onClick={()=>setStep("symptoms")}>← Change Symptoms</button>
            <div className="card" style={{padding:"11px 15px",marginTop:14,borderColor:"rgba(239,68,68,.14)",background:"rgba(239,68,68,.04)"}}>
              <p className="dm" style={{fontSize:12,color:"rgba(232,228,217,.38)",lineHeight:1.6}}>
                ⚠️ <strong style={{color:"rgba(232,228,217,.58)"}}>Disclaimer:</strong> This is AI guidance, not a medical diagnosis. Provider data is from Google Maps — always call ahead to confirm availability.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            BOOKING
        ════════════════════════════ */}
        {step==="booking" && provider && (
          <div className="fade">
            <div className="dm" style={{fontSize:11,letterSpacing:3,color:"#d4af64",marginBottom:16}}>STEP 04 / BOOK APPOINTMENT</div>
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.15fr) minmax(0,0.85fr)",gap:26,alignItems:"start"}}>
              <div>
                <h2 className="pf" style={{fontSize:26,marginBottom:6}}>Confirm your<br/><em style={{color:"#d4af64"}}>appointment</em></h2>
                <p className="dm" style={{color:"rgba(232,228,217,.44)",marginBottom:20,fontSize:14,lineHeight:1.75}}>Your profile details are pre-filled. Choose a date and time to proceed.</p>

                <div className="card" style={{padding:15,marginBottom:18}}>
                  <div style={{display:"flex",gap:5,marginBottom:9,flexWrap:"wrap",alignItems:"center"}}>
                    <span className={provider.type==="hospital"?"bh":"bd"}>{provider.type==="hospital"?"🏥 Hospital":"👨‍⚕️ Clinic"}</span>
                    <span className="bo">● Open</span>
                    {provider.dist!=null&&<span className="distb">📍 {provider.dist.toFixed(1)} km away</span>}
                  </div>
                  <div className="pf" style={{fontSize:16,marginBottom:3}}>{provider.name}</div>
                  <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.42)",marginBottom:4}}>{provider.subtitle}</div>
                  <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.42)",marginBottom:3}}>📍 {provider.address}</div>
                  <div className="dm" style={{fontSize:12,color:"rgba(232,228,217,.42)",marginBottom:11}}>🕐 {provider.hours}</div>
                  <a href={provider.mapUrl} target="_blank" rel="noopener noreferrer" className="mb">🗺 Open in Google Maps</a>
                </div>

                {/* Pre-filled patient info */}
                <div className="card" style={{padding:"13px 15px",marginBottom:16,background:"rgba(212,175,100,.03)",borderColor:"rgba(212,175,100,.14)"}}>
                  <div className="dm" style={{fontSize:10,letterSpacing:2,color:"rgba(212,175,100,.65)",marginBottom:9}}>PATIENT INFO (FROM YOUR PROFILE)</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                    {[["Name",profile.name],["Mobile","+91 "+profile.mobile],["Age / Sex",`${profile.age}y · ${profile.sex}`]].map(([l,v])=>(
                      <div key={l}>
                        <div className="dm" style={{fontSize:10,color:"rgba(232,228,217,.34)",letterSpacing:1,marginBottom:3}}>{l}</div>
                        <div className="dm" style={{fontSize:13,color:"#e8e4d9"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:13}}>
                  <div>
                    <Label>Preferred Date</Label>
                    <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
                  </div>
                  <div>
                    <Label>Preferred Time</Label>
                    <select value={form.time} onChange={e=>setForm({...form,time:e.target.value})}>
                      <option value="">Select time</option>
                      {["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{marginBottom:18}}>
                  <Label>Notes for Doctor (optional)</Label>
                  <textarea rows={3} placeholder="Medications, allergies, or anything the doctor should know…" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} style={{resize:"none"}}/>
                </div>
                <div style={{display:"flex",gap:11}}>
                  <button className="btn" onClick={confirmBooking} disabled={!form.date||!form.time}>Confirm Booking</button>
                  <button className="btnO" onClick={()=>setStep("result")}>← Back</button>
                </div>
              </div>

              <div>
                <div className="card" style={{padding:18,marginBottom:12}}>
                  <div className="dm" style={{fontSize:10,letterSpacing:2,color:"rgba(232,228,217,.3)",marginBottom:13}}>APPOINTMENT SUMMARY</div>
                  {[["Patient",profile.name],["Mobile","+91 "+profile.mobile],["Age/Sex",`${profile.age}y · ${profile.sex}`],["Condition",diagnosis?.disease||""],["Specialist",diagnosis?.specialty||""],["Provider",provider.name],["Address",provider.address],["Hours",provider.hours],["Rating",`★ ${provider.rating} (${provider.reviews.toLocaleString()} reviews)`]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",paddingBottom:7,marginBottom:7,borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                      <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.35)",flexShrink:0,marginRight:8}}>{l}</span>
                      <span className="dm" style={{fontSize:12,color:"#e8e4d9",textAlign:"right"}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card" style={{padding:13,background:"rgba(34,197,94,.03)",borderColor:"rgba(34,197,94,.12)"}}>
                  <p className="dm" style={{fontSize:12,color:"rgba(232,228,217,.42)",lineHeight:1.75}}>
                    📞 <strong style={{color:"rgba(232,228,217,.6)"}}>Tip:</strong> Call the provider to confirm your slot. Token availability varies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            CONFIRMED
        ════════════════════════════ */}
        {step==="confirmed" && (
          <div className="fade" style={{textAlign:"center",paddingTop:28}}>
            <div style={{width:88,height:88,borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 22px",boxShadow:"0 8px 32px rgba(34,197,94,.22)"}}>✓</div>
            <h2 className="pf" style={{fontSize:34,marginBottom:9}}>Appointment Requested!</h2>
            <p className="dm" style={{color:"rgba(232,228,217,.5)",fontSize:15,lineHeight:1.85,maxWidth:450,margin:"0 auto 32px"}}>
              Request sent for <strong style={{color:"#e8e4d9"}}>{provider?.name}</strong>, {profile.name}.<br/>Please call the provider to confirm your slot.
            </p>
            <div className="card" style={{display:"inline-block",padding:"24px 34px",marginBottom:28,textAlign:"left",minWidth:310,borderColor:"rgba(212,175,100,.14)"}}>
              <div className="dm" style={{fontSize:10,letterSpacing:2,color:"#d4af64",marginBottom:14}}>BOOKING RECEIPT</div>
              {[["👤 Patient",profile.name],["📞 Mobile","+91 "+profile.mobile],["🎂 Age/Sex",`${profile.age}y · ${profile.sex}`],["🗓 Date",form.date],["🕐 Time",form.time],["🏥 Provider",provider?.name],["📍 Address",provider?.address]].map(([l,v])=>(
                <div key={l} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                  <span className="dm" style={{fontSize:12,color:"rgba(232,228,217,.4)",minWidth:92,flexShrink:0}}>{l}</span>
                  <span className="dm" style={{fontSize:13,color:"#e8e4d9",lineHeight:1.5}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap"}}>
              <a href={provider?.mapUrl} target="_blank" rel="noopener noreferrer" className="mb" style={{padding:"12px 22px",fontSize:14}}>🗺 Get Directions</a>
              <button className="btn" onClick={reset}>Start a New Check</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
