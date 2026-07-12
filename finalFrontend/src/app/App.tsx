import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Heart, Star, ArrowRight, Menu, X, Search, User,
  Instagram, Twitter, Facebook, Youtube, CheckCircle, Shield,
  Gem, Award, Leaf, Sparkles, ChevronRight, ChevronLeft,
  Phone, Mail, MapPin, Flame, Sun, Moon, Wind, Zap, Package,
  Minus, Plus, Trash2, Clock, Gift, MessageCircle, Lock,
  Truck, Tag, ChevronDown, ChevronUp, Filter, SlidersHorizontal,
  Star as StarIcon, Eye, Share2, BookOpen, Layers, Compass
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { api, signInWithGoogle } from "../lib/api";

import baglaImg       from "../imports/WhatsApp_Image_2026-07-04_at_20.51.30.jpeg";
import pendantSilImg  from "../imports/WhatsApp_Image_2026-07-04_at_20.52.39.jpeg";
import pyramidImg     from "../imports/WhatsApp_Image_2026-07-04_at_20.53.15.jpeg";
import yantraPlateImg from "../imports/WhatsApp_Image_2026-07-04_at_20.53.16.jpeg";
import gemstonImg     from "../imports/WhatsApp_Image_2026-07-04_at_20.53.47.jpeg";
import navratnaImg    from "../imports/WhatsApp_Image_2026-07-04_at_20.54.03.jpeg";

// ─── Design tokens ────────────────────────────────────────────────────────────
const MAROON  = "#5B1F24";
const GOLD    = "#C8A044";
const SAFFRON = "#E78B2F";
const IVORY   = "#FAF7F2";
const SERIF      = "'Playfair Display', Georgia, serif";
const SANS       = "'Inter', system-ui, sans-serif";
const PRICE_FONT = "'Poller One', serif";

// ─── Product data ─────────────────────────────────────────────────────────────
interface ArohamProduct {
  id: number; slug: string; name: string; subtitle: string;
  category: string; purpose: string; price: number; original: number;
  rating: number; reviews: number; img: string;
  badges: string[]; shortDesc: string;
  benefits: string[]; size: string; material: string; useFor: string[];
  stock?: number;
}

const AROHAM_PRODUCTS: ArohamProduct[] = [
  {
    id: 1, slug: "bagla-mukhi-yantra",
    name: "Bagla Mukhi Yantra", subtitle: "24K Gold Plated",
    category: "Yantra", purpose: "Protection",
    price: 599, original: 899, rating: 4.8, reviews: 312,
    img: baglaImg,
    badges: ["Temple Energized", "Bestseller"],
    shortDesc: "Stambhan · Vijay · Raksha. Controls negativity, brings victory in legal matters and protects from enemies.",
    benefits: ["Victory in Legal Matters", "Control Over Enemies", "Enhanced Will Power", "Protection from Negativity"],
    size: "3.5cm × 3.5cm", material: "Metal (Golden Finish)",
    useFor: ["Pendant", "Pocket", "Wallet", "Car", "Pooja Sthal"]
  },
  {
    id: 2, slug: "navratna-sri-yantra-pendant",
    name: "Navratna Sri Yantra Pendant", subtitle: "9 Sacred Gemstones",
    category: "Pendant", purpose: "Wealth",
    price: 1899, original: 2499, rating: 4.9, reviews: 189,
    img: navratnaImg,
    badges: ["Temple Energized", "Handcrafted"],
    shortDesc: "All 9 planetary gemstones set around a sacred Sri Yantra for complete cosmic alignment and abundance.",
    benefits: ["Activates All 9 Planets", "Attracts Wealth & Prosperity", "Cosmic Energy Balance", "Spiritual Protection"],
    size: "4cm diameter", material: "Gold Plated with Navratna Stones",
    useFor: ["Wear as Pendant", "Altar Placement", "Meditation Focus"]
  },
  {
    id: 3, slug: "brass-pyramid-vastu-yantra",
    name: "Brass Pyramid Vastu Yantra", subtitle: "9 Crystal Pyramids",
    category: "Yantra", purpose: "Home Harmony",
    price: 3499, original: 4999, rating: 4.7, reviews: 241,
    img: pyramidImg,
    badges: ["Premium", "Vastu Certified"],
    shortDesc: "Large brass yantra with 9 embedded crystal pyramids for powerful Vastu correction and home harmony.",
    benefits: ["Vastu Correction", "Amplified Energy Fields", "Home Harmony", "Positive Vibrations"],
    size: "12 inch × 12 inch", material: "Pure Brass with Crystal Pyramids",
    useFor: ["Northeast Corner", "Pooja Room", "Office"]
  },
  {
    id: 4, slug: "navdurga-yantra-plate",
    name: "Navdurga Yantra Plate", subtitle: "Etched Brass",
    category: "Yantra", purpose: "Protection",
    price: 2299, original: 3200, rating: 4.6, reviews: 156,
    img: yantraPlateImg,
    badges: ["Handcrafted", "Temple Energized"],
    shortDesc: "Hand-etched Navdurga Yantra on premium brass for powerful divine protection and obstacle removal.",
    benefits: ["Divine Protection", "Removal of Obstacles", "Spiritual Shielding", "Positive Aura"],
    size: "10 inch × 10 inch", material: "Pure Brass",
    useFor: ["Home Altar", "Office Desk", "Safe Room"]
  },
  {
    id: 5, slug: "navratna-gemstone-set",
    name: "Navratna Gemstone Collection", subtitle: "All 9 Planetary Stones",
    category: "Crystals", purpose: "Peace",
    price: 4999, original: 6999, rating: 4.9, reviews: 428,
    img: gemstonImg,
    badges: ["Certified", "Premium Quality"],
    shortDesc: "Complete set of all 9 planetary gemstones, certified and energized for complete cosmic balance.",
    benefits: ["Balances All 9 Planets", "Emotional Healing", "Spiritual Growth", "Complete Life Harmony"],
    size: "Set of 9 stones", material: "Natural Certified Gemstones",
    useFor: ["Meditation", "Crystal Grid", "Altar", "Personal Carry"]
  },
  {
    id: 6, slug: "kavacha-protection-pendant",
    name: "Kavacha Protection Pendant", subtitle: "Sacred Silver",
    category: "Pendant", purpose: "Protection",
    price: 899, original: 1299, rating: 4.7, reviews: 203,
    img: pendantSilImg,
    badges: ["Handcrafted", "Sterling Silver"],
    shortDesc: "Sacred Kavacha pendant in sterling silver with embedded star protection motif for daily shielding.",
    benefits: ["Evil Eye Protection", "Personal Shield", "Spiritual Guard", "Confidence Booster"],
    size: "3cm × 3cm", material: "Sterling Silver",
    useFor: ["Wear Daily", "Protection Pendant", "Gift"]
  },
];

const COMBOS = [
  {
    id: 7, name: "Navagraha Complete Kit",
    desc: "Align all 9 planetary energies for total life transformation",
    items: ["Navratna Gemstone Set", "Navratna Sri Yantra Pendant", "Bagla Mukhi Yantra"],
    price: 6999, original: 11497, saving: 4498,
    color: "linear-gradient(135deg,#2D1B00,#5B3800)",
    accent: GOLD,
  },
  {
    id: 8, name: "Wealth Attraction Kit",
    desc: "Triple-layer wealth activation for financial breakthroughs",
    items: ["Navratna Sri Yantra Pendant", "Brass Pyramid Yantra", "Bagla Mukhi Yantra"],
    price: 5499, original: 7997, saving: 2498,
    color: "linear-gradient(135deg,#0D2B1A,#1A4D2E)",
    accent: "#4ADE80",
  },
  {
    id: 9, name: "Home Protection Bundle",
    desc: "Complete Vastu correction & divine protection for your home",
    items: ["Brass Pyramid Yantra", "Navdurga Yantra Plate", "Kavacha Pendant"],
    price: 5999, original: 8697, saving: 2698,
    color: "linear-gradient(135deg,#1A0D30,#2D1A50)",
    accent: "#A78BFA",
  },
];

// ─── Navagraha data ───────────────────────────────────────────────────────────
const GRAHAS = [
  { name: "Surya", en: "Sun",     color: "#FFD700", size: 48, orbit: 0,   speed: 0,    gem: "Ruby",     desc: "Soul, authority, health" },
  { name: "Chandra", en: "Moon",  color: "#E8E8FF", size: 14, orbit: 90,  speed: 8,    gem: "Pearl",    desc: "Mind, emotions, nurture" },
  { name: "Mangal", en: "Mars",   color: "#FF4444", size: 16, orbit: 130, speed: 14,   gem: "Coral",    desc: "Energy, courage, strength" },
  { name: "Budha", en: "Mercury", color: "#90EE90", size: 13, orbit: 165, speed: 10,   gem: "Emerald",  desc: "Intellect, communication" },
  { name: "Guru", en: "Jupiter",  color: "#FFB347", size: 22, orbit: 205, speed: 22,   gem: "Yellow Sapphire", desc: "Wisdom, expansion, luck" },
  { name: "Shukra", en: "Venus",  color: "#FFB6C1", size: 18, orbit: 248, speed: 16,   gem: "Diamond",  desc: "Love, beauty, luxury" },
  { name: "Shani", en: "Saturn",  color: "#B8A090", size: 20, orbit: 295, speed: 30,   gem: "Blue Sapphire", desc: "Discipline, karma, justice" },
  { name: "Rahu",                  color: "#6644AA", size: 15, orbit: 338, speed: 18,   gem: "Hessonite", desc: "Desire, illusion, foreign" },
  { name: "Ketu",                  color: "#AA6644", size: 15, orbit: 375, speed: 20,   gem: "Cat's Eye", desc: "Liberation, mysticism" },
];

// ─── HOW IT'S MADE steps ──────────────────────────────────────────────────────
const CRAFT_STEPS = [
  { icon: "⛏", title: "Sacred Material Sourcing", desc: "We source only auspicious metals — copper, brass, and silver — from trusted artisan cooperatives, chosen on Vedic-auspicious dates.", color: "#8B4513" },
  { icon: "🔨", title: "Master Artisan Crafting", desc: "Skilled craftspeople with decades of experience shape each piece by hand using traditional tools, preserving centuries-old techniques.", color: MAROON },
  { icon: "✍", title: "Sanskrit Inscription", desc: "Vedic pandits inscribe sacred mantras and geometric yantras with millimeter precision, each stroke charged with spiritual intent.", color: "#2D4A8B" },
  { icon: "🪔", title: "Temple Energization (Pran Pratishtha)", desc: "Every product undergoes a full Pran Pratishtha ritual at a certified temple. Mantras are chanted for 108 rounds, activating divine energy.", color: "#8B6914" },
  { icon: "📜", title: "Certification & Dispatch", desc: "A Vedic quality inspector certifies the product. It is then wrapped in premium packaging and dispatched with a certificate of authenticity.", color: "#2D5A2D" },
];

// ─── Cart item type ───────────────────────────────────────────────────────────
interface CartItem { product: ArohamProduct; qty: number; }

// ─── Shared input components ──────────────────────────────────────────────────
function AuthInput({ label, type = "text", value, onChange, right }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; right?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full pt-6 pb-2.5 rounded-2xl text-sm outline-none transition-all duration-200"
        style={{ paddingLeft:"1rem", paddingRight: right ? "3rem":"1rem", background:"#FFFFFF",
          border:`1.5px solid ${focused ? GOLD:"rgba(91,31,36,0.14)"}`,
          boxShadow: focused ? `0 0 0 3px rgba(200,160,68,0.1)`:"none",
          color:"#222222", fontFamily:SANS }}
      />
      <label className="absolute pointer-events-none transition-all duration-200"
        style={{ left:"1rem", top: active?"8px":"50%",
          transform: active?"translateY(0)":"translateY(-50%)",
          fontSize: active?"10px":"13px", color: focused ? GOLD:"#9A8A78",
          fontFamily:SANS, fontWeight: active?600:400,
          letterSpacing: active?"0.06em":"0",
          textTransform: active?"uppercase":"none" }}>
        {label}
      </label>
      {right && <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

function PasswordInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const strength = value.length===0?0:value.length<6?1:value.length<10?2:3;
  const sc = ["transparent","#E74C3C",SAFFRON,"#4A8A4A"][strength];
  return (
    <div>
      <AuthInput label={label} type={show?"text":"password"} value={value} onChange={onChange}
        right={<button type="button" onClick={()=>setShow(s=>!s)} className="text-[11px] font-semibold" style={{color:MAROON}}>{show?"Hide":"Show"}</button>}
      />
      {value.length>0&&(
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1 flex-1">
            {[1,2,3].map(l=><div key={l} className="flex-1 h-1 rounded-full transition-all duration-300" style={{background:strength>=l?sc:"rgba(91,31,36,0.08)"}}/>)}
          </div>
          <span className="text-[10px] font-semibold" style={{color:sc}}>{["","Weak","Good","Strong"][strength]}</span>
        </div>
      )}
    </div>
  );
}

function FloatingInput({ label, type="text", value, onChange, required=false }: {
  label:string; type?:string; value:string; onChange:(v:string)=>void; required?:boolean;
}) {
  const [focused,setFocused]=useState(false);
  const active=focused||value.length>0;
  return (
    <div className="relative">
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} required={required}
        className="w-full pt-6 pb-2 px-4 rounded-2xl text-sm outline-none transition-all duration-200"
        style={{ background:"#FFFFFF", border:`1.5px solid ${focused?GOLD:"rgba(91,31,36,0.14)"}`,
          boxShadow: focused?`0 0 0 3px rgba(200,160,68,0.1)`:"none", color:"#222222", fontFamily:SANS }}/>
      <label className="absolute left-4 transition-all duration-200 pointer-events-none"
        style={{ top:active?"8px":"50%", transform:active?"translateY(0)":"translateY(-50%)",
          fontSize:active?"10px":"13px", color:focused?GOLD:"#9A8A78", fontFamily:SANS,
          fontWeight:active?600:400, letterSpacing:active?"0.06em":"0",
          textTransform:active?"uppercase":"none" }}>
        {label}{required&&" *"}
      </label>
    </div>
  );
}

function FloatingSelect({ label, options, value, onChange }: {
  label:string; options:string[]; value:string; onChange:(v:string)=>void;
}) {
  const [focused,setFocused]=useState(false);
  const active=focused||value.length>0;
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        className="w-full pt-6 pb-2 px-4 rounded-2xl text-sm outline-none transition-all duration-200 appearance-none"
        style={{ background:"#FFFFFF", border:`1.5px solid ${focused?GOLD:"rgba(91,31,36,0.14)"}`,
          boxShadow:focused?`0 0 0 3px rgba(200,160,68,0.1)`:"none",
          color:value?"#222222":"#9A8A78", fontFamily:SANS }}>
        <option value="">Select {label}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <label className="absolute left-4 pointer-events-none transition-all duration-200"
        style={{ top:active?"8px":"50%", transform:active?"translateY(0)":"translateY(-50%)",
          fontSize:active?"10px":"13px", color:focused?GOLD:"#9A8A78", fontFamily:SANS,
          fontWeight:active?600:400, letterSpacing:active?"0.06em":"0",
          textTransform:active?"uppercase":"none" }}>
        {label}
      </label>
      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"#9A8A78"}}/>
    </div>
  );
}

function OtpBoxes({ value, onChange, onComplete }: { value:string[]; onChange:(v:string[])=>void; onComplete?:()=>void; }) {
  const r0=useRef<HTMLInputElement>(null),r1=useRef<HTMLInputElement>(null),
        r2=useRef<HTMLInputElement>(null),r3=useRef<HTMLInputElement>(null),
        r4=useRef<HTMLInputElement>(null),r5=useRef<HTMLInputElement>(null);
  const refs=[r0,r1,r2,r3,r4,r5];
  const handleKey=(i:number,e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key==="Backspace"){if(!value[i]&&i>0)refs[i-1].current?.focus();
      const n=[...value];n[i]="";onChange(n);}
  };
  const handleChange=(i:number,raw:string)=>{
    const d=raw.replace(/\D/g,"");if(!d)return;
    if(d.length>1){const arr=d.slice(0,6).split("");const n=[...value];
      arr.forEach((x,idx)=>{if(idx<6)n[idx]=x;});onChange(n);
      refs[Math.min(arr.length,5)].current?.focus();if(arr.length>=6)onComplete?.();return;}
    const n=[...value];n[i]=d;onChange(n);
    if(i<5)refs[i+1].current?.focus();if(i===5)onComplete?.();
  };
  return(
    <div className="flex gap-2.5 justify-center">
      {Array.from({length:6}).map((_,i)=>(
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={6}
          value={value[i]||""} onKeyDown={e=>handleKey(i,e)} onChange={e=>handleChange(i,e.target.value)}
          className="w-11 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all duration-200"
          style={{ border:`2px solid ${value[i]?GOLD:"rgba(91,31,36,0.15)"}`,
            background:value[i]?"rgba(200,160,68,0.06)":"#FFFFFF", color:MAROON,
            fontFamily:SERIF, boxShadow:value[i]?`0 0 0 3px rgba(200,160,68,0.1)`:"none" }}
          onFocus={e=>{e.target.style.borderColor=GOLD;e.target.style.boxShadow=`0 0 0 3px rgba(200,160,68,0.12)`;}}
          onBlur={e=>{e.target.style.borderColor=value[i]?GOLD:"rgba(91,31,36,0.15)";
            e.target.style.boxShadow=value[i]?`0 0 0 3px rgba(200,160,68,0.1)`:"none";}}/>
      ))}
    </div>
  );
}

function Countdown({ seconds, onEnd }:{seconds:number;onEnd:()=>void;}) {
  const [t,setT]=useState(seconds);
  useEffect(()=>{
    if(t<=0){onEnd();return;}
    const id=setTimeout(()=>setT(s=>s-1),1000);return()=>clearTimeout(id);
  },[t]);
  return <span style={{color:MAROON,fontFamily:SERIF}}>{String(Math.floor(t/60)).padStart(2,"0")}:{String(t%60).padStart(2,"0")}</span>;
}

function CardInput({value,onChange,placeholder,maxLength,type="text"}:{value:string;onChange:(v:string)=>void;placeholder:string;maxLength?:number;type?:string;}){
  const[focused,setFocused]=useState(false);
  return(
    <input type={type} value={value} onChange={e=>onChange(e.target.value)}
      onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
      placeholder={placeholder} maxLength={maxLength}
      className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
      style={{ border:`1.5px solid ${focused?GOLD:"rgba(91,31,36,0.14)"}`,
        boxShadow:focused?`0 0 0 3px rgba(200,160,68,0.1)`:"none",
        background:"#FFFFFF", color:"#222222", fontFamily:SANS, letterSpacing:"0.04em" }}/>
  );
}

// ─── WhatsApp AI Assistant ────────────────────────────────────────────────────
function WhatsAppButton() {
  const [open,setOpen]=useState(false);
  const questions=["Which Yantra is right for me?","How do I use my product?","Track my order"];
  return(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open&&(
        <div className="rounded-2xl p-4 w-64 shadow-2xl" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.1)"}}>
          <div className="flex items-center gap-2 mb-3 pb-3" style={{borderBottom:"1px solid rgba(91,31,36,0.08)"}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{background:"#25D366"}}>💬</div>
            <div>
              <div className="text-xs font-semibold" style={{color:MAROON,fontFamily:SERIF}}>Vedic AI Assistant</div>
              <div className="text-[10px]" style={{color:"#4A8A4A"}}>● Online now</div>
            </div>
          </div>
          <p className="text-xs mb-3" style={{color:"#7A6A58"}}>Hi! How can I guide your spiritual journey today?</p>
          <div className="space-y-2">
            {questions.map(q=>(
              <button key={q} className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                style={{background:"rgba(200,160,68,0.08)",border:`1px solid rgba(200,160,68,0.2)`,color:MAROON}}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(o=>!o)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 relative"
        style={{background:"#25D366"}}>
        {open?<X size={22} color="white"/>:<span className="text-2xl">💬</span>}
        {!open&&<div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">1</div>}
      </button>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onCartClick, cartCount, onLogoClick, isCartPage, onSignIn, onShopClick, onConsultClick, onProfileClick, isLoggedIn }:{
  onCartClick:()=>void; cartCount:number; onLogoClick:()=>void;
  isCartPage:boolean; onSignIn:()=>void; onShopClick:()=>void;
  onConsultClick:()=>void; onProfileClick:()=>void; isLoggedIn:boolean;
}) {
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>60);
    window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);
  },[]);
  const forceLight=isCartPage;
  const solid=scrolled||forceLight;
  const navLinks:[string,()=>void][]=[
    ["Home",onLogoClick],
    ["Shop",onShopClick],
    ["Consult",onConsultClick],
    ["About",onLogoClick],
  ];
  return(
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{ background:solid?"rgba(250,247,242,0.97)":"transparent",
        backdropFilter:solid?"blur(12px)":"none",
        borderBottom:solid?`1px solid rgba(91,31,36,0.1)`:"none",
        boxShadow:solid?"0 2px 24px rgba(91,31,36,0.06)":"none", fontFamily:SANS }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16 lg:h-20">
        <button onClick={onLogoClick} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105"
            style={{background:`linear-gradient(135deg,${MAROON},${SAFFRON})`,color:IVORY,fontFamily:SERIF}}>ॐ</div>
          <span className="text-xl font-semibold tracking-wide" style={{fontFamily:SERIF,color:MAROON}}>Aroham</span>
        </button>
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(([l,fn])=>(
            <button key={l} onClick={fn}
              className="text-sm font-medium tracking-wide transition-colors duration-200 hover:opacity-70"
              style={{color:solid?MAROON:"#FAF7F2",fontSize:"0.8125rem"}}>{l}</button>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <button className="p-2 rounded-full transition-colors hover:bg-black/5" style={{color:solid?MAROON:IVORY}}><Search size={18} strokeWidth={1.5}/></button>
          <button className="p-2 rounded-full transition-colors hover:bg-black/5" style={{color:solid?MAROON:IVORY}}><Heart size={18} strokeWidth={1.5}/></button>
          <button onClick={onCartClick} className="relative p-2 rounded-full transition-colors hover:bg-black/5" style={{color:solid?MAROON:IVORY}}>
            <ShoppingCart size={18} strokeWidth={1.5}/>
            {cartCount>0&&<span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-semibold" style={{background:GOLD}}>{cartCount}</span>}
          </button>
          {isLoggedIn ? (
            <button onClick={onProfileClick}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:opacity-90 hover:scale-105"
              style={{background:`linear-gradient(135deg,${MAROON},${SAFFRON})`,color:IVORY}}>
              <User size={16}/>
            </button>
          ) : (
            <button onClick={onSignIn} className="px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 hover:opacity-90" style={{background:MAROON,color:IVORY}}>Sign In</button>
          )}
        </div>
        <div className="lg:hidden flex items-center gap-3" style={{color:solid?MAROON:IVORY}}>
          <button onClick={onCartClick} className="relative p-1">
            <ShoppingCart size={20} strokeWidth={1.5}/>
            {cartCount>0&&<span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-white text-[9px] flex items-center justify-center font-semibold" style={{background:GOLD}}>{cartCount}</span>}
          </button>
          <button onClick={()=>setOpen(!open)} className="p-1">{open?<X size={22}/>:<Menu size={22}/>}</button>
        </div>
      </div>
      <div className="lg:hidden overflow-hidden transition-all duration-300"
        style={{maxHeight:open?"400px":"0",background:"rgba(250,247,242,0.98)",backdropFilter:"blur(16px)"}}>
        <div className="px-6 pt-2 pb-6 flex flex-col gap-4">
          {navLinks.map(([l,fn])=>(
            <button key={l} onClick={()=>{fn();setOpen(false);}} className="py-2 text-sm font-medium border-b text-left" style={{color:MAROON,borderColor:"rgba(91,31,36,0.08)"}}>{l}</button>
          ))}
          {isLoggedIn ? (
            <button onClick={()=>{onProfileClick();setOpen(false);}} className="mt-2 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2" style={{background:MAROON,color:IVORY}}><User size={15}/>My Profile</button>
          ) : (
            <button onClick={onSignIn} className="mt-2 py-3 rounded-full text-sm font-medium" style={{background:MAROON,color:IVORY}}>Sign In</button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({ items, onClose, onRemove, onQty, onCheckout, onHome }:{
  items:CartItem[]; onClose:()=>void; onRemove:(id:number)=>void;
  onQty:(id:number,delta:number)=>void; onCheckout:()=>void; onHome:()=>void;
}) {
  const subtotal=items.reduce((s,i)=>s+i.product.price*i.qty,0);
  const total=subtotal+99+Math.round(subtotal*0.05);
  return(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-md flex flex-col h-full shadow-2xl"
        style={{background:IVORY,transform:"translateX(0)",transition:"transform 0.3s ease"}}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{borderBottom:`1px solid rgba(91,31,36,0.08)`}}>
          <div className="flex items-center gap-3">
            <button onClick={()=>{ onClose(); onHome(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-sm active:scale-95"
              style={{background:"rgba(91,31,36,0.07)",color:MAROON,border:`1px solid rgba(91,31,36,0.12)`}}>
              <ChevronLeft size={13}/> Home
            </button>
            <div>
              <h2 className="text-lg font-semibold leading-tight" style={{fontFamily:SERIF,color:MAROON}}>Your Cart</h2>
              <p className="text-xs" style={{color:"#9A8A78"}}>{items.length} item{items.length!==1?"s":""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors" style={{color:MAROON}}><X size={20}/></button>
        </div>
        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length===0?(
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🪷</div>
              <p className="text-sm font-semibold mb-1" style={{fontFamily:SERIF,color:MAROON}}>Your cart is peaceful</p>
              <p className="text-xs" style={{color:"#7A6A58"}}>Add sacred products to begin your journey</p>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium" style={{background:MAROON,color:IVORY}}>Explore Products</button>
            </div>
          ):items.map(({product:p,qty})=>(
            <div key={p.id} className="flex gap-3 p-4 rounded-2xl" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.07)"}}>
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-snug mb-0.5" style={{fontFamily:SERIF,color:MAROON}}>{p.name}</p>
                <p className="text-[10px] mb-2" style={{color:"#9A8A78"}}>{p.subtitle}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full overflow-hidden" style={{border:`1.5px solid rgba(91,31,36,0.12)`}}>
                    <button onClick={()=>onQty(p.id,-1)} className="w-7 h-7 flex items-center justify-center hover:bg-black/5" style={{color:MAROON}}><Minus size={11}/></button>
                    <span className="w-6 text-center text-xs font-semibold" style={{color:MAROON}}>{qty}</span>
                    <button onClick={()=>onQty(p.id,1)} className="w-7 h-7 flex items-center justify-center hover:bg-black/5" style={{color:MAROON}}><Plus size={11}/></button>
                  </div>
                  <span className="text-sm font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{(p.price*qty).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button onClick={()=>onRemove(p.id)} className="p-1 self-start hover:opacity-60 transition-opacity" style={{color:"#9A8A78"}}><Trash2 size={13}/></button>
            </div>
          ))}
        </div>
        {/* Footer */}
        {items.length>0&&(
          <div className="px-6 py-5" style={{borderTop:`1px solid rgba(91,31,36,0.08)`}}>
            <div className="space-y-2 mb-4">
              {[["Subtotal",`₹${subtotal.toLocaleString("en-IN")}`],["Temple Energization","₹99"],["Shipping","FREE"],["GST (5%)",`₹${Math.round(subtotal*0.05).toLocaleString("en-IN")}`]].map(([l,v])=>(
                <div key={l} className="flex justify-between text-xs" style={{color:"#7A6A58"}}>
                  <span>{l}</span><span style={{color:v==="FREE"?"#4A8A4A":MAROON,fontWeight:600}}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold pt-2" style={{borderTop:`1px solid rgba(91,31,36,0.08)`,color:MAROON}}>
                <span>Grand Total</span>
                <span style={{fontFamily:PRICE_FONT,fontSize:"1.1rem"}}>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button onClick={()=>{onClose();onCheckout();}}
              className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg"
              style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
              <Lock size={14}/> Proceed to Checkout
            </button>
            <button onClick={onClose} className="w-full py-3 text-sm font-medium text-center mt-2 hover:opacity-70 transition-opacity" style={{color:MAROON}}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Navagraha Hero ───────────────────────────────────────────────────────────
function NavagrahaHero({ onShop, onConsult }:{onShop:()=>void;onConsult:()=>void;}) {
  const [hoveredGraha, setHoveredGraha] = useState<number | null>(null);
  // Scale factor — larger planets, fill the right half
  const S = 1.05;
  // Generate stable star positions (seeded so no re-render flicker)
  const STARS = Array.from({length:90},(_,i)=>({
    x: ((i*137.508)%100),
    y: ((i*97.351)%100),
    r: i%7===0?1.5:i%3===0?1:0.6,
    o: 0.3+((i*53)%100)/200,
    d: 1.5+((i*31)%30)/10,
  }));

  return(
    <section className="relative overflow-hidden"
      style={{background:"#0A0608"}}>
      <style>{`
        @keyframes orbitPlanet { from{transform:rotate(0deg) translateX(var(--r)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--r)) rotate(-360deg)} }
        @keyframes pulseSun { 0%,100%{box-shadow:0 0 60px 20px rgba(255,200,50,0.35),0 0 120px 40px rgba(255,150,0,0.15)} 50%{box-shadow:0 0 80px 30px rgba(255,200,50,0.5),0 0 160px 60px rgba(255,150,0,0.25)} }
        @keyframes glowRing { 0%,100%{opacity:0.12} 50%{opacity:0.3} }
        @keyframes tooltipIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes twinkle { 0%,100%{opacity:var(--so)} 50%{opacity:calc(var(--so)*0.35)} }
      `}</style>

      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARS.map((s,i)=>(
          <div key={i} className="absolute rounded-full bg-white"
            style={{left:`${s.x}%`,top:`${s.y}%`,width:s.r*2,height:s.r*2,
              opacity:s.o,["--so" as string]:s.o,
              animation:`twinkle ${s.d}s ease-in-out infinite`,animationDelay:`-${(i*0.4)%s.d}s`}}/>
        ))}
      </div>

      {/* Primary warm amber glow — left/center, behind hero text (matches reference) */}
      <div className="absolute pointer-events-none" style={{
        left:"-5%", top:"5%", width:"70%", height:"85%",
        background:"radial-gradient(ellipse at 30% 45%, rgba(231,139,47,0.38) 0%, rgba(200,100,20,0.22) 30%, rgba(150,60,10,0.10) 55%, transparent 75%)",
        filter:"blur(48px)"
      }}/>
      {/* Secondary saffron bloom — center-left midpoint */}
      <div className="absolute pointer-events-none" style={{
        left:"5%", top:"20%", width:"45%", height:"55%",
        background:"radial-gradient(ellipse at 40% 40%, rgba(255,170,50,0.18) 0%, transparent 65%)",
        filter:"blur(60px)"
      }}/>
      {/* Deep maroon undertone — bottom */}
      <div className="absolute pointer-events-none" style={{
        left:"-10%", bottom:"-5%", width:"55%", height:"50%",
        background:"radial-gradient(ellipse at 25% 90%, rgba(91,31,24,0.4) 0%, transparent 65%)",
        filter:"blur(55px)"
      }}/>
      {/* Right side stays dark — faint cool ember to frame the solar system */}
      <div className="absolute pointer-events-none" style={{
        right:"-5%", top:"0%", width:"50%", height:"100%",
        background:"radial-gradient(ellipse at 80% 50%, rgba(80,30,10,0.12) 0%, transparent 70%)",
        filter:"blur(30px)"
      }}/>


      {/* Two-column layout */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-0 px-[24px] pt-[200px] pb-[60px]" style={{minHeight:"calc(100vh - 0px)"}}>


        {/* LEFT — Text content */}
        <div className="flex flex-col lg:w-1/2 text-center lg:text-left lg:pr-8 xl:pr-16 justify-center mx-[0px] mt-[-100px] mb-[0px]">
          {/* Eyebrow */}
          <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full" style={{background:SAFFRON}}/>
            <span className="text-[11px] tracking-[0.28em] uppercase font-semibold" style={{color:SAFFRON,fontFamily:"'Space Grotesk',sans-serif"}}>Vedic Astrology & Vastu</span>
          </div>

          {/* Heading — Space Grotesk Bold like reference */}
          <h1 className="mb-5" style={{
            fontFamily:"'Space Grotesk', sans-serif",
            fontSize:"clamp(2.4rem,5vw,4.2rem)",
            fontWeight:700,
            color:IVORY,
            lineHeight:1.05,
            letterSpacing:"-0.02em"
          }}>
            Harness the<br/>
            Power of<br/>
            <span style={{
              color:SAFFRON,
              textShadow:`0 0 40px rgba(231,139,47,0.5)`
            }}>the Navagrahas</span>
          </h1>

          <p className="text-sm mb-7 max-w-sm mx-auto lg:mx-0" style={{
            color:"rgba(250,247,242,0.55)",
            fontFamily:"'Space Grotesk', sans-serif",
            fontWeight:400,
            lineHeight:1.7
          }}>
            Authentic Vedic products & expert consultations to align your life with cosmic energy. Temple energized. Astrologer recommended.
          </p>

          <div className="flex gap-3 justify-center lg:justify-start mb-8">
            <button onClick={onShop}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:scale-105 hover:shadow-2xl whitespace-nowrap"
              style={{background:`linear-gradient(135deg,${SAFFRON},${GOLD})`,color:"#1A0D0E",fontFamily:"'Space Grotesk',sans-serif",boxShadow:`0 4px 20px rgba(231,139,47,0.35)`}}>
              🛍 Shop Now
            </button>
            <button onClick={onConsult}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide border transition-all hover:bg-white/8 whitespace-nowrap"
              style={{borderColor:"rgba(250,247,242,0.2)",color:IVORY,fontFamily:"'Space Grotesk',sans-serif",background:"rgba(255,255,255,0.05)"}}>
              🔮 Talk to Astrologer
            </button>
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-2 gap-2.5 px-[0px] py-[50px]">
            {[["12,000+","Happy Customers","🙏"],["500+","Products","🛍"],["98%","Satisfaction","⭐"],["Temple","Energized","🪔"]].map(([n,l,icon])=>(
              <div key={l} className="py-2.5 rounded-xl flex items-center gap-3 px-[12px] py-[15px]"
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",backdropFilter:"blur(8px)"}}>
                <span className="text-lg">{icon}</span>
                <div className="text-left">
                  <div className="text-sm font-bold leading-tight" style={{fontFamily:"'Space Grotesk',sans-serif",color:GOLD}}>{n}</div>
                  <div className="text-[10px] leading-tight" style={{color:"rgba(250,247,242,0.5)",fontFamily:"'Space Grotesk',sans-serif"}}>{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Solar system (hidden on mobile) */}
        <div className="hidden lg:flex flex-shrink-0 items-center justify-center lg:w-1/2 order-1 lg:order-2 p-[0px]"
          style={{width:"100%", marginTop:"-340px"}}>
          <div className="relative flex items-center justify-center"
            style={{width:Math.round(460*S),height:Math.round(460*S)}}>
            {/* Sun — center */}
            <div className="absolute z-10 rounded-full flex flex-col items-center justify-center cursor-default group"
              style={{width:Math.round(GRAHAS[0].size*S*1.4),height:Math.round(GRAHAS[0].size*S*1.4),
                background:"radial-gradient(circle,#FFF8E1,#FFD700,#FF8C00)",
                animation:"pulseSun 3s ease-in-out infinite",top:"50%",left:"13%",
                transform:"translate(-50%,-50%)"}}>
              <span style={{fontSize:14}}>☀️</span>
              <span className="text-[7px] font-bold" style={{color:"#5B3000"}}>Surya</span>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 p-3 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none z-50"
                style={{background:"rgba(10,5,8,0.95)",border:`1px solid rgba(200,160,68,0.3)`,backdropFilter:"blur(12px)",transition:"opacity 0.2s ease"}}>
                <div className="text-sm font-semibold mb-0.5" style={{color:GOLD,fontFamily:SERIF}}>Surya — Sun</div>
                <div className="text-[10px] mb-1" style={{color:"rgba(250,247,242,0.6)"}}>Soul, authority, vitality</div>
                <div className="text-[9px]" style={{color:"rgba(200,160,68,0.7)"}}>💎 Ruby</div>
              </div>
            </div>

            {/* Orbiting planets */}
            {GRAHAS.slice(1).map((g,i)=>{
              const orbitSize=Math.round(((g.orbit*2)+g.size)*S);
              const pSize=Math.round(g.size*S*0.9);
              const orbitR=Math.round(g.orbit*S);
              const gi=i+1;
              return(
                <div key={g.name} className="absolute mx-[-150px] my-[0px]"
                  style={{width:orbitSize,height:orbitSize,top:"50%",left:"44%",transform:"translate(-50%,-50%)"}}>
                  <div className="absolute group"
                    style={{top:"50%",left:"50%",["--r" as string]:`${orbitR}px`,
                      animation:`orbitPlanet ${g.speed}s linear infinite`,animationDelay:`-${i*1.5}s`,
                      marginTop:`-${pSize/2}px`,marginLeft:`-${pSize/2}px`,cursor:"default",
                      zIndex:hoveredGraha===gi?40:10}}>
                    <div className="rounded-full transition-transform duration-200 group-hover:scale-150"
                      style={{width:pSize,height:pSize,background:g.color,boxShadow:`0 0 ${pSize}px ${g.color}88`}}
                      onMouseEnter={()=>setHoveredGraha(gi)}
                      onMouseLeave={()=>setHoveredGraha(null)}/>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 whitespace-nowrap pointer-events-none"
                      style={{fontSize:"7px",color:"rgba(200,160,68,0.75)",fontFamily:SANS,fontWeight:700}}>
                      {g.name}
                    </div>
                    {hoveredGraha===gi&&(
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-44 p-3 rounded-2xl pointer-events-none"
                        style={{background:"rgba(10,5,8,0.96)",border:`1px solid rgba(200,160,68,0.35)`,
                          backdropFilter:"blur(12px)",boxShadow:`0 8px 32px rgba(0,0,0,0.5)`,
                          animation:"tooltipIn 0.15s ease",zIndex:50}}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:g.color,boxShadow:`0 0 6px ${g.color}`}}/>
                          <span className="text-sm font-semibold" style={{color:GOLD,fontFamily:SERIF}}>{g.name}</span>
                        </div>
                        {g.en&&<div className="text-[10px] mb-1" style={{color:"rgba(250,247,242,0.5)"}}>{g.en}</div>}
                        <div className="text-[11px] leading-relaxed mb-1.5" style={{color:"rgba(250,247,242,0.75)"}}>{g.desc}</div>
                        <div className="text-[10px]" style={{color:"rgba(200,160,68,0.8)"}}>💎 {g.gem}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>



      </div>


    </section>
  );
}

// ─── Hexagonal Prism Product Carousel ────────────────────────────────────────
function HexPrismCarousel({ onProductClick }:{ onProductClick:(p:ArohamProduct)=>void }) {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const products = AROHAM_PRODUCTS;
  const n = products.length;

  // Card geometry — large & immersive in default state
  const faceW = expanded ? 110 : 150;
  const faceH = expanded ? 145 : 200;
  const tz    = expanded ? 140 : 190; // translateZ radius of cylinder
  const activeScale = expanded ? 1.25 : 1.35;

  const pauseRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const autoRef  = useRef<ReturnType<typeof setInterval>|null>(null);

  const pauseAuto = () => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    if (pauseRef.current) clearTimeout(pauseRef.current);
    pauseRef.current = setTimeout(() => {
      autoRef.current = setInterval(() => { setCurrent(c => (c + 1) % n); setExpanded(false); }, 5000);
    }, 10000);
  };

  const prev = () => { setCurrent(c => (c - 1 + n) % n); setExpanded(false); pauseAuto(); };
  const next = () => { setCurrent(c => (c + 1) % n); setExpanded(false); pauseAuto(); };

  useEffect(() => {
    autoRef.current = setInterval(() => { setCurrent(c => (c + 1) % n); setExpanded(false); }, 5000);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
      if (pauseRef.current) clearTimeout(pauseRef.current);
    };
  }, []);

  const dragRef = useRef<{startX:number; dragging:boolean}>({startX:0, dragging:false});
  const wheelCooldown = useRef(false);
  const onDragStart = (clientX:number) => { dragRef.current = {startX:clientX, dragging:true}; };
  const onDragEnd   = (clientX:number) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const delta = dragRef.current.startX - clientX;
    if (Math.abs(delta) > 30) { delta > 0 ? next() : prev(); }
  };

  const p = products[current];

  return (
    <div className="relative flex flex-col items-center w-full flex-1" style={{ transition:"all 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
      <style>{`
        @keyframes faceGlow {
          0%,100% { box-shadow: 0 0 24px 6px rgba(200,160,68,0.22); }
          50%      { box-shadow: 0 0 48px 14px rgba(200,160,68,0.38); }
        }
        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
      `}</style>

      {/* ── 3D scene ── */}
      <div
        className="relative flex items-center justify-center w-full"
        style={{
          height: faceH + 60,
          marginTop: expanded ? 16 : 24,
          marginBottom: expanded ? 8 : 20,
          transition:"all 0.5s cubic-bezier(0.4,0,0.2,1)"
        }}>

        {/* Left arrow */}
        <button onClick={prev}
          className="absolute left-0 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background:"rgba(200,160,68,0.13)", border:`1px solid rgba(200,160,68,0.3)`, color:GOLD, top:"50%", transform:"translateY(-50%)" }}>
          <ChevronLeft size={18}/>
        </button>

        {/* Perspective wrapper */}
        <div
          onMouseDown={e=>onDragStart(e.clientX)}
          onMouseUp={e=>onDragEnd(e.clientX)}
          onMouseLeave={e=>onDragEnd(e.clientX)}
          onTouchStart={e=>onDragStart(e.touches[0].clientX)}
          onTouchEnd={e=>onDragEnd(e.changedTouches[0].clientX)}
          onWheel={e=>{ e.preventDefault(); if(wheelCooldown.current) return; const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY; if(Math.abs(d)<25) return; d>0?next():prev(); wheelCooldown.current=true; setTimeout(()=>{ wheelCooldown.current=false; },500); pauseAuto(); }}
          style={{ perspective:1100, width:faceW*5, height:faceH, display:"flex", alignItems:"center", justifyContent:"center", cursor:"grab", userSelect:"none" }}>

          {/* Cylinder scene */}
          <div style={{
            width:faceW, height:faceH, position:"relative",
            transformStyle:"preserve-3d",
            transform:`rotateY(${-current*(360/n)}deg)`,
            transition:"transform 0.7s cubic-bezier(0.4,0,0.2,1)"
          }}>
            {products.map((prod, i) => {
              const angle   = i * (360 / n);
              const isActive = i === current;
              return (
                <div key={prod.id}
                  onClick={() => { pauseAuto(); if (isActive) { setExpanded(e => !e); } else { setCurrent(i); setExpanded(false); } }}
                  style={{
                    position:"absolute", width:faceW, height:faceH,
                    transform:`rotateY(${angle}deg) translateZ(${tz}px) ${isActive ? `scale(${activeScale})` : "scale(0.88)"}`,
                    backfaceVisibility:"hidden",
                    borderRadius:22, overflow:"hidden", cursor:"pointer",
                    display:"flex", flexDirection:"column",
                    background: isActive
                      ? `linear-gradient(170deg,${MAROON} 0%,#2A0A0E 100%)`
                      : `linear-gradient(170deg,#1A0808 0%,#0D0404 100%)`,
                    border:`2px solid ${isActive ? GOLD : "rgba(200,160,68,0.12)"}`,
                    boxShadow: isActive ? "0 0 0 1px rgba(200,160,68,0.15)" : "none",
                    animation: isActive ? "faceGlow 2.8s ease-in-out infinite" : "none",
                    transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1), border 0.3s, width 0.5s, height 0.5s",
                    zIndex: isActive ? 20 : 1,
                  }}>

                  {/* Image — fills most of card */}
                  <div style={{ flex:"1 1 0", overflow:"hidden", position:"relative", minHeight:0 }}>
                    <img src={prod.img} alt={prod.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover",
                        opacity: isActive ? 0.92 : 0.38,
                        transform: isActive ? "scale(1.06)" : "scale(1)",
                        transition:"all 0.5s ease" }}/>
                    {/* Gradient overlay bottom */}
                    <div style={{ position:"absolute", inset:0,
                      background:"linear-gradient(to bottom, transparent 45%, rgba(20,4,6,0.85) 100%)" }}/>
                    {/* Badge */}
                    <div style={{ position:"absolute", top:8, left:8,
                      background:"rgba(91,31,36,0.92)", color:GOLD,
                      fontSize:6, fontWeight:700, padding:"2px 8px",
                      borderRadius:99, letterSpacing:"0.14em", textTransform:"uppercase",
                      backdropFilter:"blur(4px)" }}>
                      {prod.badges[0]}
                    </div>
                    {/* Name over image bottom */}
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 10px 6px" }}>
                      <div style={{ fontFamily:SERIF, fontSize:7, fontWeight:700, color:IVORY,
                        lineHeight:1.2, textShadow:"0 1px 8px rgba(0,0,0,0.8)",
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize:6, color:"rgba(250,247,242,0.55)", fontFamily:SANS,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:2 }}>
                        {prod.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* CTA strip — only on active */}
                  {isActive && (
                    <div style={{ padding:"7px 10px", textAlign:"center",
                      background:`linear-gradient(90deg,${GOLD} 0%,#E8B84B 100%)`,
                      color:"#1A0D0E", fontSize:6.5, fontWeight:800,
                      letterSpacing:"0.1em", flexShrink:0 }}>
                      {expanded ? "TAP TO CLOSE ✕" : "TAP TO EXPAND ↓"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right arrow */}
        <button onClick={next}
          className="absolute right-0 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background:"rgba(200,160,68,0.13)", border:`1px solid rgba(200,160,68,0.3)`, color:GOLD, top:"50%", transform:"translateY(-50%)" }}>
          <ChevronRight size={18}/>
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom: expanded ? 10 : 4, transition:"all 0.4s" }}>
        {products.map((_,i)=>(
          <div key={i} onClick={()=>{ setCurrent(i); setExpanded(false); pauseAuto(); }}
            style={{ width:i===current?20:6, height:6, borderRadius:99,
              background:i===current?GOLD:"rgba(200,160,68,0.25)",
              transition:"all 0.35s", cursor:"pointer" }}/>
        ))}
      </div>

      {/* Spacer — pushes detail panel to bottom */}
      <div className="flex-1"/>

      {/* ── Expanded detail panel ── */}
      <div style={{
        width:"100%", overflow:"hidden",
        maxHeight: expanded ? 220 : 0,
        opacity: expanded ? 1 : 0,
        transition:"max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",
        pointerEvents: expanded ? "auto" : "none",
      }}>
        <div className="rounded-2xl p-4" style={{ background:"rgba(91,31,36,0.10)", border:"1px solid rgba(200,160,68,0.2)", backdropFilter:"blur(8px)" }}>
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div className="font-semibold leading-snug mb-0.5" style={{ fontFamily:SERIF, fontSize:13, color:IVORY }}>{p.name}</div>
              <div className="text-[11px] leading-relaxed mb-3" style={{ color:"rgba(250,247,242,0.55)" }}>{p.shortDesc}</div>
              <div className="flex gap-2 items-center">
                <button onClick={()=>onProductClick(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-90 active:scale-95"
                  style={{ background:MAROON, color:IVORY }}>View Details</button>
                <div className="px-3 py-2 rounded-xl text-xs font-bold flex items-center"
                  style={{ background:"rgba(200,160,68,0.18)", color:GOLD, fontFamily:PRICE_FONT, whiteSpace:"nowrap" }}>
                  ₹{p.price}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shop + Consult Cards ─────────────────────────────────────────────────────
function ShopConsultCards({ onShop, onProductClick }:{onShop:()=>void; onProductClick?:(p:ArohamProduct)=>void;}) {
  return(
    <section className="py-20 px-6 lg:px-10" style={{background:IVORY}}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Shop card */}
        <div className="rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl h-full"
          style={{background:`linear-gradient(160deg,${MAROON} 0%,#5C1B23 100%)`,boxShadow:"0 20px 50px rgba(92,27,35,0.35)"}}>
          <div className="p-8 flex flex-col gap-5 relative h-full">
            <div className="absolute inset-0 opacity-5" style={{backgroundImage:`radial-gradient(circle,${GOLD} 1px,transparent 1px)`,backgroundSize:"24px 24px"}}/>

            {/* Spacer — pushes heading down to align with right card title */}
            <div className="flex-1 relative z-10"/>

            {/* Heading */}
            <div className="relative z-10">
              <h2 style={{fontFamily:SERIF,fontSize:"clamp(2rem,3.5vw,2.6rem)",fontWeight:700,color:IVORY,lineHeight:1.1,marginBottom:8}}>Sacred Store</h2>
              <p className="text-sm leading-relaxed" style={{color:GOLD,maxWidth:480}}>Yantras, Rudraksha, Crystals, Pendants & complete Vastu remedies — all temple energized.</p>
            </div>

            {/* Product thumbnails — directly below subtitle */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
              {[AROHAM_PRODUCTS[0],AROHAM_PRODUCTS[1],AROHAM_PRODUCTS[2]].map(p=>(
                <div key={p.id} className="rounded-xl overflow-hidden" style={{aspectRatio:"1/0.92",width:"100%",background:"rgba(28,18,10,0.6)"}}>
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"/>
                </div>
              ))}
            </div>

            {/* Circular icon badges — replacing category chips */}
            <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-0" style={{borderTop:"1px solid rgba(200,160,68,0.12)"}}>
              {[
                {icon:<Flame size={13}/>, label:"Temple Energized"},
                {icon:<CheckCircle size={13}/>, label:"Certified Authentic"},
                {icon:<Truck size={13}/>, label:"Free Shipping"},
                {icon:<Shield size={13}/>, label:"COD Available"},
              ].map(({icon,label})=>(
                <div key={label} className="flex items-center gap-2.5 py-2.5"
                  style={{borderBottom:"1px solid rgba(200,160,68,0.08)"}}>
                  <span style={{color:GOLD,flexShrink:0}}>{icon}</span>
                  <span style={{fontSize:11,color:"rgba(217,195,171,0.6)",fontFamily:SANS,letterSpacing:"0.02em"}}>{label}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="relative z-10 flex items-center gap-2 text-sm" style={{color:"rgba(217,195,171,0.8)"}}>
              <span style={{color:GOLD,letterSpacing:2}}>★★★★★</span>
              <strong style={{color:IVORY}}>4.8</strong>
              <span className="w-1 h-1 rounded-full inline-block" style={{background:"rgba(217,195,171,0.5)"}}/>
              <span>12,000+ devotees served</span>
            </div>

            {/* Spacer — pushes big CTA to bottom */}
            <div className="flex-1 relative z-10"/>

            {/* Big Shop Now — fills negative space when right card expands */}
            <button onClick={onShop}
              className="relative z-10 w-full flex items-center justify-center gap-3 rounded-2xl font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{background:GOLD,color:"#5C1B23",fontFamily:SANS,fontSize:"clamp(1rem,2vw,1.2rem)",padding:"18px 24px",letterSpacing:"0.01em"}}>
              Shop Now <ArrowRight size={18}/>
            </button>
          </div>
        </div>
        {/* Consult card */}
        <div className="rounded-3xl overflow-hidden" onClick={e=>e.stopPropagation()} style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 4px 30px rgba(91,31,36,0.06)",minHeight:280}}>
          <div className="p-6 pb-10 flex flex-col h-full relative" style={{background:`linear-gradient(135deg,#0D0508,#1A0D10)`}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs tracking-widest uppercase font-semibold" style={{color:GOLD,fontFamily:SANS}}>Sacred Collection</span>
            </div>
            <h2 className="mb-1.5" style={{fontFamily:SERIF,fontSize:"clamp(1.4rem,2.5vw,1.9rem)",fontWeight:500,color:IVORY,lineHeight:1.2}}>Explore Our<br/><em style={{color:GOLD}}>Sacred Store</em></h2>
            <HexPrismCarousel onProductClick={onProductClick ?? (()=>{})}/>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How Products Are Made ────────────────────────────────────────────────────
// Image for each craft step — cycles through product images
const CRAFT_IMAGES = [baglaImg, yantraPlateImg, navratnaImg, pyramidImg, navratnaImg];

function HowItsMade() {
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setStep(s => (s + 1) % CRAFT_STEPS.length), 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const goToStep = (i: number) => { setStep(i); resetTimer(); };

  const s = CRAFT_STEPS[step];

  return (
    <section className="py-20 relative overflow-hidden" style={{background:"#0D0508"}}>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:`radial-gradient(circle,${GOLD} 1px,transparent 1px)`,backgroundSize:"32px 32px"}}/>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="text-center mb-14">
          <span className="text-xs tracking-[0.25em] uppercase font-medium mb-3 block" style={{color:GOLD,fontFamily:SANS}}>Craftsmanship</span>
          <h2 style={{fontFamily:SERIF,fontSize:"clamp(1.75rem,4vw,2.75rem)",fontWeight:500,color:IVORY,lineHeight:1.15}}>
            From Earth to Sacred Artifact
          </h2>
          <p className="text-sm mt-2" style={{color:"rgba(250,247,242,0.45)"}}>Every Aroham product follows a sacred 5-step ritual process</p>
        </div>

        {/* Step pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CRAFT_STEPS.map((cs,i)=>(
            <button key={i} onClick={()=>goToStep(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all duration-200 whitespace-nowrap"
              style={{fontSize:"10px",background:i===step?GOLD:"rgba(255,255,255,0.06)",
                border:`1px solid ${i===step?GOLD:"rgba(255,255,255,0.1)"}`,
                color:i===step?"#1A0D0E":"rgba(255,255,255,0.5)",
                transform:i===step?"scale(1.05)":"scale(1)"}}>
              <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center font-black flex-shrink-0"
                style={{fontSize:"8px",background:i===step?"rgba(0,0,0,0.2)":"rgba(200,160,68,0.15)",color:i===step?"#1A0D0E":GOLD}}>{i+1}</span>
              <span>{cs.title.split(" ").slice(0,2).join(" ")}</span>
            </button>
          ))}
        </div>

        {/* Active step — big image + text */}
        <div key={step} className="grid lg:grid-cols-2 gap-10 items-center" style={{animation:"fadeSlideIn 0.35s ease"}}>
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden" style={{aspectRatio:"4/3"}}>
            <img src={CRAFT_IMAGES[step]} alt={s.title}
              className="w-full h-full object-cover"
              style={{filter:"brightness(0.7)"}}/>
            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{background:"linear-gradient(to top right, rgba(10,5,8,0.85) 0%, transparent 60%)"}}/>
            {/* Step badge */}
            <div className="absolute top-5 left-5">
              <div className="px-4 py-2 rounded-2xl flex items-center gap-2"
                style={{background:"rgba(200,160,68,0.15)",border:"1px solid rgba(200,160,68,0.35)",backdropFilter:"blur(8px)"}}>
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs font-bold tracking-widest" style={{color:GOLD}}>STEP {step+1} / {CRAFT_STEPS.length}</span>
              </div>
            </div>
            {/* Bottom label */}
            <div className="absolute bottom-5 left-5 right-5">
              <div className="text-xs font-semibold mb-1" style={{color:"rgba(200,160,68,0.7)"}}>Aroham Craftsmanship</div>
              <div className="text-xl font-semibold" style={{fontFamily:SERIF,color:IVORY,lineHeight:1.2}}>{s.title}</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{background:"rgba(200,160,68,0.1)",border:"1px solid rgba(200,160,68,0.2)"}}>{s.icon}</div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{color:GOLD}}>Step {step+1} of {CRAFT_STEPS.length}</div>
                <h3 style={{fontFamily:SERIF,fontSize:"1.5rem",fontWeight:500,color:IVORY,lineHeight:1.2}}>{s.title}</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-8" style={{color:"rgba(250,247,242,0.65)"}}>{s.desc}</p>

            {/* All steps as small list */}
            <div className="space-y-3">
              {CRAFT_STEPS.map((cs,i)=>(
                <button key={i} onClick={()=>goToStep(i)}
                  className="hidden md:flex w-full items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-white/5"
                  style={{background:i===step?"rgba(200,160,68,0.1)":"transparent",
                    border:`1px solid ${i===step?"rgba(200,160,68,0.25)":"rgba(255,255,255,0.05)"}`}}>
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{background:i===step?GOLD:"rgba(255,255,255,0.08)",color:i===step?"#1A0D0E":"rgba(255,255,255,0.4)"}}>{i+1}</div>
                  <span className="text-sm font-medium" style={{color:i===step?IVORY:"rgba(255,255,255,0.45)"}}>{cs.title}</span>
                  {i===step&&<ChevronRight size={14} className="ml-auto" style={{color:GOLD}}/>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Products & Combos (two stacked sub-sections, same white page) ────────────
function ProductsAndCombos({ onProductClick, onAddCombo: _onAddCombo, onAddToCart }:{onProductClick:(p:ArohamProduct)=>void;onAddCombo:(name:string)=>void;onAddToCart:(p:ArohamProduct)=>void;}) {
  const [wish,setWish]=useState<Record<string,boolean>>({});
  const toggleWish=(key:string,e:React.MouseEvent)=>{e.stopPropagation();setWish(w=>({...w,[key]:!w[key]}));};

  // Each shelf = label + eyebrow + badge + slice of products (cycling AROHAM_PRODUCTS)
  const shelves:[string,string,string,ArohamProduct[],string][] = [
    ["Bestselling Products","Top Picks","🔥 Trending",  AROHAM_PRODUCTS.slice(0,6), SAFFRON],
    ["Fav Items",          "Fan Favourites","❤️ Loved", [...AROHAM_PRODUCTS].reverse().slice(0,6), "#E74C3C"],
    ["Combo Deals",        "Bundle & Save","🎁 Kits",   AROHAM_PRODUCTS.slice(0,4).concat(AROHAM_PRODUCTS.slice(4)), GOLD],
    ["Mega Sale",          "Limited Time","⚡ Hot",      [...AROHAM_PRODUCTS].sort((a,b)=>b.original-b.price-(a.original-a.price)).slice(0,6), SAFFRON],
    ["Discount Zone",      "Best Savings","🏷️ Off",     AROHAM_PRODUCTS.slice(0,6).sort(()=>0.5-Math.random()), "#4A8A4A"],
  ];

  // Reusable product card
  const ProductCard=({p,wishKey}:{p:ArohamProduct;wishKey:string})=>(
    <div onClick={()=>onProductClick(p)}
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer"
      style={{background:"#FFFFFF",boxShadow:"0 2px 20px rgba(91,31,36,0.06)",border:"1px solid rgba(91,31,36,0.06)"}}
      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 16px 40px rgba(91,31,36,0.14)"}
      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 20px rgba(91,31,36,0.06)"}>
      <div className="relative overflow-hidden aspect-square bg-amber-50">
        <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(91,31,36,0.85)",color:GOLD}}>{p.badges[0]}</div>
        <button onClick={e=>toggleWish(wishKey,e)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{background:"rgba(255,255,255,0.92)"}}>
          <Heart size={12} style={{color:wish[wishKey]?"#E74C3C":"#9A8A78",fill:wish[wishKey]?"#E74C3C":"none"}}/>
        </button>
        {/* Discount badge */}
        {p.original>p.price&&(
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{background:"#E74C3C",color:"#fff"}}>
            -{Math.round((1-p.price/p.original)*100)}%
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold leading-tight mb-0.5 line-clamp-2" style={{fontFamily:SERIF,color:MAROON}}>{p.name}</p>
        <p className="text-[10px] mb-1.5" style={{color:"#7A6A58"}}>{p.subtitle}</p>
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({length:5}).map((_,j)=><Star key={j} size={9} fill={j<Math.round(p.rating)?GOLD:"none"} stroke={GOLD} strokeWidth={1.5}/>)}
          <span className="text-[9px] ml-1" style={{color:"#9A8A78"}}>({p.reviews})</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{p.price}</span>
            <span className="text-[10px] line-through" style={{fontFamily:PRICE_FONT,color:"#9A8A78"}}>₹{p.original}</span>
          </div>
          <button
            onClick={e=>{e.stopPropagation();onAddToCart(p);}}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{background:MAROON,border:"none",cursor:"pointer"}}>
            <Plus size={12} color={IVORY}/>
          </button>
        </div>
      </div>
    </div>
  );

  return(
    <section className="py-20 px-6 lg:px-10" style={{background:IVORY}}>
      <div className="max-w-7xl mx-auto space-y-16">
        {shelves.map(([title, eyebrow, badge, products, eyebrowColor], si)=>(
          <div key={title}>
            {/* Section divider (skip first) */}
            {si>0&&<div className="h-px mb-16" style={{background:"linear-gradient(90deg,transparent,rgba(91,31,36,0.1),transparent)"}}/>}

            {/* Header row */}
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs tracking-[0.18em] uppercase font-medium" style={{color:eyebrowColor,fontFamily:SANS}}>{eyebrow}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{background:`${eyebrowColor}18`,color:eyebrowColor}}>{badge}</span>
                </div>
                <h2 style={{fontFamily:SERIF,fontSize:"clamp(1.6rem,3.5vw,2.5rem)",fontWeight:500,color:MAROON,lineHeight:1.15}}>{title}</h2>
              </div>
              <button className="flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-60"
                style={{color:MAROON}}>
                View all <ChevronRight size={14}/>
              </button>
            </div>

            {/* Product grid */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {products.map((p,pi)=>(
                <ProductCard key={`${si}-${pi}`} p={p} wishKey={`${si}-${p.id}`}/>
              ))}
            </div>
            {/* Mobile: horizontal scroll row */}
            <div className="flex md:hidden gap-3 overflow-x-auto pb-2 -mx-6 px-6"
              style={{scrollbarWidth:"none",msOverflowStyle:"none"}}>
              {products.map((p,pi)=>(
                <div key={`${si}-${pi}-m`} style={{minWidth:"52vw",maxWidth:"52vw",flexShrink:0}}>
                  <ProductCard p={p} wishKey={`${si}-m-${p.id}`}/>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Legacy TopProducts stub (unused, kept for old references) ────────────────
function TopProducts({ onProductClick }:{onProductClick:(p:ArohamProduct)=>void;}) {
  const [wish,setWish]=useState<Record<number,boolean>>({});
  return(
    <section className="py-20 px-6 lg:px-10" style={{background:IVORY}}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{color:SAFFRON,fontFamily:SANS}}>Top Picks</span>
            <h2 style={{fontFamily:SERIF,fontSize:"clamp(2rem,4vw,3rem)",fontWeight:500,color:MAROON,lineHeight:1.15}}>Bestselling Products</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {AROHAM_PRODUCTS.map((p)=>(
            <div key={p.id} onClick={()=>onProductClick(p)}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              style={{background:"#FFFFFF",boxShadow:"0 2px 20px rgba(91,31,36,0.06)",border:"1px solid rgba(91,31,36,0.06)"}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 16px 40px rgba(91,31,36,0.14)"}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 20px rgba(91,31,36,0.06)"}>
              <div className="relative overflow-hidden aspect-square bg-amber-50">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(91,31,36,0.85)",color:GOLD}}>
                  {p.badges[0]}
                </div>
                <button onClick={e=>{e.stopPropagation();setWish(w=>({...w,[p.id]:!w[p.id]}))}}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.9)"}}>
                  <Heart size={12} style={{color:wish[p.id]?"#E74C3C":"#7A6A58",fill:wish[p.id]?"#E74C3C":"none"}}/>
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold leading-tight mb-0.5" style={{fontFamily:SERIF,color:MAROON}}>{p.name}</p>
                <p className="text-[10px] mb-1.5" style={{color:"#7A6A58"}}>{p.subtitle}</p>
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({length:5}).map((_,j)=><Star key={j} size={9} fill={j<Math.round(p.rating)?GOLD:"none"} stroke={GOLD} strokeWidth={1.5}/>)}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{p.price}</span>
                  <span className="text-[10px] line-through" style={{fontFamily:PRICE_FONT,color:"#9A8A78"}}>₹{p.original}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Deals & Combos ───────────────────────────────────────────────────────────
function DealsAndCombos({ onAddCombo }:{onAddCombo:(name:string)=>void;}) {
  return(
    <section className="py-20 px-6 lg:px-10" style={{background:"#F2EBE0"}}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{color:GOLD,fontFamily:SANS}}>Curated Bundles</span>
          <h2 style={{fontFamily:SERIF,fontSize:"clamp(2rem,4vw,3rem)",fontWeight:500,color:MAROON,lineHeight:1.15}}>Sacred Combo Deals</h2>
          <p className="text-sm mt-2" style={{color:"#7A6A58"}}>Save more with expertly curated remedy kits</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {COMBOS.map((c,i)=>(
            <div key={i} className="rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{background:c.color,border:"1px solid rgba(255,255,255,0.08)"}}>
              <div className="p-7">
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily:SERIF,color:IVORY}}>{c.name}</h3>
                <p className="text-xs mb-5" style={{color:"rgba(250,247,242,0.65)"}}>{c.desc}</p>
                <div className="space-y-1.5 mb-6">
                  {c.items.map(item=>(
                    <div key={item} className="flex items-center gap-2 text-xs" style={{color:"rgba(250,247,242,0.8)"}}>
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{background:c.accent}}/>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-2xl font-semibold" style={{fontFamily:PRICE_FONT,color:IVORY}}>₹{c.price.toLocaleString("en-IN")}</div>
                    <div className="text-xs line-through" style={{fontFamily:PRICE_FONT,color:"rgba(250,247,242,0.4)"}}>₹{c.original.toLocaleString("en-IN")}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background:"rgba(255,255,255,0.15)",color:c.accent}}>
                    Save ₹{c.saving.toLocaleString("en-IN")}
                  </span>
                </div>
                <button onClick={()=>onAddCombo(c.name)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{background:c.accent=== GOLD?GOLD:"rgba(255,255,255,0.15)",color:c.accent===GOLD?"#1A0D0E":IVORY,border:`1px solid ${c.accent}`}}>
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Aroham — image-backed cards ─────────────────────────────────────────
const WHY_ITEMS=[
  {icon:Flame, title:"Temple Energized",    desc:"Every product undergoes Pran Pratishtha — consecration rituals by certified Vedic pandits.",   img:pyramidImg,   tag:"Sacred Ritual"},
  {icon:Gem,   title:"100% Authentic",       desc:"Sourced directly from master artisans across India's most revered sacred craft centres.",        img:baglaImg,     tag:"Verified Quality"},
  {icon:Star,  title:"Astrologer Curated",   desc:"Each product recommended by India's most respected Jyotish and Vastu experts.",                  img:navratnaImg,  tag:"Expert Endorsed"},
  {icon:Shield,title:"Secure Shopping",      desc:"PCI-DSS compliant checkout with 256-bit SSL encryption and zero stored card data.",              img:gemstonImg,   tag:"256-bit SSL"},
  {icon:Package,title:"Premium Packaging",  desc:"Luxury gift packaging with an authenticity certificate sealed inside every shipment.",            img:yantraPlateImg,tag:"Certificate Included"},
  {icon:Award, title:"Easy Returns",         desc:"Hassle-free 7-day returns on every product. Your satisfaction is our sacred promise.",            img:pendantSilImg, tag:"7-Day Policy"},
];
function WhyAroham(){
  return(
    <section className="relative overflow-hidden" style={{background:"#07030A"}}>
      <style>{`
        @keyframes driftGlow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes lineGrow { from{width:0} to{width:100%} }
        .why-card:hover .why-line { animation: lineGrow 0.5s ease forwards; }
        .why-card:hover { transform: translateY(-4px); }
      `}</style>

      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{position:"absolute",top:"-10%",left:"-5%",width:"55%",height:"70%",
          background:"radial-gradient(ellipse at 30% 30%,rgba(91,31,36,0.55) 0%,rgba(91,31,36,0.15) 45%,transparent 70%)",
          filter:"blur(80px)",animation:"driftGlow 8s ease-in-out infinite"}}/>
        <div style={{position:"absolute",bottom:"-15%",right:"-5%",width:"50%",height:"65%",
          background:"radial-gradient(ellipse at 70% 70%,rgba(200,160,68,0.2) 0%,rgba(231,139,47,0.08) 45%,transparent 70%)",
          filter:"blur(70px)",animation:"driftGlow 11s ease-in-out infinite",animationDelay:"3s"}}/>
        {/* Fine grain overlay */}
        <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",backgroundSize:"180px"}}/>
      </div>

      {/* ── Hero headline band ── */}
      <div className="relative z-10 pt-12 lg:pt-24 pb-0 px-6 lg:px-16 max-w-7xl mx-auto">

        {/* Header — compact on mobile, spacious on desktop */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8 mb-8 lg:mb-20">
          <div>
            <div className="flex items-center gap-3 mb-3 lg:mb-6">
              <div style={{width:32,height:1,background:`linear-gradient(to right,${GOLD},transparent)`}}/>
              <span className="text-[10px] tracking-[0.35em] uppercase font-bold" style={{color:GOLD,fontFamily:SANS}}>The Aroham Difference</span>
            </div>
            <p className="mb-1 lg:mb-2 text-[10px] lg:text-sm font-medium tracking-widest uppercase" style={{color:"rgba(250,247,242,0.28)",fontFamily:SANS,letterSpacing:"0.22em"}}>Why Choose Us</p>
            <h2 style={{fontFamily:SERIF,fontSize:"clamp(1.9rem,6vw,5rem)",fontWeight:600,color:IVORY,lineHeight:1.05,letterSpacing:"-0.02em"}}>
              Not just products.<br/>
              <span style={{background:`linear-gradient(120deg,${GOLD},${SAFFRON},${GOLD})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                Sacred instruments.
              </span>
            </h2>
          </div>
          <p className="hidden lg:block text-sm leading-relaxed lg:max-w-xs" style={{color:"rgba(250,247,242,0.45)",fontFamily:SANS}}>
            12,000+ families trust Aroham because we treat authenticity as a non-negotiable — not a marketing claim.
          </p>
        </div>

        {/* ── Large hero card — Temple Energized — desktop only ── */}
        <div className="hidden md:block relative rounded-[2rem] overflow-hidden mb-5 group" style={{minHeight:420}}>
          <img src={pyramidImg} alt="Temple Energized" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" style={{filter:"brightness(0.45) saturate(0.9)"}}/>
          <div className="absolute inset-0" style={{background:"linear-gradient(120deg,rgba(91,31,36,0.85) 0%,rgba(10,4,6,0.6) 50%,rgba(10,4,6,0.2) 100%)"}}/>
          <div className="absolute top-0 left-0 right-0" style={{height:1,background:`linear-gradient(to right,transparent,${GOLD}60,transparent)`}}/>
          <div className="absolute inset-0 p-10 lg:p-16 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:`rgba(231,139,47,0.2)`,border:`1px solid ${SAFFRON}50`}}>
                <Flame size={14} style={{color:SAFFRON}}/>
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{color:SAFFRON,fontFamily:SANS}}>Pran Pratishtha Certified</span>
            </div>
            <div>
              <h3 className="mb-5" style={{fontFamily:SERIF,fontSize:"clamp(1.8rem,4vw,3rem)",fontWeight:500,color:IVORY,lineHeight:1.15,maxWidth:"560px"}}>
                Every item consecrated through 108 mantra rounds by Vedic pandits
              </h3>
              <div className="flex flex-wrap gap-3">
                {["Signed Temple Certificate","108 Mantra Rounds","Verified Pandit"].map(tag=>(
                  <span key={tag} className="px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                    style={{background:"rgba(200,160,68,0.12)",border:"1px solid rgba(200,160,68,0.3)",color:GOLD,fontFamily:SANS}}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile: horizontal scroll cards (hero + 3 feature) ── */}
        <div className="md:hidden -mx-6 px-6 mb-6">
          <div className="flex gap-3 overflow-x-auto pb-3" style={{scrollbarWidth:"none",msOverflowStyle:"none",scrollSnapType:"x mandatory"}}>
            {/* Hero card */}
            <div className="relative rounded-2xl overflow-hidden flex-shrink-0 snap-start" style={{width:"72vw",height:220}}>
              <img src={pyramidImg} alt="Temple Energized" className="absolute inset-0 w-full h-full object-cover" style={{filter:"brightness(0.4)"}}/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(7,3,10,0.95) 0%,rgba(91,31,36,0.4) 100%)"}}/>
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={11} style={{color:SAFFRON}}/>
                  <span className="text-[9px] font-bold tracking-wider uppercase" style={{color:SAFFRON,fontFamily:SANS}}>Temple Energized</span>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold leading-snug" style={{fontFamily:SERIF,color:IVORY}}>Consecrated through 108 mantra rounds</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {["Certificate","Vedic Pandit"].map(t=>(
                      <span key={t} className="px-2 py-0.5 rounded-full text-[8px] font-semibold" style={{background:"rgba(200,160,68,0.15)",border:"1px solid rgba(200,160,68,0.3)",color:GOLD,fontFamily:SANS}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* 3 feature cards */}
            {[
              {img:baglaImg, icon:Gem, tag:"Artisan Direct", title:"100% Authentic, Always", color:GOLD},
              {img:navratnaImg, icon:Star, tag:"Expert Reviewed", title:"Jyotish Approved", color:SAFFRON},
              {img:gemstonImg, icon:Shield, tag:"7-Day Returns", title:"Worry-Free Guarantee", color:"#A8C5DA"},
            ].map(({img,icon:Icon,tag,title,color})=>(
              <div key={title} className="relative rounded-2xl overflow-hidden flex-shrink-0 snap-start" style={{width:"55vw",height:220}}>
                <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" style={{filter:"brightness(0.35)"}}/>
                <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(7,3,10,0.97) 0%,rgba(7,3,10,0.4) 100%)"}}/>
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon size={11} style={{color}}/>
                    <span className="text-[9px] font-bold tracking-wider uppercase" style={{color,fontFamily:SANS}}>{tag}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug" style={{fontFamily:SERIF,color:IVORY}}>{title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Desktop: 3-col feature cards ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 mb-5">
          {[
            {img:baglaImg, icon:Gem, tag:"Sourced Directly", title:"Artisan-Direct Authenticity",
             body:"We visit every craftsman at India's sacred centres personally. No middlemen, no factories — ever.",color:GOLD},
            {img:navratnaImg, icon:Star, tag:"Expert Reviewed", title:"Jyotish & Vastu Approved",
             body:"India's most respected astrologers and Vastu consultants curate each product before it reaches you.",color:SAFFRON},
            {img:gemstonImg, icon:Shield, tag:"7-Day Returns", title:"Worry-Free Guarantee",
             body:"Don't feel the energy shift? Return anything within 7 days, no questions. Your peace comes first.",color:"#A8C5DA"},
          ].map(({img,icon:Icon,tag,title,body,color})=>(
            <div key={title} className="why-card relative rounded-[1.5rem] overflow-hidden group cursor-default transition-all duration-400" style={{minHeight:300}}>
              <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" style={{filter:"brightness(0.38) saturate(0.8)"}}/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(7,3,10,0.97) 0%,rgba(7,3,10,0.5) 60%,transparent 100%)"}}/>
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{color}}/>
                  <span className="text-[9px] font-bold tracking-[0.3em] uppercase" style={{color,fontFamily:SANS}}>{tag}</span>
                </div>
                <div>
                  <div className="why-line mb-3" style={{height:1,width:0,background:`linear-gradient(to right,${color},transparent)`,transition:"width 0.5s ease"}}/>
                  <h3 className="mb-2" style={{fontFamily:SERIF,fontSize:"1.15rem",fontWeight:500,color:IVORY,lineHeight:1.25}}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{color:"rgba(250,247,242,0.5)",fontFamily:SANS}}>{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-5" style={{background:"rgba(250,247,242,0.06)",borderRadius:20,overflow:"hidden"}}>
          {[
            {n:"12,000+",l:"Families Served",sub:"Across 18 states"},
            {n:"100%",l:"Temple Energized",sub:"No exceptions"},
            {n:"4.9 / 5",l:"Customer Rating",sub:"3,200+ reviews"},
            {n:"7 Days",l:"Return Window",sub:"No questions asked"},
          ].map(({n,l,sub})=>(
            <div key={l} className="flex flex-col items-center justify-center py-6 lg:py-9 px-3 text-center transition-all duration-300 hover:bg-white/5" style={{background:"rgba(250,247,242,0.02)"}}>
              <div style={{fontFamily:SERIF,fontSize:"clamp(1.2rem,3.5vw,2.4rem)",fontWeight:600,color:IVORY,letterSpacing:"-0.02em"}}>{n}</div>
              <div className="mt-1 text-[10px] lg:text-xs font-semibold tracking-wide" style={{color:GOLD,fontFamily:SANS}}>{l}</div>
              <div className="mt-0.5 text-[9px] lg:text-[10px]" style={{color:"rgba(250,247,242,0.3)",fontFamily:SANS}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contact band ── */}
      <div className="relative z-10 mx-4 lg:mx-16 mb-10 lg:mb-20 rounded-2xl lg:rounded-[1.75rem] overflow-hidden" style={{background:"linear-gradient(135deg,rgba(91,31,36,0.6) 0%,rgba(40,15,20,0.9) 50%,rgba(91,31,36,0.4) 100%)",border:"1px solid rgba(200,160,68,0.2)"}}>
        <div className="absolute inset-0" style={{background:"radial-gradient(ellipse at 20% 50%,rgba(200,160,68,0.1) 0%,transparent 60%)",pointerEvents:"none"}}/>
        <div className="relative z-10 px-6 py-8 lg:px-10 lg:py-10 flex flex-col gap-6">
          {/* Header */}
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold mb-3 block" style={{color:GOLD,fontFamily:SANS}}>Expert Guidance</span>
            <h3 className="mb-2" style={{fontFamily:SERIF,fontSize:"clamp(1.3rem,3vw,2rem)",fontWeight:700,color:IVORY,lineHeight:1.15}}>
              Confused? Let Us Help You Choose.
            </h3>
            <p className="text-sm" style={{color:"rgba(250,247,242,0.5)",fontFamily:SANS}}>
              Our Vedic experts will personally guide you to the right remedy for your specific situation.
            </p>
          </div>
          {/* 3 equal contact boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {icon:Mail, label:"Email Us", sub:"hello@aroham.in", green:false},
              {icon:Phone, label:"Call Us", sub:"+91 98765 43210", green:false},
              {icon:MessageCircle, label:"WhatsApp", sub:"Chat instantly", green:true},
            ].map(({icon:Ic,label,sub,green})=>(
              <div key={label} className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{background: green ? "rgba(74,183,95,0.85)" : "rgba(250,247,242,0.06)", border: green ? "none" : "1px solid rgba(250,247,242,0.08)"}}>
                <Ic size={18} style={{color: green ? "#fff" : GOLD, flexShrink:0}}/>
                <div>
                  <div className="text-sm font-bold" style={{color: green ? "#fff" : IVORY, fontFamily:SANS}}>{label}</div>
                  <div className="text-[11px]" style={{color: green ? "rgba(255,255,255,0.75)" : "rgba(250,247,242,0.4)", fontFamily:SANS}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

// ─── Flash Deals ──────────────────────────────────────────────────────────────
function FlashDeals({ onProductClick }: { onProductClick: (p: ArohamProduct) => void }) {
  const deals = [
    { ...AROHAM_PRODUCTS[0], discount: 35, tag: "🔥 Hot Deal" },
    { ...AROHAM_PRODUCTS[2], discount: 30, tag: "⚡ Flash Sale" },
    { ...AROHAM_PRODUCTS[4], discount: 28, tag: "🎯 Best Value" },
    { ...AROHAM_PRODUCTS[1], discount: 24, tag: "💫 Top Pick" },
  ];
  const [time, setTime] = useState({ h: 5, m: 47, s: 22 });
  useEffect(() => {
    const id = setInterval(() => setTime(t => {
      let { h, m, s } = t;
      s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "#0D0508" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-medium mb-2 block" style={{ color: SAFFRON }}>Limited Time</span>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 500, color: IVORY }}>Flash Deals</h2>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "rgba(250,247,242,0.5)" }}>Ends in</span>
            {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold"
                  style={{ background: "rgba(200,160,68,0.15)", color: GOLD, fontFamily: SERIF, border: "1px solid rgba(200,160,68,0.25)" }}>{v}</span>
                {i < 2 && <span style={{ color: GOLD }}>:</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((p, i) => (
            <div key={i} onClick={() => onProductClick(p)}
              className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,160,68,0.15)" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(200,160,68,0.4)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(200,160,68,0.15)"}>
              <div className="relative aspect-square overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ filter: "brightness(0.85)" }} />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: SAFFRON, color: "white" }}>{p.tag}</div>
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(200,160,68,0.9)", color: "#1A0D0E" }}>{p.discount}% OFF</div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold mb-1 leading-snug" style={{ fontFamily: SERIF, color: IVORY }}>{p.name}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-base font-bold" style={{ color: GOLD, fontFamily: PRICE_FONT }}>₹{p.price}</span>
                  <span className="text-xs line-through" style={{ fontFamily:PRICE_FONT, color: "rgba(250,247,242,0.35)" }}>₹{p.original}</span>
                </div>
                {/* Mini progress bar — "selling fast" */}
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1" style={{ color: "rgba(250,247,242,0.4)" }}>
                    <span>Selling fast</span><span>{60 + i * 8}% sold</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${60 + i * 8}%`, background: `linear-gradient(90deg,${GOLD},${SAFFRON})` }} />
                  </div>
                </div>
                <button className="w-full py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Shop by Problem ──────────────────────────────────────────────────────────
const PROBLEMS_DATA = [
  { emoji: "💰", label: "Wealth & Money",   desc: "Attract financial abundance",   bg: "linear-gradient(135deg,#2D1B00,#5B3800)", img: baglaImg },
  { emoji: "❤️", label: "Love & Relationships", desc: "Strengthen bonds",          bg: "linear-gradient(135deg,#3A0D1A,#6B1A30)", img: navratnaImg },
  { emoji: "🛡",  label: "Protection",       desc: "Shield from negativity",        bg: "linear-gradient(135deg,#0D1A2D,#1A3050)", img: pendantSilImg },
  { emoji: "🏡",  label: "Home Harmony",    desc: "Balance Vastu energies",         bg: "linear-gradient(135deg,#0D2D15,#1A5025)", img: pyramidImg },
  { emoji: "💼",  label: "Career Growth",   desc: "Success & recognition",          bg: "linear-gradient(135deg,#1A0D2D,#351A55)", img: yantraPlateImg },
  { emoji: "🧘",  label: "Peace of Mind",   desc: "Clarity & inner calm",           bg: "linear-gradient(135deg,#0D2020,#1A4040)", img: gemstonImg },
];

function ShopByProblem({ onShop }: { onShop: () => void }) {
  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "#F2EBE0" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{ color: SAFFRON }}>Vedic Remedies</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: MAROON }}>Shop by Your Need</h2>
          <p className="text-sm mt-2" style={{ color: "#7A6A58" }}>Find the right Vedic solution for your specific life challenge</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PROBLEMS_DATA.map(({ emoji, label, desc, bg, img }) => (
            <button key={label} onClick={onShop}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ minHeight: 160 }}>
              <img src={img} alt={label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: bg, opacity: 0.82 }} />
              <div className="relative z-10 p-5 flex flex-col justify-between h-full" style={{ minHeight: 160 }}>
                <span className="text-3xl">{emoji}</span>
                <div>
                  <div className="text-base font-semibold mb-0.5" style={{ fontFamily: SERIF, color: IVORY }}>{label}</div>
                  <div className="text-xs" style={{ color: "rgba(250,247,242,0.65)" }}>{desc}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: GOLD }}>
                    Explore <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── New Arrivals horizontal scroll ───────────────────────────────────────────
function NewArrivals({ onProductClick }: { onProductClick: (p: ArohamProduct) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => { if (scrollRef.current) scrollRef.current.scrollLeft += dir * 280; };
  // Duplicate products to simulate more arrivals
  const items = [
    ...AROHAM_PRODUCTS,
    { ...AROHAM_PRODUCTS[3], id: 103, name: "Shri Yantra Copper Plate", price: 1199, original: 1599 },
    { ...AROHAM_PRODUCTS[0], id: 104, name: "Kali Yantra Gold", price: 799, original: 1099 },
    { ...AROHAM_PRODUCTS[5], id: 105, name: "Mahamrityunjaya Kavach", price: 1099, original: 1499 },
    { ...AROHAM_PRODUCTS[4], id: 106, name: "Saptarishi Crystal Set", price: 3499, original: 4999 },
  ];

  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: IVORY }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{ color: GOLD }}>Just In</span>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.75rem,4vw,2.75rem)", fontWeight: 500, color: MAROON }}>New Arrivals</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:bg-amber-50"
              style={{ borderColor: "rgba(91,31,36,0.15)", color: MAROON }}><ChevronLeft size={16} /></button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:bg-amber-50"
              style={{ borderColor: "rgba(91,31,36,0.15)", color: MAROON }}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}>
          {items.map((p, i) => (
            <div key={i} onClick={() => onProductClick(p)}
              className="flex-shrink-0 w-52 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-2"
              style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.07)", boxShadow: "0 2px 16px rgba(91,31,36,0.06)" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(91,31,36,0.14)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(91,31,36,0.06)"}>
              <div className="relative h-52 overflow-hidden bg-amber-50">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: "rgba(91,31,36,0.88)", color: GOLD }}>New</div>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold leading-snug mb-1" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</p>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={9} fill={j < Math.round(p.rating) ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />)}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{p.price}</span>
                  <span className="text-[10px] line-through" style={{ fontFamily:PRICE_FONT, color: "#9A8A78" }}>₹{p.original}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trending This Week ────────────────────────────────────────────────────────
function TrendingProducts({ onProductClick }: { onProductClick: (p: ArohamProduct) => void }) {
  const trending = [
    { ...AROHAM_PRODUCTS[4], rank: 1, sold: "2.3k sold this week" },
    { ...AROHAM_PRODUCTS[1], rank: 2, sold: "1.8k sold this week" },
    { ...AROHAM_PRODUCTS[2], rank: 3, sold: "1.4k sold this week" },
    { ...AROHAM_PRODUCTS[0], rank: 4, sold: "1.1k sold this week" },
    { ...AROHAM_PRODUCTS[5], rank: 5, sold: "980 sold this week" },
    { ...AROHAM_PRODUCTS[3], rank: 6, sold: "870 sold this week" },
  ];
  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "#F2EBE0" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{ color: SAFFRON }}>This Week</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: MAROON }}>Trending Products</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trending.map((p, i) => (
            <div key={i} onClick={() => onProductClick(p)}
              className="group flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: "#FFFFFF", border: "1px solid rgba(91,31,36,0.07)" }}>
              {/* Rank */}
              <div className="flex-shrink-0 w-10 flex items-start pt-1">
                <span className="text-2xl font-bold" style={{ fontFamily: SERIF, color: p.rank <= 3 ? GOLD : "#C8B8A8" }}>
                  {String(p.rank).padStart(2, "0")}
                </span>
              </div>
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug mb-1" style={{ fontFamily: SERIF, color: MAROON }}>{p.name}</p>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={10} fill={j < Math.round(p.rating) ? GOLD : "none"} stroke={GOLD} strokeWidth={1.5} />)}
                  <span className="text-[10px] ml-1" style={{ color: "#9A8A78" }}>({p.reviews})</span>
                </div>
                <p className="text-[10px] mb-2" style={{ color: "#4A8A4A" }}>🔥 {p.sold}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>₹{p.price}</span>
                  <span className="text-[10px] line-through" style={{ fontFamily:PRICE_FONT, color: "#9A8A78" }}>₹{p.original}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Categories ───────────────────────────────────────────────────────
const FEAT_CATS = [
  { name: "Yantras",    desc: "Sacred geometric diagrams for manifestation",  img: baglaImg,       count: 48 },
  { name: "Pendants",   desc: "Wearable protection & cosmic alignment",        img: navratnaImg,    count: 32 },
  { name: "Crystals",   desc: "Natural gemstones charged with earth energy",   img: gemstonImg,     count: 27 },
  { name: "Vastu Kits", desc: "Complete remedies for home & office harmony",   img: pyramidImg,     count: 19 },
];
function FeaturedCategories({ onShop }: { onShop: () => void }) {
  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: IVORY }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{ color: GOLD }}>Collections</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: MAROON }}>Explore by Category</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {FEAT_CATS.map(({ name, desc, img, count }) => (
            <button key={name} onClick={onShop}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ aspectRatio: "3/4" }}>
              <img src={img} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,5,8,0.92) 0%, rgba(10,5,8,0.3) 60%, transparent 100%)" }} />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="text-[10px] font-semibold mb-1" style={{ color: "rgba(200,160,68,0.8)" }}>{count} products</div>
                <div className="text-base font-semibold mb-1" style={{ fontFamily: SERIF, color: IVORY }}>{name}</div>
                <div className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.6)" }}>{desc}</div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: GOLD }}>
                  Shop Now <ChevronRight size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Special Offer Banner ─────────────────────────────────────────────────────
function SpecialOfferBanner({ onShop }: { onShop: () => void }) {
  return (
    <section className="py-20 px-6 lg:px-10" style={{ background: "#F2EBE0" }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden relative" style={{ background: `linear-gradient(135deg,${MAROON},#3A1015,#0D0508)`, minHeight: 200 }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle,${GOLD} 1px,transparent 1px)`, backgroundSize: "28px 28px" }} />
          {/* Product images strip on right */}
          <div className="absolute right-0 top-0 bottom-0 w-64 hidden lg:flex">
            {[baglaImg, navratnaImg, gemstonImg].map((img, i) => (
              <div key={i} className="flex-1 overflow-hidden" style={{ opacity: 0.4 - i * 0.1 }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(91,31,36,1) 0%,transparent 60%)" }} />
          </div>
          <div className="relative z-10 px-8 lg:px-12 py-10 max-w-xl">
            <div className="px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block" style={{ background: "rgba(200,160,68,0.2)", color: GOLD, border: "1px solid rgba(200,160,68,0.3)" }}>
              🎉 SPECIAL OFFER — Use code: AROHAM10
            </div>
            <h2 className="mb-3" style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem,3.5vw,2.5rem)", fontWeight: 500, color: IVORY, lineHeight: 1.15 }}>
              Get 10% Off<br />Your First Order
            </h2>
            <p className="text-sm mb-6" style={{ color: "rgba(250,247,242,0.65)" }}>
              Temple-energized products delivered to your door. Use coupon AROHAM10 at checkout.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={onShop} className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:shadow-xl"
                style={{ background: GOLD, color: "#1A0D0E" }}>🛍 Shop & Save</button>
              <div className="flex items-center gap-2 px-4 py-3 rounded-full" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span className="text-sm font-bold" style={{ color: GOLD, fontFamily: SERIF, letterSpacing: "0.1em" }}>AROHAM10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Video Testimonials ───────────────────────────────────────────────────────
const VIDEO_REVIEWS=[
  {name:"Sunita Rao",city:"Hyderabad",product:"Navratna Pendant",rating:5,thumb:navratnaImg,init:"SR",bg:"#2D4A8B",duration:"1:24",review:"The pendant arrived beautifully packaged. I wore it during my important business meeting and things turned around completely."},
  {name:"Rahul Verma",city:"Pune",product:"Brass Pyramid Yantra",rating:5,thumb:pyramidImg,init:"RV",bg:"#5B1F24",duration:"2:08",review:"Placed it in the northeast corner as instructed. The energy in my office changed noticeably within two weeks. Absolutely worth it."},
  {name:"Meera Iyer",city:"Chennai",product:"Bagla Mukhi Yantra",rating:5,thumb:baglaImg,init:"MI",bg:"#4A3728",duration:"0:58",review:"My court case was pending for years. After installing this yantra, it resolved in 3 months. I am a believer now."},
];
function VideoTestimonials(){
  const [active, setActive]=useState(0);
  const [playing, setPlaying]=useState(false);
  const scrollRef=useRef<HTMLDivElement>(null);

  const BASE_REELS=[
    ...VIDEO_REVIEWS,
    {name:"Kiran Pillai",city:"Thiruvananthapuram",product:"Navdurga Yantra Plate",rating:5,thumb:yantraPlateImg,init:"KP",bg:"#2D5A2D",duration:"1:47",review:"The yantra transformed the energy of my home completely. Even my neighbours noticed a change in the atmosphere!"},
    {name:"Pooja Desai",city:"Surat",product:"Navratna Gemstone Set",rating:5,thumb:gemstonImg,init:"PD",bg:"#5B1F24",duration:"2:33",review:"I carry the gemstone set in my meditation space. My clarity and focus have improved dramatically since I started using it."},
    {name:"Aryan Kapoor",city:"Delhi",product:"Kavacha Pendant",rating:5,thumb:pendantSilImg,init:"AK",bg:"#2D4A8B",duration:"1:12",review:"The silver craftsmanship is extraordinary. I wear it every day and feel genuinely protected. A true sacred artifact."},
  ];
  const n = BASE_REELS.length;
  // Triple the list: [clone-end … real … clone-start]
  const ALL_REELS=[...BASE_REELS,...BASE_REELS,...BASE_REELS];

  const scrollToIndex=(idx:number,smooth=true)=>{
    const el=scrollRef.current;
    if(!el) return;
    const child=el.children[idx] as HTMLElement|undefined;
    if(!child) return;
    el.scrollTo({left:child.offsetLeft - el.clientWidth/2 + child.offsetWidth/2, behavior: smooth?"smooth":"instant"});
  };

  const scrollTo=(i:number)=>{
    // i is real index (0..n-1), map to middle set
    const mid=n+i;
    setActive(i); setPlaying(false);
    scrollToIndex(mid);
  };

  const prev=()=>scrollTo((active-1+n)%n);
  const next=()=>scrollTo((active+1)%n);

  // Start at middle set on mount
  useEffect(()=>{
    scrollToIndex(n + active, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Auto-update active reel as user scrolls + teleport when in clone zones
  useEffect(()=>{
    const el=scrollRef.current;
    if(!el) return;
    let timer:ReturnType<typeof setTimeout>;
    const onScroll=()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const center=el.scrollLeft+el.clientWidth/2;
        let closest=0,minDist=Infinity;
        Array.from(el.children).forEach((child,ci)=>{
          const c=(child as HTMLElement).offsetLeft+(child as HTMLElement).offsetWidth/2;
          const dist=Math.abs(c-center);
          if(dist<minDist){minDist=dist;closest=ci;}
        });
        const realIdx=closest%n;
        setActive(realIdx); setPlaying(false);
        // Teleport to middle set if in first or last clone set
        if(closest<n){
          scrollToIndex(n+realIdx,false);
        } else if(closest>=n*2){
          scrollToIndex(n+realIdx,false);
        }
      },80);
    };
    el.addEventListener("scroll",onScroll,{passive:true});
    return()=>{el.removeEventListener("scroll",onScroll);clearTimeout(timer);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[active]);

  return(
    <section className="py-20 px-0 overflow-hidden" style={{background:"#0D0508"}}>
      <style>{`
        @keyframes reelPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,160,68,0.4)}50%{box-shadow:0 0 0 8px rgba(200,160,68,0)}}
        .reel-scroll{scrollbar-width:none;}
        .reel-scroll::-webkit-scrollbar{display:none;}
      `}</style>

      {/* Header */}
      <div className="text-center mb-10 px-6">
        <span className="text-xs tracking-[0.25em] uppercase font-medium mb-3 block" style={{color:SAFFRON,fontFamily:SANS}}>Real Transformations</span>
        <h2 style={{fontFamily:SERIF,fontSize:"clamp(2rem,4vw,3rem)",fontWeight:500,color:IVORY}}>Customer Stories</h2>
        <p className="text-sm mt-2" style={{color:"rgba(250,247,242,0.5)",fontFamily:SANS}}>Scroll through real stories from our community</p>
      </div>

      {/* Reel carousel */}
      <div className="relative">
        {/* Navigation arrows */}
        <button onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{background:"rgba(200,160,68,0.15)",border:"1px solid rgba(200,160,68,0.3)",color:GOLD,backdropFilter:"blur(8px)"}}>
          <ChevronLeft size={18}/>
        </button>
        <button onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{background:"rgba(200,160,68,0.15)",border:"1px solid rgba(200,160,68,0.3)",color:GOLD,backdropFilter:"blur(8px)"}}>
          <ChevronRight size={18}/>
        </button>

        {/* Scrollable reel row */}
        <div ref={scrollRef}
          className="reel-scroll flex gap-4 overflow-x-auto px-[max(2rem,calc(50vw-140px))]"
          style={{scrollSnapType:"x mandatory",paddingBottom:"4px"}}>
          {ALL_REELS.map((v,i)=>{
            const isActive=(i%n)===active;
            return(
              <div key={i} onClick={()=>scrollTo(i%n)}
                className="flex-shrink-0 relative cursor-pointer transition-all duration-500"
                style={{
                  width: isActive ? 260 : 200,
                  height: isActive ? 460 : 355,
                  borderRadius: 24,
                  overflow:"hidden",
                  scrollSnapAlign:"center",
                  transform: isActive ? "scale(1)" : "scale(0.93)",
                  opacity: isActive ? 1 : 0.6,
                  border: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
                  transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: isActive ? `0 0 0 1px rgba(200,160,68,0.2), 0 24px 60px rgba(0,0,0,0.6)` : "none",
                }}>
                {/* Background image */}
                <img src={v.thumb} alt={v.name} className="absolute inset-0 w-full h-full object-cover"/>

                {/* Gradient overlays */}
                <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,transparent 30%,transparent 40%,rgba(0,0,0,0.85) 100%)"}}/>

                {/* Top row — badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(200,160,68,0.9)",color:"#1A0D0E"}}>✓ Verified</span>
                  </div>
                  <div className="flex">{Array.from({length:v.rating}).map((_,j)=><Star key={j} size={9} fill={GOLD} stroke="none"/>)}</div>
                </div>

                {/* Play / Pause button — center */}
                {isActive&&(
                  <button onClick={e=>{e.stopPropagation();setPlaying(p=>!p);}}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{background:playing?"rgba(200,160,68,0.9)":"rgba(255,255,255,0.15)",
                      backdropFilter:"blur(6px)",border:`1.5px solid ${playing?GOLD:"rgba(255,255,255,0.35)"}`,
                      animation: !playing?"reelPulse 2s ease-in-out infinite":"none"}}>
                    {playing
                      ? <div className="flex gap-1"><div className="w-1 h-5 rounded-full" style={{background:MAROON}}/><div className="w-1 h-5 rounded-full" style={{background:MAROON}}/></div>
                      : <div className="ml-1" style={{width:0,height:0,borderTop:"8px solid transparent",borderBottom:"8px solid transparent",borderLeft:"14px solid white"}}/>}
                  </button>
                )}

                {/* Playing overlay */}
                {isActive&&playing&&(
                  <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(10,5,8,0.7)"}}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <p className="text-xs" style={{color:"rgba(250,247,242,0.7)",fontFamily:SANS}}>Now playing…</p>
                      <p className="text-[10px] mt-1" style={{color:GOLD,fontFamily:SANS}}>{v.duration}</p>
                    </div>
                  </div>
                )}

                {/* Duration badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold" style={{background:"rgba(0,0,0,0.6)",color:"white",display: isActive?"none":"block"}}>
                  ▶ {v.duration}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {isActive&&(
                    <p className="text-[11px] leading-relaxed mb-3 italic" style={{color:"rgba(250,247,242,0.85)",fontFamily:SANS}}>
                      "{v.review.slice(0,90)}{v.review.length>90?"…":""}"
                    </p>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:v.bg,color:GOLD,fontFamily:SERIF}}>{v.init}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{fontFamily:SERIF,color:IVORY}}>{v.name}</div>
                      <div className="text-[10px]" style={{color:"rgba(250,247,242,0.55)"}}>{v.city}</div>
                    </div>
                  </div>
                  {isActive&&(
                    <div className="mt-2 text-[9px] px-2 py-1 rounded-full inline-block" style={{background:"rgba(200,160,68,0.12)",border:"1px solid rgba(200,160,68,0.2)",color:GOLD}}>
                      {v.product}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {ALL_REELS.map((_,i)=>(
            <button key={i} onClick={()=>scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{width:active===i?20:6,height:6,background:active===i?GOLD:"rgba(200,160,68,0.25)"}}/>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Community Comments ───────────────────────────────────────────────────────
const COMMENTS_DATA=[
  {name:"Arjun Mehta",city:"Bangalore",rating:5,text:"The Brass Pyramid Yantra is museum-quality. The energization certificate and the care in packaging shows Aroham treats each product as sacred — not just a commodity.",product:"Brass Pyramid Vastu Yantra",init:"AM",bg:"#8B4513",likes:24,date:"2 weeks ago"},
  {name:"Priya Sharma",city:"Mumbai",rating:5,text:"Received my Navratna pendant within 3 days. The packaging was exquisite and the certificate of authenticity gave me full confidence. I can feel the energy!",product:"Navratna Sri Yantra Pendant",init:"PS",bg:MAROON,likes:31,date:"1 month ago"},
  {name:"Kavya Nair",city:"Kochi",rating:5,text:"Finally a platform that treats Vedic products with the reverence they deserve. Customer support was phenomenal when I had questions about placement.",product:"Navdurga Yantra Plate",init:"KN",bg:"#2D5A2D",likes:18,date:"3 weeks ago"},
  {name:"Deepak Sharma",city:"Jaipur",rating:5,text:"The Bagla Mukhi Yantra is incredibly well-crafted. Gold finish is perfect and the engravings are sharp. This is clearly made by expert artisans.",product:"Bagla Mukhi Yantra",init:"DS",bg:"#2D4A8B",likes:15,date:"1 week ago"},
  {name:"Anjali Patel",city:"Ahmedabad",rating:4,text:"Very good quality products. Shipping was a bit delayed but the team kept me updated. Overall a trustworthy platform for authentic Vedic items.",product:"Navratna Gemstone Collection",init:"AP",bg:"#5A3A28",likes:9,date:"2 months ago"},
  {name:"Vikram Nair",city:"Kochi",rating:5,text:"I was sceptical about online purchase of sacred items. But Aroham changed my mind. The Pran Pratishtha certificate is a genuine differentiator.",product:"Kavacha Protection Pendant",init:"VN",bg:"#3A5A3A",likes:22,date:"5 days ago"},
];
function CommunityComments(){
  const [liked, setLiked]=useState<Record<number,boolean>>({});
  const [showForm, setShowForm]=useState(false);
  const [review, setReview]=useState({name:"",rating:5,text:"",product:""});
  const [submitted, setSubmitted]=useState(false);
  return(
    <section className="py-20 px-6 lg:px-10" style={{background:IVORY}}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-medium mb-3 block" style={{color:GOLD,fontFamily:SANS}}>Community</span>
            <h2 style={{fontFamily:SERIF,fontSize:"clamp(2rem,4vw,3rem)",fontWeight:500,color:MAROON}}>What Our Community Says</h2>
            <p className="text-sm mt-1" style={{color:"#7A6A58"}}>{COMMENTS_DATA.length} verified reviews · 4.8 average rating</p>
          </div>
          <button onClick={()=>setShowForm(s=>!s)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 self-start"
            style={{background:MAROON,color:IVORY}}>
            ✍ Write a Review
          </button>
        </div>

        {/* Write review form */}
        {showForm&&(
          <div className="mb-10 rounded-3xl p-7" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 4px 30px rgba(91,31,36,0.07)"}}>
            {submitted?(
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🙏</div>
                <h3 className="text-lg font-semibold mb-1" style={{fontFamily:SERIF,color:MAROON}}>Thank You for Your Review!</h3>
                <p className="text-sm" style={{color:"#7A6A58"}}>Your experience helps others in their spiritual journey.</p>
              </div>
            ):(
              <>
                <h3 className="text-lg font-semibold mb-6" style={{fontFamily:SERIF,color:MAROON}}>Share Your Experience</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <FloatingInput label="Your Name" value={review.name} onChange={v=>setReview(r=>({...r,name:v}))} required/>
                  <FloatingSelect label="Product Purchased" options={AROHAM_PRODUCTS.map(p=>p.name)} value={review.product} onChange={v=>setReview(r=>({...r,product:v}))}/>
                </div>
                <div className="mb-4">
                  <div className="text-xs font-semibold mb-2" style={{color:MAROON}}>Your Rating</div>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>setReview(r=>({...r,rating:n}))} className="transition-transform hover:scale-110">
                        <Star size={24} fill={n<=review.rating?GOLD:"none"} stroke={GOLD} strokeWidth={1.5}/>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={review.text} onChange={e=>setReview(r=>({...r,text:e.target.value}))}
                  placeholder="Share how this product has impacted your life…" rows={4}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none mb-4"
                  style={{border:"1.5px solid rgba(91,31,36,0.12)",background:IVORY,color:"#222222",fontFamily:SANS}}
                  onFocus={e=>{e.target.style.borderColor=GOLD;}} onBlur={e=>{e.target.style.borderColor="rgba(91,31,36,0.12)";}}/>
                <button onClick={()=>{if(review.name&&review.text)setSubmitted(true);}}
                  className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
                  Submit Review
                </button>
              </>
            )}
          </div>
        )}

        {/* Reviews — horizontal scroll row */}
        <div className="flex gap-5 overflow-x-auto pb-3 -mx-6 lg:-mx-10 px-6 lg:px-10"
          style={{scrollbarWidth:"none",msOverflowStyle:"none",scrollSnapType:"x mandatory"}}>
          {COMMENTS_DATA.map((c,i)=>(
            <div key={i} className="p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl flex-shrink-0"
              style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.07)",boxShadow:"0 2px 12px rgba(91,31,36,0.04)",width:"clamp(280px,80vw,340px)",scrollSnapAlign:"start"}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex">{Array.from({length:c.rating}).map((_,j)=><Star key={j} size={12} fill={GOLD} stroke={GOLD} strokeWidth={1.5}/>)}</div>
                <span className="text-[10px]" style={{color:"#9A8A78"}}>{c.date}</span>
              </div>
              <p className="text-sm leading-relaxed mb-3 italic" style={{color:"#4A3A2A"}}>"{c.text}"</p>
              <div className="text-[10px] mb-4 px-2 py-1 rounded-lg inline-block" style={{background:"rgba(200,160,68,0.08)",color:"#8B6914"}}>📦 {c.product}</div>
              <div className="flex items-center justify-between pt-3" style={{borderTop:"1px solid rgba(91,31,36,0.07)"}}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:c.bg,color:GOLD,fontFamily:SERIF}}>{c.init}</div>
                  <div>
                    <div className="text-xs font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{c.name}</div>
                    <div className="text-[10px]" style={{color:"#9A8A78"}}>{c.city} · ✓ Verified</div>
                  </div>
                </div>
                <button onClick={()=>setLiked(l=>({...l,[i]:!l[i]}))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all"
                  style={{background:liked[i]?"rgba(91,31,36,0.08)":"rgba(91,31,36,0.04)",color:liked[i]?MAROON:"#9A8A78",border:`1px solid ${liked[i]?"rgba(91,31,36,0.2)":"rgba(91,31,36,0.08)"}`}}>
                  {liked[i]?"❤️":"🤍"} {c.likes+(liked[i]?1:0)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function Newsletter(){
  const [email,setEmail]=useState(""),[joined,setJoined]=useState(false);
  return(
    <section className="py-20 px-6 lg:px-10" style={{background:IVORY}}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-6">ॐ</div>
        <h2 className="mb-3" style={{fontFamily:SERIF,fontSize:"clamp(1.75rem,4vw,2.5rem)",fontWeight:500,color:MAROON,lineHeight:1.2}}>
          Join India's Spiritual Community
        </h2>
        <p className="text-sm mb-8" style={{color:"#7A6A58"}}>Auspicious dates, Vedic wisdom, exclusive offers & early access to new products.</p>
        {joined?(
          <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl" style={{background:"rgba(200,160,68,0.1)",border:`1px solid rgba(200,160,68,0.3)`}}>
            <CheckCircle size={18} style={{color:GOLD}}/><span className="text-sm font-medium" style={{color:MAROON}}>Welcome to the Aroham community!</span>
          </div>
        ):(
          <form className="flex gap-3 flex-col sm:flex-row" onSubmit={e=>{e.preventDefault();if(email)setJoined(true);}}>
            <input type="email" placeholder="Enter your email address" value={email} onChange={e=>setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-full text-sm outline-none"
              style={{background:"#FFFFFF",border:`1px solid rgba(91,31,36,0.15)`,color:MAROON,fontFamily:SANS}}
              onFocus={e=>{e.target.style.borderColor=GOLD;}} onBlur={e=>{e.target.style.borderColor="rgba(91,31,36,0.15)";}}/>
            <button type="submit" className="px-7 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 whitespace-nowrap"
              style={{background:MAROON,color:IVORY}}>Join Community</button>
          </form>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer(){
  return(
    <footer style={{background:"#1A0D0E",color:"rgba(250,247,242,0.65)",fontFamily:SANS}}>
      <div className="h-px w-full" style={{background:`linear-gradient(90deg,transparent,${GOLD}40,transparent)`}}/>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:`linear-gradient(135deg,${MAROON},${SAFFRON})`}}>
                <span className="text-xs font-bold" style={{color:IVORY,fontFamily:SERIF}}>ॐ</span>
              </div>
              <span className="text-xl font-semibold" style={{fontFamily:SERIF,color:IVORY}}>Aroham</span>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{color:"rgba(250,247,242,0.5)"}}>India's most trusted premium platform for authentic Vedic products and spiritual guidance.</p>
            <div className="flex gap-3">
              {[Instagram,Twitter,Facebook,Youtube].map((Icon,i)=>(
                <button key={i} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{border:"1px solid rgba(255,255,255,0.1)"}}>
                  <Icon size={14} style={{color:"rgba(250,247,242,0.5)"}}/>
                </button>
              ))}
            </div>
          </div>
          {[{title:"Products",links:["Yantras","Pendants","Crystals","Rudraksha","Combo Kits"]},{title:"Support",links:["FAQ","Shipping Policy","Return Policy","Track Order","Contact Us"]},{title:"Company",links:["About Us","Our Story","Careers","Press","Blog"]}].map(col=>(
            <div key={col.title}>
              <h4 className="text-xs tracking-[0.15em] uppercase font-semibold mb-5" style={{color:GOLD}}>{col.title}</h4>
              <ul className="space-y-3">{col.links.map(l=><li key={l}><a href="#" className="text-sm hover:text-white transition-colors" style={{color:"rgba(250,247,242,0.5)"}}>{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <p className="text-xs" style={{color:"rgba(250,247,242,0.3)"}}>© 2025 Aroham. All rights reserved. Made with reverence in India.</p>
          <div className="flex gap-6 text-xs" style={{color:"rgba(250,247,242,0.3)"}}>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────────────────
const CATEGORIES=["Yantra","Pendant","Crystals","Bracelet","Rudraksha"];
const PURPOSES=["Wealth","Love","Protection","Peace","Career","Health","Home Harmony"];
const PRICE_RANGES=[{label:"Under ₹1,000",min:0,max:1000},{label:"₹1,000 – ₹3,000",min:1000,max:3000},{label:"₹3,000+",min:3000,max:Infinity}];

function ShopPage({ onProductClick, onBack }:{onProductClick:(p:ArohamProduct)=>void;onBack:()=>void;}) {
  const [cats,setCats]=useState<string[]>([]);
  const [prps,setPrps]=useState<string[]>([]);
  const [priceIdx,setPriceIdx]=useState<number|null>(null);
  const [sort,setSort]=useState("popular");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [wish,setWish]=useState<Record<number,boolean>>({});

  const filtered=AROHAM_PRODUCTS.filter(p=>{
    if(cats.length&&!cats.includes(p.category))return false;
    if(prps.length&&!prps.includes(p.purpose))return false;
    if(priceIdx!==null){const r=PRICE_RANGES[priceIdx];if(p.price<r.min||p.price>r.max)return false;}
    return true;
  }).sort((a,b)=>{
    if(sort==="price-asc")return a.price-b.price;
    if(sort==="price-desc")return b.price-a.price;
    if(sort==="rating")return b.rating-a.rating;
    return b.reviews-a.reviews;
  });

  const toggleCat=(c:string)=>setCats(prev=>prev.includes(c)?prev.filter(x=>x!==c):[...prev,c]);
  const togglePrp=(p:string)=>setPrps(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]);
  const clearAll=()=>{setCats([]);setPrps([]);setPriceIdx(null);};

  const FilterPanel=()=>(
    <div className="space-y-7">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:MAROON}}>Category</h3>
        <div className="space-y-2.5">
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>toggleCat(c)} className="flex items-center gap-3 w-full text-left">
              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                style={{border:`2px solid ${cats.includes(c)?MAROON:"rgba(91,31,36,0.2)"}`,background:cats.includes(c)?MAROON:"transparent"}}>
                {cats.includes(c)&&<CheckCircle size={10} color="white" strokeWidth={3}/>}
              </div>
              <span className="text-sm" style={{color:cats.includes(c)?MAROON:"#5A4A3A"}}>{c}</span>
              <span className="ml-auto text-[10px]" style={{color:"#9A8A78"}}>{AROHAM_PRODUCTS.filter(p=>p.category===c).length}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-px" style={{background:"rgba(91,31,36,0.08)"}}/>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:MAROON}}>Purpose</h3>
        <div className="space-y-2.5">
          {PURPOSES.map(p=>(
            <button key={p} onClick={()=>togglePrp(p)} className="flex items-center gap-3 w-full text-left">
              <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                style={{border:`2px solid ${prps.includes(p)?MAROON:"rgba(91,31,36,0.2)"}`,background:prps.includes(p)?MAROON:"transparent"}}>
                {prps.includes(p)&&<CheckCircle size={10} color="white" strokeWidth={3}/>}
              </div>
              <span className="text-sm" style={{color:prps.includes(p)?MAROON:"#5A4A3A"}}>{p}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-px" style={{background:"rgba(91,31,36,0.08)"}}/>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:MAROON}}>Price</h3>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((r,i)=>(
            <button key={r.label} onClick={()=>setPriceIdx(priceIdx===i?null:i)} className="flex items-center gap-3 w-full text-left">
              <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                style={{border:`2px solid ${priceIdx===i?GOLD:"rgba(91,31,36,0.2)"}`,background:priceIdx===i?GOLD:"transparent"}}>
                {priceIdx===i&&<div className="w-1.5 h-1.5 rounded-full bg-white"/>}
              </div>
              <span className="text-sm" style={{color:priceIdx===i?MAROON:"#5A4A3A"}}>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
      {(cats.length||prps.length||priceIdx!==null)&&(
        <button onClick={clearAll} className="w-full py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-red-50"
          style={{borderColor:"rgba(200,0,0,0.2)",color:"#C04040"}}>Clear All Filters</button>
      )}
    </div>
  );

  return(
    <div style={{background:IVORY,minHeight:"100vh",fontFamily:SANS}}>
      {/* Hero bar */}
      <div className="pt-24 pb-8 px-6 lg:px-10" style={{background:`linear-gradient(135deg,#F5EDE0,${IVORY})`}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3 text-xs" style={{color:"#9A8A78"}}>
            <button onClick={onBack} className="hover:underline" style={{color:MAROON}}>Home</button>
            <ChevronRight size={12}/><span>Shop</span>
          </div>
          <h1 style={{fontFamily:SERIF,fontSize:"clamp(1.75rem,4vw,3rem)",fontWeight:500,color:MAROON}}>Sacred Products</h1>
          <p className="text-sm mt-1" style={{color:"#7A6A58"}}>Temple-energized, handcrafted, expert-recommended</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Active filter chips */}
        {(cats.length||prps.length||priceIdx!==null)&&(
          <div className="flex flex-wrap gap-2 mb-6">
            {cats.map(c=><span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{background:"rgba(91,31,36,0.08)",color:MAROON}}>{c}<button onClick={()=>toggleCat(c)} className="ml-1"><X size={10}/></button></span>)}
            {prps.map(p=><span key={p} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{background:"rgba(91,31,36,0.08)",color:MAROON}}>{p}<button onClick={()=>togglePrp(p)} className="ml-1"><X size={10}/></button></span>)}
            {priceIdx!==null&&<span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{background:"rgba(91,31,36,0.08)",color:MAROON}}>{PRICE_RANGES[priceIdx].label}<button onClick={()=>setPriceIdx(null)} className="ml-1"><X size={10}/></button></span>}
          </div>
        )}
        <div className="flex gap-8">
          {/* Filter sidebar desktop */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 p-6 rounded-2xl" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 2px 20px rgba(91,31,36,0.04)"}}>
              <FilterPanel/>
            </div>
          </div>
          {/* Main grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{color:"#7A6A58"}}>Showing <strong style={{color:MAROON}}>{filtered.length}</strong> products</p>
              <div className="flex items-center gap-3">
                <button onClick={()=>setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{borderColor:"rgba(91,31,36,0.15)",color:MAROON}}><Filter size={14}/> Filter</button>
                <select value={sort} onChange={e=>setSort(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm outline-none appearance-none"
                  style={{border:`1px solid rgba(91,31,36,0.15)`,background:"#FFFFFF",color:MAROON,fontFamily:SANS}}>
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            {filtered.length===0?(
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-semibold mb-2" style={{fontFamily:SERIF,color:MAROON}}>No products match your filters</p>
                <button onClick={clearAll} className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium" style={{background:MAROON,color:IVORY}}>Clear Filters</button>
              </div>
            ):(
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {filtered.map(p=>(
                  <div key={p.id} onClick={()=>onProductClick(p)}
                    className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
                    style={{background:"#FFFFFF",boxShadow:"0 2px 20px rgba(91,31,36,0.06)",border:"1px solid rgba(91,31,36,0.06)"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 16px 40px rgba(91,31,36,0.14)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 20px rgba(91,31,36,0.06)"}>
                    <div className="relative overflow-hidden aspect-square bg-amber-50">
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {p.badges.map(b=><span key={b} className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(91,31,36,0.88)",color:GOLD}}>{b}</span>)}
                      </div>
                      <button onClick={e=>{e.stopPropagation();setWish(w=>({...w,[p.id]:!w[p.id]}))}}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.9)"}}>
                        <Heart size={13} style={{color:wish[p.id]?"#E74C3C":"#7A6A58",fill:wish[p.id]?"#E74C3C":"none"}}/>
                      </button>
                      <div className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                        style={{background:"rgba(91,31,36,0.9)"}}>
                        <span className="text-xs font-semibold flex items-center gap-2" style={{color:GOLD}}><Eye size={12}/> View Product</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-0.5 leading-snug" style={{fontFamily:SERIF,color:MAROON}}>{p.name}</h3>
                      <p className="text-xs mb-2" style={{color:"#7A6A58"}}>{p.subtitle}</p>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({length:5}).map((_,j)=><Star key={j} size={10} fill={j<Math.round(p.rating)?GOLD:"none"} stroke={GOLD} strokeWidth={1.5}/>)}
                        <span className="text-[10px] ml-1" style={{color:"#9A8A78"}}>({p.reviews})</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs line-through" style={{fontFamily:PRICE_FONT,color:"#9A8A78"}}>₹{p.original.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-semibold" style={{color:"#4A8A4A"}}>{Math.round((1-p.price/p.original)*100)}% off</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile filter drawer */}
      {sidebarOpen&&(
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setSidebarOpen(false)}/>
          <div className="relative w-72 bg-white h-full overflow-y-auto p-6 shadow-2xl ml-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Filters</h3>
              <button onClick={()=>setSidebarOpen(false)}><X size={20} style={{color:MAROON}}/></button>
            </div>
            <FilterPanel/>
            <button onClick={()=>setSidebarOpen(false)} className="w-full mt-6 py-3 rounded-2xl text-sm font-semibold" style={{background:MAROON,color:IVORY}}>
              Apply Filters ({filtered.length} products)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Product Detail Page ──────────────────────────────────────────────────────
const PROD_TABS=["Description","Benefits","How to Use","Temple Ritual","Reviews"];
const REVIEWS_DATA=[
  {name:"Sunita R.",city:"Delhi",rating:5,text:"The quality is outstanding. I can feel the positive energy radiating from the yantra. Temple energization makes a real difference.",verified:true,date:"2 weeks ago"},
  {name:"Rahul K.",city:"Chennai",rating:5,text:"Received beautifully packaged with the authenticity certificate. The craftsmanship is exceptional — worth every rupee.",verified:true,date:"1 month ago"},
  {name:"Meera P.",city:"Pune",rating:4,text:"Very happy with my purchase. Delivery was prompt and the product matches the description perfectly. Highly recommend Aroham.",verified:true,date:"3 weeks ago"},
];

function ProductDetailPage({ product, onBack, onAddToCart }:{product:ArohamProduct;onBack:()=>void;onAddToCart:(p:ArohamProduct,qty:number)=>void;}) {
  const [tab,setTab]=useState(0);
  const [qty,setQty]=useState(1);
  const [selectedImg,setSelectedImg]=useState(0);
  const [contactOpen,setContactOpen]=useState(false);
  const [contactMsg,setContactMsg]=useState("");

  const imgViews=["Front View","Detail View","In Use","Packaging","Certificate"];

  const tabContent=[
    // Description
    <div className="space-y-5">
      <p className="text-sm leading-relaxed" style={{color:"#5A4A3A"}}>
        <strong style={{color:MAROON}}>{product.name}</strong> is not merely a product — it is a sacred instrument of Vedic science,
        crafted according to ancient Shilpa Shastra principles and energized through traditional temple rituals.
        Each piece carries the accumulated wisdom of centuries of Jyotish practice.
      </p>
      <p className="text-sm leading-relaxed" style={{color:"#5A4A3A"}}>
        {product.shortDesc} The geometric precision in its construction aligns with cosmic frequencies that Vedic tradition identifies as channels for specific divine energies.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {[["Material",product.material],["Size",product.size],["Category",product.category],["Purpose",product.purpose]].map(([k,v])=>(
          <div key={k} className="p-3 rounded-xl" style={{background:"rgba(200,160,68,0.06)",border:"1px solid rgba(200,160,68,0.15)"}}>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{color:GOLD}}>{k}</div>
            <div className="text-sm font-medium" style={{color:MAROON}}>{v}</div>
          </div>
        ))}
      </div>
    </div>,
    // Benefits
    <div className="grid sm:grid-cols-2 gap-4">
      {product.benefits.map(b=>(
        <div key={b} className="flex items-start gap-3 p-4 rounded-2xl" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.07)"}}>
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{background:"rgba(200,160,68,0.1)"}}>
            <Sparkles size={14} style={{color:GOLD}}/>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{b}</p>
            <p className="text-xs mt-0.5" style={{color:"#7A6A58"}}>Vedic tradition attests to this benefit</p>
          </div>
        </div>
      ))}
    </div>,
    // How to use
    <div className="space-y-4">
      {["Unbox carefully and keep in a clean place","Cleanse with Gangajal or incense smoke","Place in the recommended direction (usually East/Northeast)","Offer a flower, light a diya, and chant the associated mantra","Experience the positive energy over 40 days of regular worship"].map((step,i)=>(
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{background:`linear-gradient(135deg,${GOLD},${SAFFRON})`,color:"#1A0D0E"}}>{i+1}</div>
            {i<4&&<div className="w-px flex-1 mt-1 mb-1" style={{background:"rgba(200,160,68,0.2)",minHeight:20}}/>}
          </div>
          <div className="pb-4">
            <p className="text-sm leading-relaxed" style={{color:"#5A4A3A"}}>{step}</p>
          </div>
        </div>
      ))}
    </div>,
    // Temple ritual
    <div className="space-y-5">
      <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,#FAF0D8,${IVORY})`,border:"1px solid rgba(200,160,68,0.2)"}}>
        <h4 className="font-semibold mb-2" style={{fontFamily:SERIF,color:MAROON}}>Pran Pratishtha Ceremony</h4>
        <p className="text-sm leading-relaxed" style={{color:"#5A4A3A"}}>
          Before reaching you, every {product.name} undergoes a complete Pran Pratishtha — a sacred consecration ritual performed by certified Vedic pandits.
          The ceremony includes 108 rounds of mantra chanting, ritual bathing with Panchamrit, and invocation of the presiding deity.
        </p>
      </div>
      {["Shuddhikaran (Purification)","Sthapan (Installation)","Pranpratishtha (Life-Infusion)","Naivedya (Offering)","Visarjan (Conclusion)"].map((r,i)=>(
        <div key={r} className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{background:"rgba(200,160,68,0.12)",color:GOLD,border:`1px solid rgba(200,160,68,0.3)`}}>{i+1}</div>
          <span className="text-sm" style={{color:"#5A4A3A"}}>{r}</span>
        </div>
      ))}
    </div>,
    // Reviews
    <div className="space-y-4">
      <div className="flex items-center gap-6 p-5 rounded-2xl" style={{background:"rgba(200,160,68,0.06)",border:"1px solid rgba(200,160,68,0.15)"}}>
        <div className="text-center">
          <div className="text-4xl font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{product.rating}</div>
          <div className="flex gap-0.5 mt-1">{Array.from({length:5}).map((_,j)=><Star key={j} size={14} fill={j<Math.round(product.rating)?GOLD:"none"} stroke={GOLD}/>)}</div>
          <div className="text-xs mt-1" style={{color:"#7A6A58"}}>{product.reviews} reviews</div>
        </div>
        <div className="flex-1">
          {[5,4,3,2,1].map(n=>(
            <div key={n} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-4" style={{color:"#9A8A78"}}>{n}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(91,31,36,0.08)"}}>
                <div className="h-full rounded-full" style={{width:`${n===5?75:n===4?18:n===3?5:n===2?1:1}%`,background:GOLD}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      {REVIEWS_DATA.map((r,i)=>(
        <div key={i} className="p-5 rounded-2xl" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.07)"}}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:MAROON,color:GOLD}}>{r.name[0]}</div>
              <div>
                <div className="text-xs font-semibold" style={{color:MAROON}}>{r.name} · {r.city}</div>
                {r.verified&&<div className="text-[10px]" style={{color:"#4A8A4A"}}>✓ Verified Purchase</div>}
              </div>
            </div>
            <span className="text-[10px]" style={{color:"#9A8A78"}}>{r.date}</span>
          </div>
          <div className="flex mb-2">{Array.from({length:r.rating}).map((_,j)=><Star key={j} size={11} fill={GOLD} stroke={GOLD}/>)}</div>
          <p className="text-sm leading-relaxed" style={{color:"#5A4A3A"}}>{r.text}</p>
        </div>
      ))}
    </div>
  ];

  return(
    <div className="w-full overflow-x-hidden" style={{background:IVORY,minHeight:"100vh",fontFamily:SANS}}>
      {/* Breadcrumb */}
      <div className="pt-24 pb-0 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs mb-6" style={{color:"#9A8A78"}}>
          <button onClick={onBack} className="hover:underline" style={{color:MAROON}}>Home</button>
          <ChevronRight size={12}/><button onClick={onBack} className="hover:underline" style={{color:MAROON}}>Shop</button>
          <ChevronRight size={12}/><span>{product.name}</span>
        </div>
      </div>
      {/* Hero 3-col */}
      <div className="px-5 lg:px-10 pb-10 ml-[-10px] mr-[0px] my-[0px]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[48%_32%_20%] gap-8">
          {/* Gallery */}
          <div>
            <div className="rounded-3xl overflow-hidden aspect-square bg-amber-50 mb-3 relative group" style={{boxShadow:"0 8px 40px rgba(91,31,36,0.1)"}}>
              <img src={product.img} alt={product.name} className="w-full h-full object-cover"/>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 rounded-full hover:opacity-80 transition-opacity" style={{background:"rgba(255,255,255,0.9)"}}>
                  <Heart size={16} style={{color:"#7A6A58"}}/>
                </button>
                <button className="p-2 rounded-full hover:opacity-80 transition-opacity" style={{background:"rgba(255,255,255,0.9)"}}>
                  <Share2 size={16} style={{color:"#7A6A58"}}/>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold" style={{background:"rgba(91,31,36,0.88)",color:GOLD}}>
                {imgViews[selectedImg]}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imgViews.map((v,i)=>(
                <button key={i} onClick={()=>setSelectedImg(i)}
                  className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                  style={{border:`2px solid ${selectedImg===i?GOLD:"rgba(91,31,36,0.1)"}`,boxShadow:selectedImg===i?`0 0 0 2px rgba(200,160,68,0.2)`:"none"}}>
                  <img src={product.img} alt={v} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"/>
                </button>
              ))}
            </div>
          </div>
          {/* Product story */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.badges.map(b=><span key={b} className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{background:"rgba(91,31,36,0.08)",color:MAROON}}>{b}</span>)}
            </div>
            <h1 className="mb-1" style={{fontFamily:SERIF,fontSize:"clamp(1.5rem,3vw,2.25rem)",fontWeight:500,color:MAROON,lineHeight:1.15}}>{product.name}</h1>
            <p className="text-sm mb-3" style={{color:GOLD,fontFamily:SANS,fontWeight:600}}>{product.subtitle}</p>
            <p className="text-sm leading-relaxed mb-4" style={{color:"#5A4A3A"}}>{product.shortDesc}</p>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex">{Array.from({length:5}).map((_,j)=><Star key={j} size={14} fill={j<Math.round(product.rating)?GOLD:"none"} stroke={GOLD} strokeWidth={1.5}/>)}</div>
              <span className="text-sm font-medium" style={{color:MAROON}}>{product.rating}</span>
              <span className="text-xs" style={{color:"#9A8A78"}}>({product.reviews} reviews)</span>
              <span className="text-xs" style={{color:"#4A8A4A"}}>· 120+ bought this month</span>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-base line-through" style={{fontFamily:PRICE_FONT,color:"#9A8A78"}}>₹{product.original.toLocaleString("en-IN")}</span>
              <span className="text-sm font-bold" style={{color:"#4A8A4A"}}>{Math.round((1-product.price/product.original)*100)}% off</span>
            </div>
            <p className="text-[11px] mb-5" style={{color:"#9A8A78"}}>Inclusive of GST · Free shipping · Temple energized</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center rounded-full overflow-hidden" style={{border:`1.5px solid rgba(91,31,36,0.15)`}}>
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-10 h-10 flex items-center justify-center hover:bg-black/5" style={{color:MAROON}}><Minus size={14}/></button>
                <span className="w-10 text-center font-semibold" style={{color:MAROON,fontFamily:SERIF}}>{qty}</span>
                <button onClick={()=>setQty(q=>q+1)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5" style={{color:MAROON}}><Plus size={14}/></button>
              </div>
              <span className="text-xs" style={{color:"#4A8A4A"}}>✓ In Stock</span>
            </div>
            <div className="space-y-3 mb-5">
              <button onClick={()=>onAddToCart(product,qty)}
                className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg"
                style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
                <ShoppingCart size={16}/> Add to Cart
              </button>
              <button className="w-full py-3.5 rounded-2xl text-sm font-semibold border transition-all hover:bg-amber-50 flex items-center justify-center gap-2"
                style={{borderColor:GOLD,color:MAROON}}>
                ⚡ Buy Now
              </button>
            </div>
            {/* Feature icons */}
            <div className="grid grid-cols-5 gap-2">
              {[{icon:Flame,l:"Temple Energized"},{icon:Gem,l:"100% Authentic"},{icon:Award,l:"Handcrafted"},{icon:Shield,l:"Secure Pay"},{icon:Package,l:"Easy Returns"}].map(({icon:Icon,l})=>(
                <div key={l} className="flex flex-col items-center gap-1 text-center">
                  <Icon size={16} style={{color:GOLD}} strokeWidth={1.5}/>
                  <span className="text-[9px] leading-tight" style={{color:"#7A6A58"}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Trust panel */}
          <div className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 4px 24px rgba(91,31,36,0.07)"}}>
              <div className="px-5 py-4" style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`}}>
                <p className="text-xs font-semibold" style={{color:GOLD}}>Why Buy from Aroham?</p>
              </div>
              <div className="p-4 space-y-3">
                {[{icon:"🪔",t:"Temple Energized",d:"Pran Pratishtha by certified pandits"},{icon:"📜",t:"Authenticity Certificate",d:"Included with every product"},{icon:"✋",t:"Handcrafted Quality",d:"By master artisans"},{icon:"⭐",t:"Expert Recommended",d:"By Jyotish scholars"},{icon:"📦",t:"Premium Packaging",d:"Luxury gift box"},{icon:"↩️",t:"Easy Returns",d:"7-day hassle-free returns"}].map(({icon,t,d})=>(
                  <div key={t} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <div>
                      <div className="text-xs font-semibold" style={{color:MAROON}}>{t}</div>
                      <div className="text-[10px]" style={{color:"#9A8A78"}}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Expert card */}
            <div className="rounded-2xl p-4" style={{background:"rgba(200,160,68,0.06)",border:"1px solid rgba(200,160,68,0.2)"}}>
              <p className="text-xs font-semibold mb-1" style={{fontFamily:SERIF,color:MAROON}}>Need Guidance?</p>
              <p className="text-[10px] mb-3" style={{color:"#7A6A58"}}>Talk to our Vastu Expert to confirm this is the right remedy for you.</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1" style={{background:"#25D366",color:"white"}}>💬 WhatsApp</button>
                <button className="flex-1 py-2 rounded-xl text-[10px] font-semibold border" style={{borderColor:"rgba(91,31,36,0.2)",color:MAROON}}>📞 Call</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Trust strip */}
      <div className="border-y px-6 py-4" style={{borderColor:"rgba(91,31,36,0.08)",background:"#FFFFFF"}}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 lg:gap-10">
          {[{icon:Truck,l:"Free Shipping"},{icon:Flame,l:"Temple Energized"},{icon:Shield,l:"Secure Payments"},{icon:Package,l:"Easy Returns"},{icon:Award,l:"Premium Packaging"},{icon:CheckCircle,l:"Trusted India-Wide"}].map(({icon:Icon,l})=>(
            <div key={l} className="flex items-center gap-2">
              <Icon size={14} style={{color:GOLD}} strokeWidth={1.5}/>
              <span className="text-xs font-medium" style={{color:"#5A4A3A"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Info tabs */}
      <div className="sticky top-16 z-30 border-b overflow-x-auto" style={{background:"rgba(250,247,242,0.97)",backdropFilter:"blur(12px)",borderColor:"rgba(91,31,36,0.08)"}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-0">
          {PROD_TABS.map((t,i)=>(
            <button key={t} onClick={()=>setTab(i)}
              className="px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all"
              style={{borderColor:tab===i?MAROON:"transparent",color:tab===i?MAROON:"#7A6A58"}}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="max-w-3xl">{tabContent[tab]}</div>
      </div>
      {/* Confused? Contact section */}
      <div className="px-6 lg:px-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden" style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,position:"relative"}}>
            <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:`radial-gradient(circle,${GOLD} 1px,transparent 1px)`,backgroundSize:"24px 24px"}}/>
            <div className="relative px-8 py-10">
              <button onClick={()=>setContactOpen(o=>!o)} className="w-full text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs tracking-widest uppercase font-medium block mb-3" style={{color:"rgba(200,160,68,0.8)"}}>Expert Guidance</span>
                    <h3 className="mb-2 text-2xl font-semibold" style={{fontFamily:SERIF,color:IVORY,lineHeight:1.2}}>Confused? Let Us Help You Choose.</h3>
                    <p className="text-sm" style={{color:"rgba(250,247,242,0.65)"}}>Our Vedic experts will personally guide you to the right remedy for your specific situation.</p>
                  </div>
                  <ChevronDown size={24} style={{color:"rgba(250,247,242,0.5)",transform:contactOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.3s",flexShrink:0}}/>
                </div>
              </button>
              {contactOpen&&(
                <div className="mt-6 grid sm:grid-cols-3 gap-3">
                  <a href="mailto:hello@aroham.in"
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105"
                    style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)"}}>
                    <Mail size={20} style={{color:GOLD}}/>
                    <div>
                      <div className="text-sm font-semibold" style={{color:IVORY}}>Email Us</div>
                      <div className="text-[11px]" style={{color:"rgba(250,247,242,0.6)"}}>hello@aroham.in</div>
                    </div>
                  </a>
                  <a href="tel:+919876543210"
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105"
                    style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)"}}>
                    <Phone size={20} style={{color:GOLD}}/>
                    <div>
                      <div className="text-sm font-semibold" style={{color:IVORY}}>Call Us</div>
                      <div className="text-[11px]" style={{color:"rgba(250,247,242,0.6)"}}>+91 98765 43210</div>
                    </div>
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105"
                    style={{background:"#25D366",border:"1px solid rgba(255,255,255,0.15)"}}>
                    <span className="text-xl">💬</span>
                    <div>
                      <div className="text-sm font-semibold" style={{color:"white"}}>WhatsApp</div>
                      <div className="text-[11px]" style={{color:"rgba(255,255,255,0.8)"}}>Chat instantly</div>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-5 py-4"
        style={{background:"rgba(250,247,242,0.97)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(91,31,36,0.1)",boxShadow:"0 -4px 24px rgba(91,31,36,0.08)"}}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{product.price.toLocaleString("en-IN")}</span>
          <span className="text-xs line-through" style={{fontFamily:PRICE_FONT,color:"#9A8A78"}}>₹{product.original.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>onAddToCart(product,qty)}
            className="flex-1 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
            <ShoppingCart size={14}/> Add to Cart
          </button>
          <button className="px-5 py-4 rounded-2xl text-sm font-semibold border" style={{borderColor:GOLD,color:MAROON}}>⚡ Buy</button>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout flow helpers (shared) ───────────────────────────────────────────
const INDIA_STATES=["Andhra Pradesh","Assam","Bihar","Chandigarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];
const SAVED_ADDRESSES=[
  {id:1,type:"Home",name:"Priya Sharma",phone:"+91 98765 43210",line1:"Flat 4B, Sunrise Residency, Sector 12",city:"Mumbai",state:"Maharashtra",pin:"400076",isDefault:true},
  {id:2,type:"Office",name:"Priya Sharma",phone:"+91 98765 43210",line1:"WeWork, Bandra Kurla Complex, Floor 8",city:"Mumbai",state:"Maharashtra",pin:"400051",isDefault:false},
  {id:3,type:"Parents",name:"S. K. Sharma",phone:"+91 94561 78902",line1:"12 Shanti Nagar, Near Ram Mandir",city:"Jaipur",state:"Rajasthan",pin:"302001",isDefault:false},
];

function CheckoutProgress({step}:{step:number;}) {
  const STEPS=["Cart","Shipping","Payment","Confirmation"];
  return(
    <div className="px-6 py-5 rounded-2xl ml-[10px] mr-[20px] mt-[0px] mb-[20px]" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.07)"}}>
      <div className="flex items-center justify-between">
        {STEPS.map((s,i)=>(
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                style={{background:i<step?"rgba(200,160,68,0.15)":i===step?GOLD:"rgba(91,31,36,0.07)",
                  color:i<step?GOLD:i===step?"#1A0D0E":"#9A8A78",
                  border:i===step?`2px solid ${GOLD}`:"none"}}>
                {i<step?"✓":i+1}
              </div>
              <span className="text-[9px] text-center leading-none" style={{color:i===step?MAROON:"#9A8A78",fontWeight:i===step?600:400}}>{s}</span>
            </div>
            {i<STEPS.length-1&&<div className="flex-1 h-px mx-2 w-8" style={{background:i<step?GOLD:"rgba(91,31,36,0.1)"}}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderSummaryCard({cartItems,onBack,onNext,nextLabel,step}:{cartItems:CartItem[];onBack:()=>void;onNext:()=>void;nextLabel:string;step:number;}) {
  const subtotal=cartItems.reduce((s,i)=>s+i.product.price*i.qty,0);
  const total=subtotal+99+Math.round(subtotal*0.05);
  return(
    <div className="lg:sticky lg:top-24 ml-[-20px] mr-[0px] my-[0px]">
      <CheckoutProgress step={step}/>
      <div className="rounded-3xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 4px 30px rgba(91,31,36,0.07)"}}>
        <div className="px-6 pt-6 pb-4" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}>
          <h2 className="text-lg font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Order Summary</h2>
        </div>
        <div className="px-6 py-4 space-y-3" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}>
          {cartItems.map(({product:p,qty})=>(
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50"><img src={p.img} alt={p.name} className="w-full h-full object-cover"/></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{fontFamily:SERIF,color:MAROON}}>{p.name}</p>
                <p className="text-[10px]" style={{color:"#9A8A78"}}>Qty: {qty}</p>
              </div>
              <span className="text-xs font-semibold flex-shrink-0" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{(p.price*qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-5 space-y-3">
          {[["Subtotal",`₹${subtotal.toLocaleString("en-IN")}`],["Temple Energization","₹99"],["Shipping","FREE",true],["GST (5%)",`₹${Math.round(subtotal*0.05).toLocaleString("en-IN")}`]].map(([l,v,g])=>(
            <div key={l as string} className="flex justify-between text-sm">
              <span style={{color:"#7A6A58"}}>{l as string}</span>
              <span style={{color:g?"#4A8A4A":MAROON,fontFamily:PRICE_FONT,fontWeight:600}}>{v as string}</span>
            </div>
          ))}
          <div className="h-px w-full" style={{background:`linear-gradient(90deg,transparent,rgba(200,160,68,0.3),transparent)`}}/>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold" style={{color:MAROON}}>Grand Total</span>
            <span className="text-2xl font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-3">
          <button onClick={onNext}
            className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg"
            style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
            <Lock size={14}/> {nextLabel}
          </button>
          <button onClick={onBack} className="w-full py-3 rounded-2xl text-sm font-medium border transition-all hover:bg-amber-50" style={{borderColor:"rgba(91,31,36,0.2)",color:MAROON}}>← Back</button>
        </div>
      </div>
      <div className="rounded-2xl px-5 py-4" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.07)"}}>
        <div className="grid grid-cols-2 gap-2">
          {[{icon:Gem,label:"100% Authentic"},{icon:Flame,label:"Temple Energized"},{icon:Shield,label:"Secure Payments"},{icon:Package,label:"Easy Returns"},{icon:Truck,label:"Fast Delivery"},{icon:CheckCircle,label:"Trusted Brand"}].map(({icon:Icon,label})=>(
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} style={{color:GOLD,flexShrink:0}} strokeWidth={1.5}/>
              <span className="text-[10px] font-medium" style={{color:"#5A4A3A"}}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shipping Page ─────────────────────────────────────────────────────────────
function ShippingPage({ cartItems, onBack, onNext }:{cartItems:CartItem[];onBack:()=>void;onNext:()=>void;}) {
  const [selectedAddr,setSelectedAddr]=useState(1);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({firstName:"",lastName:"",phone:"",email:"",pin:"",house:"",street:"",landmark:"",city:"",state:"",addressType:"Home",saveAddress:true,sameBilling:true,specialRequest:""});
  const set=(k:keyof typeof form)=>(v:string|boolean)=>setForm(p=>({...p,[k]:v}));
  return(
    <div className="w-full overflow-x-hidden" style={{background:IVORY,minHeight:"100vh",fontFamily:SANS}}>
      <div className="pt-4 pb-8 relative overflow-hidden" style={{background:"linear-gradient(135deg,#F5EDE0,#FAF7F2,#F0E8D8)"}}>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:`repeating-linear-gradient(0deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px)`}}/>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
          {/* Back button */}
          <button onClick={onBack}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{background:"#FFFFFF",color:MAROON,border:`1px solid rgba(91,31,36,0.15)`,boxShadow:"0 2px 8px rgba(91,31,36,0.08)"}}>
            <ChevronLeft size={16}/> Back to Cart
          </button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5 text-xs" style={{color:"#9A8A78"}}>
            <span style={{color:MAROON}}>Cart</span><ChevronRight size={12}/><span className="font-medium" style={{color:MAROON}}>Delivery Details</span><ChevronRight size={12}/><span>Payment</span>
          </div>
          <h1 className="mb-2" style={{fontFamily:SERIF,fontSize:"clamp(2rem,5vw,3.25rem)",fontWeight:500,color:MAROON,lineHeight:1.1}}>Delivery Details</h1>
          <p className="text-sm" style={{color:"#7A6A58"}}>Tell us where you'd like your sacred products delivered.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10 pb-32 lg:pb-10 mx-[-20px] my-[0px]">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="ml-[-35px] mr-[0px] my-[0px]">
            {/* Saved addresses */}
            <div className="rounded-3xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 2px 20px rgba(91,31,36,0.04)"}}>
              <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}>
                <h2 className="text-lg font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Saved Addresses</h2>
                <button onClick={()=>setShowForm(!showForm)} className="text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80"
                  style={{background:"rgba(91,31,36,0.07)",color:MAROON}}>{showForm?"Cancel":"+ New Address"}</button>
              </div>
              <div className="p-6 space-y-3">
                {SAVED_ADDRESSES.map(addr=>{
                  const sel=selectedAddr===addr.id;
                  return(
                    <div key={addr.id} onClick={()=>setSelectedAddr(addr.id)}
                      className="group relative p-5 rounded-2xl cursor-pointer transition-all duration-200"
                      style={{border:`1.5px solid ${sel?GOLD:"rgba(91,31,36,0.1)"}`,background:sel?"rgba(200,160,68,0.05)":"#FAFAF8",boxShadow:sel?`0 0 0 3px rgba(200,160,68,0.1)`:"none"}}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
                            style={{border:`2px solid ${sel?GOLD:"rgba(91,31,36,0.25)"}`,background:sel?GOLD:"transparent"}}>
                            {sel&&<div className="w-2 h-2 rounded-full bg-white"/>}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{addr.type}</span>
                              {addr.isDefault&&<span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(200,160,68,0.15)",color:"#8B6914"}}>DEFAULT</span>}
                            </div>
                            <p className="text-xs font-medium mb-0.5" style={{color:"#3A2A1A"}}>{addr.name} · {addr.phone}</p>
                            <p className="text-xs" style={{color:"#7A6A58"}}>{addr.line1}, {addr.city}, {addr.state} – {addr.pin}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium hover:bg-amber-50" style={{color:MAROON,border:"1px solid rgba(91,31,36,0.12)"}}>Edit</button>
                          <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium hover:bg-red-50" style={{color:"#C04040",border:"1px solid rgba(192,64,64,0.15)"}}>Delete</button>
                        </div>
                      </div>
                      {sel&&<div className="mt-3 pt-3 flex items-center gap-2" style={{borderTop:"1px solid rgba(200,160,68,0.2)"}}>
                        <Truck size={12} style={{color:"#4A8A4A"}}/><span className="text-[10px] font-medium" style={{color:"#4A8A4A"}}>Estimated delivery: Tue, 15 Jul 2025 · Free Shipping</span>
                      </div>}
                    </div>
                  );
                })}
              </div>
            </div>
            {showForm&&(
              <div className="rounded-3xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 2px 20px rgba(91,31,36,0.04)"}}>
                <div className="px-6 pt-6 pb-4" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}><h2 className="text-lg font-semibold" style={{fontFamily:SERIF,color:MAROON}}>New Address</h2></div>
                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="First Name" value={form.firstName} onChange={set("firstName") as (v:string)=>void} required/>
                    <FloatingInput label="Last Name" value={form.lastName} onChange={set("lastName") as (v:string)=>void} required/>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="Phone" type="tel" value={form.phone} onChange={set("phone") as (v:string)=>void} required/>
                    <FloatingInput label="Email" type="email" value={form.email} onChange={set("email") as (v:string)=>void} required/>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="PIN Code" value={form.pin} onChange={set("pin") as (v:string)=>void} required/>
                    <FloatingInput label="House / Flat No." value={form.house} onChange={set("house") as (v:string)=>void} required/>
                  </div>
                  <FloatingInput label="Street Address" value={form.street} onChange={set("street") as (v:string)=>void} required/>
                  <FloatingInput label="Landmark (Optional)" value={form.landmark} onChange={set("landmark") as (v:string)=>void}/>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="City" value={form.city} onChange={set("city") as (v:string)=>void} required/>
                    <FloatingSelect label="State" options={INDIA_STATES} value={form.state} onChange={set("state") as (v:string)=>void}/>
                  </div>
                  <button className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 mt-2 transition-all hover:opacity-90"
                    style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
                    <CheckCircle size={15}/> Deliver Here
                  </button>
                </div>
              </div>
            )}
            {/* Special requests */}
            <div className="rounded-3xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)"}}>
              <div className="px-6 pt-5 pb-4" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}>
                <h2 className="text-base font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Special Delivery Instructions</h2>
              </div>
              <div className="p-6">
                <textarea value={form.specialRequest} onChange={e=>set("specialRequest")(e.target.value)} rows={3}
                  placeholder="Add delivery instructions for our team..."
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none transition-all"
                  style={{border:"1.5px solid rgba(91,31,36,0.12)",background:IVORY,color:"#222222",fontFamily:SANS}}
                  onFocus={e=>{e.target.style.borderColor=GOLD;}} onBlur={e=>{e.target.style.borderColor="rgba(91,31,36,0.12)";}}/>
              </div>
            </div>
            {/* Delivery info */}
            <div className="rounded-3xl p-[24px]" style={{background:"linear-gradient(135deg,#FAF0D8,#FAF7F2)",border:`1px solid rgba(200,160,68,0.22)`}}>
              <div className="flex items-start gap-4">
                <span className="text-3xl">🚚</span>
                <div>
                  <h3 className="text-base font-semibold mb-3" style={{fontFamily:SERIF,color:MAROON}}>Delivery Information</h3>
                  <div className="space-y-2">
                    {[["📅","Est. Delivery","Tue, 15 Jul 2025 · 3–5 business days"],["✨","Shipping","Free on this order"],["📦","Packaging","Premium gift packaging"],["🪔","Sacred Prep","Temple blessing before dispatch"]].map(([i,l,v])=>(
                      <div key={l} className="flex items-start gap-3">
                        <span className="text-sm flex-shrink-0">{i}</span>
                        <div><span className="text-xs font-semibold" style={{color:MAROON}}>{l}: </span><span className="text-xs" style={{color:"#7A6A58"}}>{v}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <OrderSummaryCard cartItems={cartItems} onBack={onBack} onNext={onNext} nextLabel="Proceed to Payment" step={1}/>
        </div>
      </div>
      {/* Mobile sticky */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-5 py-4"
        style={{background:"rgba(250,247,242,0.97)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(91,31,36,0.1)"}}>
        <button onClick={onNext} className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
          <Lock size={14}/> Proceed to Payment
        </button>
      </div>
    </div>
  );
}

// ─── Payment Page ──────────────────────────────────────────────────────────────
type PayMethod="upi"|"card"|"netbanking"|"wallet"|"emi"|"cod";
const UPI_APPS=[{name:"Google Pay",icon:"G",color:"#4285F4"},{name:"PhonePe",icon:"P",color:"#5F259F"},{name:"Paytm",icon:"₱",color:"#00BAF2"},{name:"BHIM",icon:"B",color:"#00529B"},{name:"Amazon Pay",icon:"A",color:"#FF9900"}];
const BANKS_DATA=[{name:"HDFC Bank",code:"HDFC"},{name:"ICICI Bank",code:"ICICI"},{name:"SBI",code:"SBI"},{name:"Axis Bank",code:"AXIS"},{name:"Kotak",code:"KOTAK"},{name:"Yes Bank",code:"YES"},{name:"PNB",code:"PNB"},{name:"Bank of Baroda",code:"BOB"}];
const WALLETS_DATA=[{name:"Amazon Pay",icon:"A",color:"#FF9900"},{name:"PhonePe",icon:"P",color:"#5F259F"},{name:"Paytm Wallet",icon:"₱",color:"#00BAF2"},{name:"Mobikwik",icon:"M",color:"#FF5722"}];
const EMI_PLANS=[{months:3,per:"₹1,979/mo",interest:"No cost"},{months:6,per:"₹1,002/mo",interest:"No cost"},{months:9,per:"₹681/mo",interest:"1.5% p.a."},{months:12,per:"₹517/mo",interest:"2% p.a."}];

function PaymentPage({ cartItems, onBack, onNext }:{cartItems:CartItem[];onBack:()=>void;onNext:()=>void;}) {
  const [method,setMethod]=useState<PayMethod>("upi");
  const [upiId,setUpiId]=useState("");
  const [upiApp,setUpiApp]=useState("");
  const [card,setCard]=useState({number:"",expiry:"",cvv:"",name:"",save:false});
  const [bankSearch,setBankSearch]=useState("");
  const [selectedBank,setSelectedBank]=useState("");
  const [selectedWallet,setSelectedWallet]=useState("");
  const [selectedEmi,setSelectedEmi]=useState(0);
  const [placing,setPlacing]=useState(false);
  const subtotal=cartItems.reduce((s,i)=>s+i.product.price*i.qty,0);
  const total=subtotal+99+Math.round(subtotal*0.05);
  const filteredBanks=BANKS_DATA.filter(b=>b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  const handlePlace = async () => {
    try {
      setPlacing(true);
      const items = cartItems.map(i => ({ id: i.product.id, qty: i.qty }));
      
      const sessionRes = await supabase.auth.getSession();
      if (!sessionRes.data.session) {
        alert("Please login first.");
        setPlacing(false);
        return;
      }

      // Create order
      const orderData = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          checkoutType: "cart",
          items: items,
          address: { name: "User", phone: "9876543210", address: "Test Address", pincode: "110001", city: "Delhi", state: "Delhi" }
        })
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Aroham",
        description: "Payment for Order",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await api("/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            onNext(); // Success! Go to confirmation
          } catch (e: any) {
            alert("Verification failed: " + e.message);
          }
        },
        prefill: {
          name: "User",
          email: sessionRes.data.session?.user?.email || "user@example.com",
          contact: "9876543210",
          method: method === "cod" ? undefined : method,
          ...(method === "netbanking" && selectedBank ? { bank: selectedBank } : {}),
          ...(method === "wallet" && selectedWallet ? { wallet: selectedWallet.replace(/\s+/g, '').toLowerCase() } : {})
        },
        theme: { color: "#5B1F24" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed. " + response.error.description);
      });
      rzp.open();
    } catch (e: any) {
      alert("Checkout error: " + e.message);
    } finally {
      setPlacing(false);
    }
  };
  const PAYMENT_METHODS:[PayMethod,string,string,string][]=[["upi","UPI","Pay instantly via any UPI app","⚡"],["card","Credit / Debit Card","Visa, Mastercard, RuPay","💳"],["netbanking","Net Banking","All major Indian banks","🏦"],["wallet","Wallets","Amazon Pay, Paytm & more","👜"],["emi","EMI","No-cost EMI available","📅"],["cod","Cash on Delivery","Pay when order arrives","📦"]];
  return(
    <div style={{background:IVORY,minHeight:"100vh",fontFamily:SANS}}>
      <div className="pt-4 pb-8 px-6 lg:px-10 relative overflow-hidden" style={{background:"linear-gradient(135deg,#F5EDE0,#FAF7F2,#F0E8D8)"}}>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:`repeating-linear-gradient(0deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,${MAROON} 0,${MAROON} 1px,transparent 1px,transparent 48px)`}}/>
        <div className="relative max-w-7xl mx-auto">
          {/* Back button */}
          <button onClick={onBack}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{background:"#FFFFFF",color:MAROON,border:`1px solid rgba(91,31,36,0.15)`,boxShadow:"0 2px 8px rgba(91,31,36,0.08)"}}>
            <ChevronLeft size={16}/> Back to Delivery
          </button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5 text-xs" style={{color:"#9A8A78"}}>
            <span>Cart</span><ChevronRight size={12}/><span style={{color:MAROON}}>Delivery Details</span><ChevronRight size={12}/><span className="font-medium" style={{color:MAROON}}>Payment</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <h1 style={{fontFamily:SERIF,fontSize:"clamp(2rem,5vw,3.25rem)",fontWeight:500,color:MAROON,lineHeight:1.1}}>Secure Payment</h1>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{background:"rgba(200,160,68,0.12)",border:"1px solid rgba(200,160,68,0.25)"}}>
              <Lock size={11} style={{color:GOLD}}/><span className="text-[10px] font-semibold" style={{color:"#8B6914"}}>256-bit SSL</span>
            </div>
          </div>
          <p className="text-sm" style={{color:"#7A6A58"}}>Complete your sacred purchase securely.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 pb-32 lg:pb-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 2px 20px rgba(91,31,36,0.04)"}}>
              <div className="px-6 pt-6 pb-4" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}><h2 className="text-lg font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Payment Method</h2></div>
              <div className="divide-y" style={{borderColor:"rgba(91,31,36,0.06)"}}>
                {PAYMENT_METHODS.map(([id,label,desc,icon])=>{
                  const active=method===id;
                  return(
                    <div key={id}>
                      <button onClick={()=>setMethod(id)} className="w-full flex items-center gap-4 px-6 py-4 transition-colors text-left"
                        style={{background:active?"rgba(200,160,68,0.04)":"transparent"}}>
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                          style={{border:`2px solid ${active?GOLD:"rgba(91,31,36,0.2)"}`,background:active?GOLD:"transparent"}}>
                          {active&&<div className="w-2 h-2 rounded-full bg-white"/>}
                        </div>
                        <span className="text-lg flex-shrink-0">{icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{label}</div>
                          <div className="text-xs" style={{color:"#9A8A78"}}>{desc}</div>
                        </div>
                        <ChevronDown size={14} className="flex-shrink-0 transition-transform duration-200"
                          style={{color:"#9A8A78",transform:active?"rotate(180deg)":"rotate(0deg)"}}/>
                      </button>
                      {active&&(
                        <div className="px-6 pb-6 pt-2" style={{background:"rgba(200,160,68,0.03)",borderTop:"1px solid rgba(200,160,68,0.12)"}}>
                          {id==="upi"&&(
                            <div className="space-y-5">
                              <div className="grid grid-cols-5 gap-2">
                                {UPI_APPS.map(app=>(
                                  <button key={app.name} onClick={()=>setUpiApp(app.name)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:-translate-y-0.5"
                                    style={{border:`1.5px solid ${upiApp===app.name?GOLD:"rgba(91,31,36,0.1)"}`,background:upiApp===app.name?"rgba(200,160,68,0.08)":"#FFFFFF"}}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{background:app.color}}>{app.icon}</div>
                                    <span className="text-[9px] text-center leading-tight font-medium" style={{color:MAROON}}>{app.name}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="yourname@upi"
                                  className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
                                  style={{border:"1.5px solid rgba(91,31,36,0.14)",background:"#FFFFFF",color:"#222222",fontFamily:SANS}}
                                  onFocus={e=>{e.target.style.borderColor=GOLD;}} onBlur={e=>{e.target.style.borderColor="rgba(91,31,36,0.14)";}}/>
                                <button className="px-5 py-3 rounded-2xl text-sm font-semibold" style={{background:MAROON,color:IVORY}}>Verify</button>
                              </div>
                            </div>
                          )}
                          {id==="card"&&(
                            <div className="space-y-4">
                              <div className="relative w-full max-w-xs mx-auto h-40 rounded-2xl p-5 overflow-hidden"
                                style={{background:`linear-gradient(135deg,${MAROON},#7A2A30,#3A1015)`}}>
                                <div className="flex justify-between items-start mb-6">
                                  <span className="text-sm font-semibold" style={{fontFamily:SERIF,color:GOLD}}>Aroham</span>
                                  <div className="flex gap-1">
                                    <div className="w-7 h-7 rounded-full opacity-80" style={{background:"#EB001B"}}/>
                                    <div className="w-7 h-7 rounded-full opacity-80 -ml-3" style={{background:"#F79E1B"}}/>
                                  </div>
                                </div>
                                <div className="text-sm tracking-widest mb-3" style={{color:"rgba(255,255,255,0.9)",fontFamily:"monospace"}}>{card.number||"•••• •••• •••• ••••"}</div>
                                <div className="flex justify-between">
                                  <div><div className="text-[9px] uppercase tracking-widest mb-0.5" style={{color:"rgba(255,255,255,0.5)"}}>Holder</div><div className="text-xs font-medium" style={{color:"rgba(255,255,255,0.9)"}}>{card.name||"FULL NAME"}</div></div>
                                  <div><div className="text-[9px] uppercase tracking-widest mb-0.5" style={{color:"rgba(255,255,255,0.5)"}}>Expires</div><div className="text-xs font-medium" style={{color:"rgba(255,255,255,0.9)"}}>{card.expiry||"MM/YY"}</div></div>
                                </div>
                              </div>
                              <CardInput value={card.number} onChange={v=>setCard(c=>({...c,number:v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim()}))} placeholder="1234 5678 9012 3456" maxLength={19}/>
                              <div className="grid grid-cols-2 gap-3">
                                <CardInput value={card.expiry} onChange={v=>{const d=v.replace(/\D/g,"").slice(0,4);setCard(c=>({...c,expiry:d.length>2?`${d.slice(0,2)}/${d.slice(2)}`:d}));}} placeholder="MM / YY" maxLength={5}/>
                                <CardInput value={card.cvv} onChange={v=>setCard(c=>({...c,cvv:v.replace(/\D/g,"").slice(0,4)}))} placeholder="• • •" maxLength={4} type="password"/>
                              </div>
                              <CardInput value={card.name} onChange={v=>setCard(c=>({...c,name:v.toUpperCase()}))} placeholder="CARDHOLDER NAME" maxLength={26}/>
                            </div>
                          )}
                          {id==="netbanking"&&(
                            <div className="space-y-4">
                              <div className="relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"#9A8A78"}}/>
                                <input value={bankSearch} onChange={e=>setBankSearch(e.target.value)} placeholder="Search bank..."
                                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none"
                                  style={{border:"1.5px solid rgba(91,31,36,0.14)",background:"#FFFFFF",color:"#222222",fontFamily:SANS}}
                                  onFocus={e=>{e.target.style.borderColor=GOLD;}} onBlur={e=>{e.target.style.borderColor="rgba(91,31,36,0.14)";}}/>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {filteredBanks.map(bank=>(
                                  <button key={bank.code} onClick={()=>setSelectedBank(bank.code)}
                                    className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                                    style={{border:`1.5px solid ${selectedBank===bank.code?GOLD:"rgba(91,31,36,0.1)"}`,background:selectedBank===bank.code?"rgba(200,160,68,0.08)":"#FFFFFF"}}>
                                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black" style={{background:"rgba(91,31,36,0.08)",color:MAROON}}>{bank.code.slice(0,2)}</div>
                                    <span className="text-xs font-medium" style={{color:MAROON}}>{bank.name}</span>
                                    {selectedBank===bank.code&&<CheckCircle size={13} className="ml-auto" style={{color:GOLD}}/>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {id==="wallet"&&(
                            <div className="grid grid-cols-2 gap-3">
                              {WALLETS_DATA.map(w=>(
                                <button key={w.name} onClick={()=>setSelectedWallet(w.name)}
                                  className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                                  style={{border:`1.5px solid ${selectedWallet===w.name?GOLD:"rgba(91,31,36,0.1)"}`,background:selectedWallet===w.name?"rgba(200,160,68,0.08)":"#FFFFFF"}}>
                                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white" style={{background:w.color}}>{w.icon}</div>
                                  <span className="text-xs font-semibold" style={{color:MAROON}}>{w.name}</span>
                                  {selectedWallet===w.name&&<CheckCircle size={14} className="ml-auto" style={{color:GOLD}}/>}
                                </button>
                              ))}
                            </div>
                          )}
                          {id==="emi"&&(
                            <div className="space-y-3">
                              {EMI_PLANS.map((plan,i)=>(
                                <button key={i} onClick={()=>setSelectedEmi(i)}
                                  className="w-full flex items-center justify-between p-4 rounded-2xl transition-all"
                                  style={{border:`1.5px solid ${selectedEmi===i?GOLD:"rgba(91,31,36,0.1)"}`,background:selectedEmi===i?"rgba(200,160,68,0.08)":"#FFFFFF"}}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                      style={{border:`2px solid ${selectedEmi===i?GOLD:"rgba(91,31,36,0.2)"}`,background:selectedEmi===i?GOLD:"transparent"}}>
                                      {selectedEmi===i&&<div className="w-2 h-2 rounded-full bg-white"/>}
                                    </div>
                                    <div className="text-left">
                                      <div className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{plan.months} Months</div>
                                      <div className="text-[10px]" style={{color:"#7A6A58"}}>{plan.interest}</div>
                                    </div>
                                  </div>
                                  <span className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{plan.per}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {id==="cod"&&(
                            <div className="rounded-2xl p-5" style={{background:"linear-gradient(135deg,#FAF0D8,#FAF7F2)",border:`1px solid rgba(200,160,68,0.22)`}}>
                              <div className="flex items-start gap-4">
                                <span className="text-3xl">📦</span>
                                <div>
                                  <h4 className="text-sm font-semibold mb-1.5" style={{fontFamily:SERIF,color:MAROON}}>Cash on Delivery</h4>
                                  <p className="text-xs leading-relaxed mb-3" style={{color:"#7A6A58"}}>Pay ₹{total.toLocaleString("en-IN")} in cash when your order arrives. A ₹49 handling fee applies.</p>
                                  {["No online payment required","Pay at your doorstep","Sacred products delivered safely"].map(t=>(
                                    <div key={t} className="flex items-center gap-2 text-xs mb-1" style={{color:"#5A4A3A"}}><CheckCircle size={11} style={{color:GOLD}}/> {t}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Security */}
            <div className="rounded-3xl p-6" style={{background:"linear-gradient(135deg,#FAF0D8,#FAF7F2)",border:`1px solid rgba(200,160,68,0.22)`}}>
              <div className="flex items-center gap-2 mb-4"><Lock size={14} style={{color:GOLD}}/><span className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>100% Secure Checkout</span></div>
              <div className="grid grid-cols-4 gap-3">
                {[{i:"🔒",l:"SSL Encrypted",s:"256-bit"},{i:"🛡",l:"PCI DSS",s:"Compliant"},{i:"💳",l:"Razorpay",s:"Secured"},{i:"🚫",l:"No Data",s:"Stored"}].map(({i,l,s})=>(
                  <div key={l} className="flex flex-col items-center text-center gap-1 p-3 rounded-2xl" style={{background:"rgba(255,255,255,0.7)"}}>
                    <span className="text-xl">{i}</span>
                    <span className="text-[10px] font-semibold" style={{color:MAROON}}>{l}</span>
                    <span className="text-[9px]" style={{color:"#9A8A78"}}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right sidebar */}
          <div className="lg:sticky lg:top-24 space-y-5">
            <CheckoutProgress step={2}/>
            <div className="rounded-3xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 4px 30px rgba(91,31,36,0.07)"}}>
              <div className="px-6 pt-6 pb-4" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}><h2 className="text-lg font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Order Summary</h2></div>
              <div className="px-6 py-4 space-y-3" style={{borderBottom:"1px solid rgba(91,31,36,0.06)"}}>
                {cartItems.map(({product:p,qty})=>(
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50"><img src={p.img} alt={p.name} className="w-full h-full object-cover"/></div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate" style={{fontFamily:SERIF,color:MAROON}}>{p.name}</p><p className="text-[10px]" style={{color:"#9A8A78"}}>Qty: {qty}</p></div>
                    <span className="text-xs font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{(p.price*qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-5 space-y-3">
                {[["Subtotal",`₹${subtotal.toLocaleString("en-IN")}`],["Temple Energization","₹99"],["Shipping","FREE",true],["GST (5%)",`₹${Math.round(subtotal*0.05).toLocaleString("en-IN")}`]].map(([l,v,g])=>(
                  <div key={l as string} className="flex justify-between text-sm"><span style={{color:"#7A6A58"}}>{l as string}</span><span style={{color:g?"#4A8A4A":MAROON,fontFamily:PRICE_FONT,fontWeight:600}}>{v as string}</span></div>
                ))}
                <div className="h-px" style={{background:`linear-gradient(90deg,transparent,rgba(200,160,68,0.3),transparent)`}}/>
                <div className="flex justify-between items-baseline"><span className="text-sm font-semibold" style={{color:MAROON}}>Grand Total</span><span className="text-2xl font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{total.toLocaleString("en-IN")}</span></div>
              </div>
              <div className="px-6 pb-6 space-y-3">
                <button onClick={handlePlace} disabled={placing}
                  className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-70"
                  style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
                  {placing?<><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Processing…</>:<><Lock size={14}/>Place Order · ₹{total.toLocaleString("en-IN")}</>}
                </button>
                <button onClick={onBack} className="w-full py-3 rounded-2xl text-sm font-medium border transition-all hover:bg-amber-50" style={{borderColor:"rgba(91,31,36,0.2)",color:MAROON}}>← Back to Address</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-5 py-4"
        style={{background:"rgba(250,247,242,0.97)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(91,31,36,0.1)"}}>
        <button onClick={handlePlace} disabled={placing} className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
          style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>
          {placing?<><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Processing…</>:<><Lock size={14}/>Place Order · ₹{total.toLocaleString("en-IN")}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Confirmation Page ─────────────────────────────────────────────────────────
const ORDER_NUMBER="ARH-2025-084719";
const TIMELINE_STEPS2=[
  {icon:"✓",label:"Order Confirmed",desc:"Your order has been received.",done:true},
  {icon:"🪔",label:"Temple Preparation",desc:"Products enter Pran Pratishtha ritual.",done:false},
  {icon:"🔍",label:"Quality Inspection",desc:"Every item checked by our team.",done:false},
  {icon:"📦",label:"Premium Packaging",desc:"Wrapped in our signature packaging.",done:false},
  {icon:"🚚",label:"Dispatched",desc:"On its way with real-time tracking.",done:false},
  {icon:"🏠",label:"Delivered",desc:"Arrives at your doorstep.",done:false},
];

function Confetti(){
  const PIECES=Array.from({length:24},(_,i)=>({id:i,x:Math.random()*100,delay:Math.random()*2.5,dur:2.5+Math.random()*2,color:[GOLD,SAFFRON,MAROON,"#D4B896","#E8D5A8"][Math.floor(Math.random()*5)],size:5+Math.random()*6,rotate:Math.random()*360}));
  return(
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <style>{`@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
      {PIECES.map(p=>(
        <div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:"-10px",width:p.size,height:p.size,background:p.color,borderRadius:p.id%3===0?"50%":"2px",opacity:0.7,animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,transform:`rotate(${p.rotate}deg)`}}/>
      ))}
    </div>
  );
}

function ConfirmationPage({ cartItems, onHome }:{cartItems:CartItem[];onHome:()=>void;}){
  const [visible,setVisible]=useState(false);
  const [timelineReached,setTimelineReached]=useState(0);
  useEffect(()=>{
    const t1=setTimeout(()=>setVisible(true),80);
    const timers=TIMELINE_STEPS2.map((_,i)=>setTimeout(()=>setTimelineReached(i+1),600+i*350));
    return()=>{clearTimeout(t1);timers.forEach(clearTimeout);};
  },[]);
  const subtotal=cartItems.reduce((s,i)=>s+i.product.price*i.qty,0);
  const total=subtotal+99+Math.round(subtotal*0.05);
  return(
    <div style={{background:IVORY,minHeight:"100vh",fontFamily:SANS,position:"relative"}}>
      <Confetti/>
      <div className="relative overflow-hidden pt-28 pb-16 px-6 lg:px-10 text-center" style={{background:`linear-gradient(160deg,#FAF0D8,${IVORY},#F0E8D8)`}}>
        <div className="relative max-w-7xl mx-auto">
          <div className="relative mx-auto mb-8 flex items-center justify-center transition-all duration-700"
            style={{width:100,height:100,opacity:visible?1:0,transform:visible?"scale(1)":"scale(0.6)"}}>
            <div className="absolute inset-0 rounded-full" style={{background:`radial-gradient(circle,rgba(200,160,68,0.25),transparent)`,transform:"scale(1.8)"}}/>
            <div className="absolute inset-0 rounded-full" style={{border:`2px solid rgba(200,160,68,0.3)`,transform:"scale(1.35)"}}/>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{background:`linear-gradient(135deg,${GOLD},${SAFFRON})`,boxShadow:`0 12px 48px rgba(200,160,68,0.45)`}}>
              <CheckCircle size={40} color="white" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="transition-all duration-700 delay-200" style={{opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(16px)"}}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-16" style={{background:`linear-gradient(90deg,transparent,${GOLD})`}}/>
              <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{color:GOLD}}>Order Confirmed</span>
              <span className="h-px w-16" style={{background:`linear-gradient(90deg,${GOLD},transparent)`}}/>
            </div>
            <h1 className="mb-4 mx-auto max-w-2xl" style={{fontFamily:SERIF,fontSize:"clamp(1.8rem,5vw,3.2rem)",fontWeight:500,color:MAROON,lineHeight:1.1}}>Your Sacred Order Has Been Confirmed</h1>
            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{color:"#7A6A58"}}>Thank you for placing your trust in Aroham.<br/>Your spiritual journey begins today.</p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 pb-24 space-y-8">
        {/* Order card */}
        <div className="rounded-3xl overflow-hidden" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 4px 40px rgba(91,31,36,0.07)"}}>
          <div className="px-8 py-5 flex flex-wrap items-center justify-between gap-4" style={{background:`linear-gradient(90deg,${MAROON},#7A2A30)`}}>
            <div><p className="text-xs tracking-widest uppercase mb-0.5" style={{color:"rgba(255,255,255,0.55)"}}>Order Number</p><p className="text-lg font-semibold" style={{fontFamily:SERIF,color:GOLD}}>{ORDER_NUMBER}</p></div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{background:"rgba(255,255,255,0.12)",color:IVORY,border:"1px solid rgba(255,255,255,0.2)"}}>
                <Package size={12}/> Track Order
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{background:GOLD,color:"#1A0D0E"}}>
                <Mail size={12}/> Invoice
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{borderColor:"rgba(91,31,36,0.07)"}}>
            {[["Order Date","5 July 2025"],["Est. Delivery","15 July 2025"],["Payment","UPI — GPay"],["Total",`₹${total.toLocaleString("en-IN")}`]].map(([l,v])=>(
              <div key={l} className="px-6 py-5">
                <p className="text-[10px] tracking-widest uppercase font-semibold mb-1" style={{color:"#9A8A78"}}>{l}</p>
                <p className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Items + Timeline */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div>
            <h2 className="mb-5 text-xl font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Items in Your Order</h2>
            <div className="space-y-4">
              {cartItems.map(({product:p,qty})=>(
                <div key={p.id} className="flex gap-5 p-5 rounded-2xl group transition-all hover:shadow-lg"
                  style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.07)"}}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  </div>
                  <div className="flex-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(91,31,36,0.07)",color:MAROON}}>Temple Energized</span>
                    <h3 className="text-sm font-semibold mt-1 mb-0.5" style={{fontFamily:SERIF,color:MAROON}}>{p.name}</h3>
                    <p className="text-xs mb-2" style={{color:"#7A6A58"}}>Qty: {qty}</p>
                    <p className="text-base font-semibold" style={{fontFamily:PRICE_FONT,color:MAROON}}>₹{(p.price*qty).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Timeline */}
          <div className="lg:sticky lg:top-24">
            <h2 className="mb-6 text-xl font-semibold" style={{fontFamily:SERIF,color:MAROON}}>What Happens Next</h2>
            <div className="rounded-3xl p-6" style={{background:"#FFFFFF",border:"1px solid rgba(91,31,36,0.08)",boxShadow:"0 4px 30px rgba(91,31,36,0.06)"}}>
              {TIMELINE_STEPS2.map((step,i)=>{
                const reached=i<timelineReached,active=i===timelineReached-1;
                return(
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-500"
                        style={{background:reached?(active?`linear-gradient(135deg,${GOLD},${SAFFRON})`:"rgba(200,160,68,0.15)"):"rgba(91,31,36,0.06)",
                          border:reached?`2px solid ${GOLD}`:"2px solid rgba(91,31,36,0.1)",
                          boxShadow:active?`0 0 16px rgba(200,160,68,0.45)`:"none",
                          transform:active?"scale(1.1)":"scale(1)",color:reached?(active?"white":GOLD):"#9A8A78"}}>
                        {step.icon}
                      </div>
                      {i<TIMELINE_STEPS2.length-1&&<div className="w-0.5 flex-1 mt-1 mb-1 rounded-full" style={{background:i<timelineReached-1?GOLD:"rgba(91,31,36,0.08)",minHeight:24}}/>}
                    </div>
                    <div className="pb-5 pt-1.5">
                      <p className="text-sm font-semibold mb-0.5" style={{fontFamily:SERIF,color:reached?MAROON:"#9A8A78"}}>
                        {step.label}{active&&<span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(200,160,68,0.15)",color:GOLD}}>Now</span>}
                      </p>
                      <p className="text-xs leading-relaxed" style={{color:reached?"#7A6A58":"#B8A898"}}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 pt-4 flex items-center gap-3" style={{borderTop:"1px solid rgba(200,160,68,0.2)"}}>
                <Truck size={16} style={{color:GOLD}}/><div><p className="text-xs font-semibold" style={{color:MAROON}}>Expected Delivery</p><p className="text-xs" style={{color:"#7A6A58"}}>15 July 2025 · Free Shipping</p></div>
              </div>
            </div>
          </div>
        </div>
        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 hover:shadow-xl" style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}><Package size={15}/> Track My Order</button>
          <button onClick={onHome} className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold border transition-all hover:bg-amber-50" style={{borderColor:"rgba(91,31,36,0.2)",color:MAROON}}><ArrowRight size={15}/> Continue Shopping</button>
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-5 py-4"
        style={{background:"rgba(250,247,242,0.97)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(91,31,36,0.1)"}}>
        <div className="flex gap-3">
          <button className="flex-1 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2" style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}><Package size={14}/> Track Order</button>
          <button onClick={onHome} className="px-5 py-4 rounded-2xl text-sm font-medium border" style={{borderColor:"rgba(91,31,36,0.2)",color:MAROON}}>Shop</button>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Page ─────────────────────────────────────────────────────────────────
type AuthState="signin"|"signup";
const LEFT_PANELS={
  signin:{img:"https://images.unsplash.com/photo-1636714528228-f469eefb3eef?w=900&h=1100&fit=crop&auto=format",headline:"Welcome Back.",sub:"Continue your journey toward harmony, prosperity and positive energy.",items:["Access Orders","Astrology Reports","Consultations","Saved Wishlist","Track Poojas"],itemIcon:"✓",extra:"testimonial"},
  signup:{img:"https://images.unsplash.com/photo-1583182363039-59eac8609ab2?w=900&h=1100&fit=crop&auto=format",headline:"Your Spiritual Journey Begins Here.",sub:"Create your account to unlock India's most trusted ecosystem for Vedic solutions.",items:["Temple Energized Products","Personalized Recommendations","Horoscope Reports","Astrology Consultations","Online Poojas","Spiritual Learning"],itemIcon:"✨",extra:"badges"},
  otp:{img:"https://images.unsplash.com/photo-1575225956023-97090201582a?w=900&h=1100&fit=crop&auto=format",headline:"Securing Your Sacred Journey.",sub:"We're verifying your phone number to ensure every member enjoys a secure experience.",items:["Secure Verification","Encrypted Authentication","Privacy Protected"],itemIcon:"✓",extra:"progress"},
  success:{img:"https://images.unsplash.com/photo-1512917860049-18d416baa831?w=900&h=1100&fit=crop&auto=format",headline:"Welcome to Aroham.",sub:"You've taken the first step toward a harmonious and spiritually enriched life.",items:["Explore Products","Discover Remedies","Book Consultation","Receive Personalized Guidance","Positive Transformation"],itemIcon:"→",extra:"quote"},
};
const TRUST_ITEMS2=[{icon:Flame,label:"Temple Energized"},{icon:CheckCircle,label:"50,000+ Customers"},{icon:Star,label:"Astrologer Recommended"},{icon:Shield,label:"Secure & Encrypted"},{icon:Package,label:"Premium Packaging"},{icon:Award,label:"Trusted Across India"}];

function AuthPage({onClose}:{onClose:(loggedIn?:boolean)=>void;}){
  const [authState,setAuthState]=useState<AuthState>("signin");
  const [tab,setTab]=useState<"signin"|"signup">("signin");
  const [phone,setPhone]=useState("");
  const [password,setPassword]=useState("");
  const [confirmPass,setConfirmPass]=useState("");
  const [name,setName]=useState("");
  const [agreed,setAgreed]=useState(false);
  const [otp,setOtp]=useState<string[]>(Array(6).fill(""));
  const [canResend,setCanResend]=useState(false);
  const [newPass,setNewPass]=useState("");
  const [forgotPhone,setForgotPhone]=useState("");
  const [panelVisible,setPanelVisible]=useState(true);
  const panelKey=authState==="signup"?"signup":"signin";
  const panel=LEFT_PANELS[panelKey];
  const switchTab=(t:"signin"|"signup")=>{setTab(t);setAuthState(t);setOtp(Array(6).fill(""));};
  const goTo=(s:AuthState)=>{setPanelVisible(false);setTimeout(()=>{setAuthState(s);setPanelVisible(true);},220);};
  const formStyle={opacity:panelVisible?1:0,transform:panelVisible?"translateY(0)":"translateY(12px)",transition:"opacity 0.25s ease,transform 0.25s ease"};
  const showTabs=authState==="signin"||authState==="signup";
  const otpPhone=phone?`+91 ${phone}`:"+91 98765 43210";
  const fgtPhone=forgotPhone?`+91 ${forgotPhone}`:"+91 98765 43210";

  const signinJsx=(
    <div style={formStyle} className="space-y-5">
      <div><h2 className="mb-1" style={{fontFamily:SERIF,fontSize:"1.75rem",fontWeight:500,color:MAROON}}>Welcome Back</h2><p className="text-sm" style={{color:"#7A6A58"}}>Continue your journey toward harmony and positive energy.</p></div>
      <div className="space-y-3"><AuthInput label="Email Address" type="email" value={phone} onChange={setPhone}/><PasswordInput label="Password" value={password} onChange={setPassword}/></div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{color:"#5A4A3A"}}><div className="w-4 h-4 rounded flex-shrink-0 border" style={{borderColor:"rgba(91,31,36,0.25)"}}/>Remember me</label>
        <button className="text-xs font-semibold hover:opacity-70" style={{color:MAROON}}>Forgot Password?</button>
      </div>
      <button onClick={async () => {
        try {
          const { error } = await supabase.auth.signInWithPassword({ email: phone, password });
          if (error) alert(error.message);
          else onClose(true);
        } catch(e:any) { alert(e.message); }
      }} className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg" style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY}}>Sign In</button>
      <div className="flex items-center gap-3"><div className="flex-1 h-px" style={{background:"rgba(91,31,36,0.1)"}}/><span className="text-xs" style={{color:"#9A8A78"}}>OR</span><div className="flex-1 h-px" style={{background:"rgba(91,31,36,0.1)"}}/></div>
      <button onClick={signInWithGoogle} className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-3 border hover:bg-gray-50" style={{borderColor:"rgba(91,31,36,0.14)",color:"#3A3A3A"}}>
        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </button>
      <p className="text-center text-sm" style={{color:"#7A6A58"}}>Don't have an account? <button onClick={()=>switchTab("signup")} className="font-semibold hover:opacity-70" style={{color:MAROON}}>Create Account</button></p>
    </div>
  );
  const signupJsx=(
    <div style={formStyle} className="space-y-5">
      <div><h2 className="mb-1" style={{fontFamily:SERIF,fontSize:"1.75rem",fontWeight:500,color:MAROON}}>Begin Your Spiritual Journey</h2><p className="text-sm" style={{color:"#7A6A58"}}>Create your secure Aroham account.</p></div>
      <div className="space-y-3"><AuthInput label="Full Name" value={name} onChange={setName}/><AuthInput label="Email Address" type="email" value={phone} onChange={setPhone}/><PasswordInput label="Password" value={password} onChange={setPassword}/><PasswordInput label="Confirm Password" value={confirmPass} onChange={setConfirmPass}/></div>
      <button onClick={()=>setAgreed(a=>!a)} className="flex items-start gap-3 text-sm text-left w-full" style={{color:"#5A4A3A"}}>
        <div className="w-5 h-5 mt-0.5 rounded-md flex-shrink-0 flex items-center justify-center transition-all" style={{border:`2px solid ${agreed?MAROON:"rgba(91,31,36,0.22)"}`,background:agreed?MAROON:"transparent"}}>
          {agreed&&<CheckCircle size={11} color="white" strokeWidth={3}/>}
        </div>
        I agree to the <span className="font-semibold" style={{color:MAROON}}>Terms</span> and <span className="font-semibold" style={{color:MAROON}}>Privacy Policy</span>
      </button>
      <button onClick={async ()=>{
        if(agreed&&name&&phone) {
          try {
            const { error } = await supabase.auth.signUp({ email: phone, password, options: { data: { full_name: name } } });
            if (error) alert(error.message);
            else { alert("Sign up successful! You can now log in."); switchTab("signin"); }
          } catch(e:any) { alert(e.message); }
        }
      }} className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all hover:opacity-90 hover:shadow-lg"
        style={{background:`linear-gradient(135deg,${MAROON},#7A2A30)`,color:IVORY,opacity:agreed?1:0.55}}>Create Account</button>
      <p className="text-center text-sm" style={{color:"#7A6A58"}}>Already have an account? <button onClick={()=>switchTab("signin")} className="font-semibold hover:opacity-70" style={{color:MAROON}}>Sign In</button></p>
    </div>
  );
  const rightContent=authState==="signin"?signinJsx:signupJsx;

  return(
    <div className="fixed inset-0 flex flex-col" style={{background:IVORY,fontFamily:SANS,zIndex: 100}}>
      <div className="flex-shrink-0 flex items-center justify-between px-6 lg:px-10 h-16 border-b" style={{borderColor:"rgba(91,31,36,0.08)",background:"rgba(250,247,242,0.97)",backdropFilter:"blur(12px)"}}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:`linear-gradient(135deg,${MAROON},${SAFFRON})`}}><span className="text-[10px] font-bold" style={{color:IVORY,fontFamily:SERIF}}>ॐ</span></div>
          <span className="text-lg font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Aroham</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs hidden sm:block" style={{color:"#7A6A58"}}>Need help?</span>
          <a href="#" className="text-xs font-semibold hover:opacity-70" style={{color:MAROON}}>Contact Support</a>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5" style={{color:"#7A6A58"}}><X size={18}/></button>
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="lg:w-[45%] flex-shrink-0">
          <div className="hidden lg:flex flex-col justify-between h-full px-10 py-10 relative overflow-hidden"
            style={{background:`linear-gradient(160deg,#1A0D0E,${MAROON},#3A1520)`,opacity:panelVisible?1:0,transform:panelVisible?"translateX(0)":"translateX(-16px)",transition:"opacity 0.25s ease,transform 0.25s ease"}}>
            <img src={panel.img} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" style={{opacity:0.1,mixBlendMode:"luminosity"}}/>
            <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:`radial-gradient(circle,${GOLD} 1px,transparent 1px)`,backgroundSize:"28px 28px"}}/>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-auto">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:`linear-gradient(135deg,${GOLD},${SAFFRON})`}}><span className="text-xs font-bold" style={{color:"#1A0D0E",fontFamily:SERIF}}>ॐ</span></div>
                <span className="text-lg font-semibold" style={{fontFamily:SERIF,color:IVORY}}>Aroham</span>
              </div>
              <div className="py-10 flex-1 flex flex-col justify-center">
                <div className="h-px w-10 mb-6" style={{background:GOLD}}/>
                <h2 className="mb-3 leading-tight" style={{fontFamily:SERIF,fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:500,color:IVORY}}>{panel.headline}</h2>
                <p className="text-sm leading-relaxed mb-8" style={{color:"rgba(250,247,242,0.6)",maxWidth:340}}>{panel.sub}</p>
                <div className="space-y-2.5 mb-8">{panel.items.map(item=><div key={item} className="flex items-center gap-3"><span className="text-sm" style={{color:GOLD}}>{panel.itemIcon}</span><span className="text-sm" style={{color:"rgba(250,247,242,0.82)"}}>{item}</span></div>)}</div>
                {panel.extra==="testimonial"&&(
                  <div className="p-5 rounded-2xl" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                    <div className="flex mb-2">{Array.from({length:5}).map((_,i)=><Star key={i} size={12} fill={GOLD} stroke={GOLD}/>)}</div>
                    <p className="text-xs leading-relaxed mb-3 italic" style={{color:"rgba(250,247,242,0.75)"}}>"Aroham has become my trusted destination for authentic Vedic guidance."</p>
                    <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:`linear-gradient(135deg,${GOLD},${SAFFRON})`,color:"#1A0D0E"}}>P</div><div><div className="text-xs font-semibold" style={{color:IVORY}}>Priya Mehta</div><div className="text-[10px]" style={{color:"rgba(250,247,242,0.45)"}}>Mumbai</div></div></div>
                  </div>
                )}
                {panel.extra==="badges"&&<div className="flex flex-wrap gap-2">{["Temple Energized","Expert Recommended","Premium Craftsmanship"].map(b=><div key={b} className="px-3 py-1.5 rounded-full text-[10px] font-semibold" style={{background:"rgba(200,160,68,0.15)",color:GOLD,border:"1px solid rgba(200,160,68,0.3)"}}>{b}</div>)}</div>}
                {panel.extra==="progress"&&<div className="relative"><div className="w-16 h-16 mx-auto"><svg viewBox="0 0 64 64" className="w-full h-full" style={{animation:"spin 3s linear infinite"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><circle cx="32" cy="32" r="28" fill="none" stroke="rgba(200,160,68,0.15)" strokeWidth="3"/><circle cx="32" cy="32" r="28" fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="90 86" strokeLinecap="round"/></svg><div className="absolute inset-0 flex items-center justify-center"><Shield size={20} style={{color:GOLD}}/></div></div></div>}
                {panel.extra==="quote"&&<div className="p-5 rounded-2xl" style={{background:"rgba(200,160,68,0.1)",border:"1px solid rgba(200,160,68,0.2)"}}><div className="text-2xl mb-3" style={{color:GOLD,fontFamily:SERIF}}>"</div><p className="text-sm leading-relaxed italic" style={{color:"rgba(250,247,242,0.8)"}}>Every journey begins with the right intention. We're honoured to be a part of yours.</p><div className="mt-3 text-xs font-semibold" style={{color:GOLD}}>— Aroham Team</div></div>}
              </div>
              <div className="grid grid-cols-3 gap-2">{TRUST_ITEMS2.slice(0,3).map(({icon:Icon,label})=><div key={label} className="flex flex-col items-center gap-1.5 text-center"><Icon size={14} style={{color:"rgba(200,160,68,0.6)"}} strokeWidth={1.5}/><span className="text-[9px] leading-tight" style={{color:"rgba(250,247,242,0.4)"}}>{label}</span></div>)}</div>
            </div>
          </div>
          <div className="lg:hidden px-6 py-5" style={{background:`linear-gradient(135deg,${MAROON},#3A1520)`}}>
            <h3 className="text-sm font-semibold mb-1" style={{fontFamily:SERIF,color:GOLD}}>{panel.headline}</h3>
            <p className="text-xs" style={{color:"rgba(250,247,242,0.6)"}}>{panel.sub}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" style={{background:IVORY}}>
          <div className="min-h-full flex flex-col justify-center items-center px-6 py-10">
            <div className="w-full max-w-[460px]">
              <div className="rounded-3xl p-8 lg:p-10" style={{background:"#FFFFFF",boxShadow:"0 8px 60px rgba(91,31,36,0.1)",border:"1px solid rgba(91,31,36,0.07)"}}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background:`linear-gradient(135deg,${MAROON},${SAFFRON})`}}><span style={{fontSize:"9px",color:IVORY,fontFamily:SERIF}}>ॐ</span></div>
                  <span className="text-sm font-semibold" style={{fontFamily:SERIF,color:MAROON}}>Aroham</span>
                </div>
                {showTabs&&(
                  <div className="flex p-1 rounded-2xl mb-7 relative" style={{background:"rgba(91,31,36,0.06)"}}>
                    <div className="absolute top-1 bottom-1 rounded-xl transition-all duration-300" style={{left:tab==="signin"?"4px":"calc(50% + 2px)",width:"calc(50% - 6px)",background:MAROON}}/>
                    {(["signin","signup"] as const).map(t=>(
                      <button key={t} onClick={()=>switchTab(t)} className="flex-1 py-2.5 text-sm font-semibold relative z-10 rounded-xl transition-colors duration-300"
                        style={{color:tab===t?IVORY:MAROON}}>{t==="signin"?"Sign In":"Create Account"}</button>
                    ))}
                  </div>
                )}
                {rightContent}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {TRUST_ITEMS2.slice(0,4).map(({icon:Icon,label})=>(
                  <div key={label} className="flex items-center gap-1.5 text-[10px]" style={{color:"#9A8A78"}}><Icon size={11} style={{color:GOLD}} strokeWidth={1.5}/> {label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 border-t overflow-x-auto" style={{background:"#FFFFFF",borderColor:"rgba(91,31,36,0.07)"}}>
        <div className="flex items-center gap-8 px-8 py-3 min-w-max mx-auto">
          {TRUST_ITEMS2.map(({icon:Icon,label})=>(
            <div key={label} className="flex items-center gap-2 flex-shrink-0"><Icon size={13} style={{color:GOLD}} strokeWidth={1.5}/><span className="text-[10px] font-medium whitespace-nowrap" style={{color:"#7A6A58"}}>{label}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Consult Page ─────────────────────────────────────────────────────────────
function ConsultPage({ onBack }:{ onBack:()=>void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16"
      style={{background:`linear-gradient(170deg,#0D0508 0%,#1A0D10 60%,#0D0508 100%)`}}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background:"radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,160,68,0.07) 0%, transparent 70%)"
      }}/>
      <div className="relative text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{background:"rgba(200,160,68,0.1)",border:"1px solid rgba(200,160,68,0.25)"}}>
          <span style={{fontSize:28}}>🪬</span>
        </div>
        <p className="text-xs tracking-widest uppercase mb-4" style={{color:GOLD,fontFamily:SANS,letterSpacing:"0.2em"}}>Coming Soon</p>
        <h1 style={{fontFamily:SERIF,fontSize:"clamp(2rem,5vw,3rem)",fontWeight:700,color:IVORY,lineHeight:1.15,marginBottom:20}}>
          Expert Guidance,<br/>
          <em style={{color:GOLD}}>On Its Way.</em>
        </h1>
        <p className="text-base leading-relaxed mb-10" style={{color:"rgba(250,247,242,0.5)",fontFamily:SANS,maxWidth:380,margin:"0 auto 40px"}}>
          We are working on bringing the best Vedic consultancy service to you — personalized astrology readings, Vastu analysis, and sacred remedies from India's most trusted experts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onBack}
            className="px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{background:GOLD,color:"#1A0D0E"}}>Back to Home</button>
          <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
            style={{background:"rgba(200,160,68,0.1)",border:"1px solid rgba(200,160,68,0.3)",color:GOLD}}>
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage({ email, onBack, onLogout }:{ email:string; onBack:()=>void; onLogout:()=>void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const res = await fetch("http://localhost:5001/api/orders", {
            headers: { Authorization: "Bearer " + session.access_token }
          });
          if (res.ok) setOrders(await res.json());
        }
      } catch (e) {
        console.error("Failed to load orders", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 px-6" style={{background:IVORY}}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-8 text-sm font-medium hover:opacity-70 transition-opacity" style={{color:MAROON}}>
          <ChevronLeft size={16}/> Back
        </button>
        <div className="rounded-3xl p-8 mb-6 text-center"
          style={{background:`linear-gradient(160deg,${MAROON} 0%,#3A1015 100%)`,boxShadow:"0 20px 50px rgba(91,31,36,0.2)"}}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{background:"rgba(200,160,68,0.15)",border:"2px solid rgba(200,160,68,0.3)"}}>
            <User size={32} style={{color:GOLD}}/>
          </div>
          <h2 style={{fontFamily:SERIF,fontSize:"1.5rem",fontWeight:700,color:IVORY,marginBottom:4}}>Devotee</h2>
          <p style={{color:"rgba(250,247,242,0.5)",fontSize:13,fontFamily:SANS}}>Member since 2025</p>
        </div>
        <div className="rounded-2xl overflow-hidden mb-8" style={{border:"1px solid rgba(91,31,36,0.1)"}}>
          <div className="flex items-center justify-between px-5 py-4" style={{background:"#fff"}}>
            <span className="text-sm" style={{color:"#9A8A78",fontFamily:SANS}}>Email</span>
            <span className="text-sm font-medium" style={{color:MAROON,fontFamily:SANS}}>{email || "Not provided"}</span>
          </div>
        </div>
        
        {/* Orders Section */}
        <h3 className="text-xl font-bold mb-4" style={{fontFamily:SERIF,color:MAROON}}>My Orders</h3>
        {loading ? (
          <p className="text-sm" style={{color:"#9A8A78"}}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="p-6 rounded-2xl text-center" style={{background:"rgba(91,31,36,0.03)",border:"1px dashed rgba(91,31,36,0.2)"}}>
            <p className="text-sm" style={{color:"#9A8A78"}}>No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {orders.map(o => {
              const payment = (o.payments || [])[0];
              const payStatus = payment?.status || "UNKNOWN";
              const itemsStr = (o.order_items || []).map((i:any) => `${i.product_name || "Item"} ×${i.qty}`).join(", ");
              const date = new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              const amount = (o.amount || 0) / 100;
              
              return (
                <div key={o.id} className="p-5 rounded-2xl" style={{background:"#fff",border:"1px solid rgba(91,31,36,0.1)",boxShadow:"0 4px 15px rgba(0,0,0,0.02)"}}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs uppercase font-bold tracking-wider mb-1" style={{color:"#9A8A78"}}>Order #{o.id.slice(0,8)}</div>
                      <div className="text-sm font-medium" style={{color:MAROON}}>{date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{fontFamily:SERIF,color:MAROON}}>₹{amount.toLocaleString("en-IN")}</div>
                      <div className="text-xs font-semibold mt-1 px-2 py-0.5 inline-block rounded-full" 
                        style={{background: payStatus === "PAID" || payStatus === "SUCCESS" ? "#e6f4e6" : "#fdf1dc", color: payStatus === "PAID" || payStatus === "SUCCESS" ? "#1a7a1d" : "#a06400"}}>
                        {payStatus}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm mb-3" style={{color:"#111827"}}>{itemsStr}</div>
                  
                  {o.awb_code ? (
                    <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{borderColor:"rgba(91,31,36,0.1)"}}>
                      <div>
                        <span className="text-xs block" style={{color:"#9A8A78"}}>Tracking Number</span>
                        <span className="text-sm font-mono font-medium" style={{color:MAROON}}>{o.awb_code}</span>
                      </div>
                      {o.label_url && (
                        <a href={o.label_url} target="_blank" rel="noreferrer" className="text-xs font-semibold underline" style={{color:GOLD}}>Download Label</a>
                      )}
                    </div>
                  ) : (
                    o.status !== "CANCELLED" && (
                      <div className="mt-3 pt-3 border-t text-xs font-medium" style={{borderColor:"rgba(91,31,36,0.1)",color:"#9A8A78"}}>
                        Shipping label pending generation
                      </div>
                    )
                  )}
                </div>
              )
            })}
          </div>
        )}

        <button onClick={onLogout}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 mt-4"
          style={{background:"rgba(91,31,36,0.07)",color:MAROON,border:"1px solid rgba(91,31,36,0.12)"}}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
type AppPage = "home" | "shop" | "product" | "shipping" | "payment" | "confirmation" | "consult" | "profile";

export default function App() {
  const [page, setPage] = useState<AppPage>("home");
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ArohamProduct | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  useEffect(() => {
    async function loadDbProducts() {
      try {
        const res = await fetch("http://localhost:5001/api/products");
        if (res.ok) {
          const dbProducts = await res.json();
          dbProducts.forEach((dbP: any) => {
            const frontendP = AROHAM_PRODUCTS.find(p => p.id === dbP.id);
            if (frontendP) {
              frontendP.price = dbP.price / 100; // paise to INR
              frontendP.stock = dbP.stock;
            }
          });
          setProductsLoaded(true);
        }
      } catch (e) {
        console.error("Failed to load DB products", e);
      }
    }
    loadDbProducts();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user?.email || "");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user?.email || "");
    });

    return () => subscription.unsubscribe();
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product: ArohamProduct, qty: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
    setShowCart(true);
  };

  const removeFromCart = (id: number) => setCartItems(prev => prev.filter(i => i.product.id !== id));
  const updateQty = (id: number, delta: number) => setCartItems(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const goToProduct = (p: ArohamProduct) => { setSelectedProduct(p); setPage("product"); };
  const goToShop = () => setPage("shop");
  const goToHome = () => setPage("home");

  const isCheckout = page === "shipping" || page === "payment" || page === "confirmation";
  const isNonHome = page !== "home";

  const renderPage = () => {
    switch (page) {
      case "home":
        return (
          <main>
            <NavagrahaHero onShop={goToShop} onConsult={() => {}} />
            <ShopConsultCards onShop={goToShop} onProductClick={goToProduct} />
            <HowItsMade />
            <ProductsAndCombos
              onProductClick={goToProduct}
              onAddToCart={(p) => addToCart(p)}
              onAddCombo={(name) => { const combo = COMBOS.find(c => c.name === name); if (combo) { addToCart({ ...AROHAM_PRODUCTS[0], id: combo.id, name: combo.name, price: combo.price, original: combo.original }, 1); } }}
            />
            <WhyAroham />
            <VideoTestimonials />
            <CommunityComments />
            <Newsletter />
          </main>
        );
      case "shop":
        return <ShopPage onProductClick={goToProduct} onBack={goToHome} />;
      case "product":
        return selectedProduct ? (
          <ProductDetailPage product={selectedProduct} onBack={() => setPage("shop")} onAddToCart={addToCart} />
        ) : null;
      case "shipping":
        return <ShippingPage cartItems={cartItems} onBack={() => setShowCart(true)} onNext={() => setPage("payment")} />;
      case "payment":
        return <PaymentPage cartItems={cartItems} onBack={() => setPage("shipping")} onNext={() => setPage("confirmation")} />;
      case "confirmation":
        return <ConfirmationPage cartItems={cartItems} onHome={goToHome} />;
      case "consult":
        return <ConsultPage onBack={goToHome} />;
      case "profile":
        return <ProfilePage email={userEmail} onBack={goToHome} onLogout={()=>{ supabase.auth.signOut(); setPage("home"); }} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: SANS, overflowX: "hidden" }}>
      {showAuth && <AuthPage onClose={(loggedIn?:boolean) => { setShowAuth(false); if(loggedIn) setIsLoggedIn(true); }} />}
      {showCart && (
        <CartSidebar
          items={cartItems}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onQty={updateQty}
          onCheckout={() => { setShowCart(false); setPage("shipping"); }}
          onHome={() => setPage("home")}
        />
      )}
      {!isCheckout && (
        <Nav
          onCartClick={() => setShowCart(true)}
          onLogoClick={goToHome}
          onSignIn={() => setShowAuth(true)}
          onShopClick={goToShop}
          onConsultClick={() => setPage("consult")}
          onProfileClick={() => setPage("profile")}
          isLoggedIn={isLoggedIn}
          cartCount={cartCount}
          isCartPage={isNonHome}
        />
      )}
      {renderPage()}
      {!isCheckout && <Footer />}
      <WhatsAppButton />
    </div>
  );
}
