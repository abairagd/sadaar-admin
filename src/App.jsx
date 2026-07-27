import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Store, Wallet, LogOut, Check, X, Loader2, Tag, Plus } from "lucide-react";

const API_BASE = "https://sadaar-backend-production.up.railway.app/api";

const C = {
  ink: "#16261C", sand: "#F3ECDD", warm: "#FBF8F1", bronze: "#B08D57",
  char: "#22201B", line: "#DCD2BB", muted: "#7A7566", danger: "#A3402F",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
body { overflow-x: hidden; }
@media (max-width: 680px) {
  .sadaar-sidebar { width: 100% !important; min-height: auto !important; flex-direction: row !important; align-items: center !important; padding: 12px 16px !important; flex-wrap: wrap !important; gap: 10px !important; }
  .sadaar-sidebar-sub { display: none !important; }
  .sadaar-sidebar-nav { flex-direction: row !important; gap: 4px !important; overflow-x: auto !important; }
  .sadaar-logout-btn { margin-top: 0 !important; margin-left: auto !important; }
  .sadaar-main { padding: 20px 16px !important; }
  .sadaar-app-layout { flex-direction: column !important; }
  .sadaar-scroll-table { overflow-x: auto !important; }
  .sadaar-scroll-table > div { min-width: 560px !important; }
}
`;

async function api(path, options = {}, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function money(n) {
  return `SAR ${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

const inputStyle = { border: `1px solid ${C.line}`, padding: "11px 13px", fontFamily: "Inter, sans-serif", fontSize: 14, background: C.warm, color: C.char };
const h1 = { fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 24, color: C.ink, margin: 0 };
const h2 = { fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 17, color: C.ink, marginTop: 32, marginBottom: 12 };

const statusTone = {
  pending: { bg: "#F3E6D8", fg: "#8A5A1E" },
  active: { bg: "#DDE7DB", fg: "#2F5B3C" },
  suspended: { bg: "#F0DAD5", fg: C.danger },
};

function Badge({ status }) {
  const tone = statusTone[status] || statusTone.pending;
  return <span style={{ background: tone.bg, color: tone.fg, fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 3 }}>{status}</span>;
}

function Loading() {
  return <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, display: "flex", alignItems: "center", gap: 8 }}><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></p>;
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!password) return setError("Enter the admin password.");
    setLoading(true);
    try {
      const result = await api("/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      onLogin(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{FONTS}</style>
      <div style={{ width: 360, background: C.warm, border: `1px solid ${C.line}`, padding: 32 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 4 }}>SADAAR</div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, marginBottom: 24 }}>Admin</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" style={inputStyle} />
          {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 12, margin: 0 }}>{error}</p>}
          <button onClick={submit} disabled={loading} style={{ background: C.ink, color: C.warm, border: "none", padding: "12px 0", fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.muted, marginTop: 18 }}>
          This is the single shared admin password set as <code>ADMIN_PASSWORD</code> on the backend.
        </p>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, onLogout }) {
  const items = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "brands", label: "Brands", icon: Store },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "discounts", label: "Discounts", icon: Tag },
  ];
  return (
    <div className="sadaar-sidebar" style={{ width: 220, flexShrink: 0, background: C.ink, color: C.sand, minHeight: "100vh", padding: "24px 18px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, marginBottom: 2 }}>SADAAR</div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9CA394", marginBottom: 28 }} className="sadaar-sidebar-sub">Admin</p>
      <div className="sadaar-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 10, background: view === id ? "#22331F" : "none", border: "none", cursor: "pointer", color: view === id ? C.sand : "#B7BCA9", fontFamily: "Inter, sans-serif", fontSize: 14, padding: "10px 10px", textAlign: "left" }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <button onClick={onLogout} className="sadaar-logout-btn" style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "#B7BCA9", fontFamily: "Inter, sans-serif", fontSize: 13, padding: "10px 10px" }}>
        <LogOut size={15} /> Log out
      </button>
    </div>
  );
}

function Overview({ stats, loading }) {
  if (loading) return <div><h1 style={h1}>Overview</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;
  if (!stats) return null;

  const cards = [
    { label: "GMV (all time)", value: money(stats.gmv) },
    { label: "SADAAR commission revenue", value: money(stats.commissionRevenue) },
    { label: "Total orders", value: stats.orderCount },
    { label: "Active brands", value: stats.brands.active },
    { label: "Pending applications", value: stats.brands.pending },
    { label: "Suspended brands", value: stats.brands.suspended },
  ];

  return (
    <div>
      <h1 style={h1}>Overview</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 18 }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: 0 }}>{c.label}</p>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: C.ink, margin: "6px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      <h2 style={h2}>Top brands by revenue</h2>
      {stats.topBrands.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>No sales yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.line}` }}>
            <span>Brand</span><span>Items sold</span><span>Revenue</span>
          </div>
          {stats.topBrands.map((b) => (
            <div key={b.name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px", fontFamily: "Inter, sans-serif", fontSize: 13, borderBottom: `1px solid ${C.line}` }}>
              <span>{b.name}</span><span>{b.items_sold}</span><span>{money(b.revenue)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Brands({ brands, loading, token, onUpdated }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [commissionDrafts, setCommissionDrafts] = useState({});
  const [savingCommission, setSavingCommission] = useState(null);

  const setStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await api(`/admin/brands/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const saveCommission = async (id) => {
    const value = commissionDrafts[id];
    if (value === undefined || value === "") return;
    setSavingCommission(id);
    setError("");
    try {
      await api(`/admin/brands/${id}/commission`, { method: "PATCH", body: JSON.stringify({ commissionRate: Number(value) }) }, token);
      setCommissionDrafts((prev) => { const next = { ...prev }; delete next[id]; return next; });
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCommission(null);
    }
  };

  if (loading) return <div><h1 style={h1}>Brands</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;

  const pending = brands.filter((b) => b.status === "pending");
  const others = brands.filter((b) => b.status !== "pending");

  return (
    <div>
      <h1 style={h1}>Brands</h1>
      {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 13, marginTop: 10 }}>{error}</p>}

      <h2 style={h2}>Pending applications ({pending.length})</h2>
      {pending.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>Nothing waiting for review.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.map((b) => (
            <div key={b.id} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <p style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: C.ink, margin: 0 }}>{b.name}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{b.category} · {b.contact_email} · {b.description}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStatus(b.id, "active")} disabled={busyId === b.id} style={{ display: "flex", alignItems: "center", gap: 6, background: C.ink, color: C.warm, border: "none", padding: "8px 14px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}><Check size={14} /> Approve</button>
                <button onClick={() => setStatus(b.id, "suspended")} disabled={busyId === b.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${C.line}`, padding: "8px 14px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer", color: C.char }}><X size={14} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={h2}>All brands</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {others.map((b) => (
          <div key={b.id} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: C.ink, margin: 0 }}>{b.name}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{b.category} · {b.contact_email}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder={`${b.commission_rate}%`}
                  value={commissionDrafts[b.id] ?? ""}
                  onChange={(e) => setCommissionDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  style={{ ...inputStyle, width: 64, padding: "6px 8px" }}
                />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted }}>%</span>
                {commissionDrafts[b.id] !== undefined && commissionDrafts[b.id] !== "" && Number(commissionDrafts[b.id]) !== Number(b.commission_rate) && (
                  <button onClick={() => saveCommission(b.id)} disabled={savingCommission === b.id} style={{ background: C.ink, color: C.warm, border: "none", padding: "6px 10px", fontFamily: "Inter, sans-serif", fontSize: 12, cursor: "pointer" }}>
                    {savingCommission === b.id ? "..." : "Save"}
                  </button>
                )}
              </div>
              <Badge status={b.status} />
              {b.status === "active" ? (
                <button onClick={() => setStatus(b.id, "suspended")} disabled={busyId === b.id} style={{ background: "none", border: `1px solid ${C.line}`, padding: "6px 12px", fontFamily: "Inter, sans-serif", fontSize: 12, cursor: "pointer", color: C.char }}>Suspend</button>
              ) : (
                <button onClick={() => setStatus(b.id, "active")} disabled={busyId === b.id} style={{ background: "none", border: `1px solid ${C.line}`, padding: "6px 12px", fontFamily: "Inter, sans-serif", fontSize: 12, cursor: "pointer", color: C.char }}>Reactivate</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Payouts({ payouts, loading, token, onUpdated }) {
  const [busyId, setBusyId] = useState(null);
  const [refDrafts, setRefDrafts] = useState({});
  const [error, setError] = useState("");

  const markPaid = async (brandId) => {
    setBusyId(brandId);
    setError("");
    try {
      const result = await api(`/admin/payouts/${brandId}/mark-paid`, { method: "POST", body: JSON.stringify({ reference: refDrafts[brandId] || "" }) }, token);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div><h1 style={h1}>Payouts</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;

  return (
    <div>
      <h1 style={h1}>Payouts due</h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, marginTop: 6 }}>
        Based on shipped/delivered items not yet marked paid. Send the bank transfer yourself, then mark it here.
      </p>
      {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 13, marginTop: 10 }}>{error}</p>}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {payouts.length === 0 ? (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>Nothing pending — every shipped item has been paid out.</p>
        ) : (
          payouts.map((p) => (
            <div key={p.brand_id} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <p style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: C.ink, margin: 0 }}>{p.brand_name}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{p.item_count} item(s) · {money(p.amount_due)} due</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Transfer reference"
                  value={refDrafts[p.brand_id] || ""}
                  onChange={(e) => setRefDrafts((prev) => ({ ...prev, [p.brand_id]: e.target.value }))}
                  style={inputStyle}
                />
                <button onClick={() => markPaid(p.brand_id)} disabled={busyId === p.brand_id} style={{ display: "flex", alignItems: "center", gap: 6, background: C.ink, color: C.warm, border: "none", padding: "8px 14px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>
                  <Check size={14} /> {busyId === p.brand_id ? "Saving..." : "Mark paid"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Discounts({ codes, loading, token, onUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const createCode = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api("/discounts", {
        method: "POST",
        body: JSON.stringify({
          code, type, value: Number(value),
          minSubtotal: minSubtotal ? Number(minSubtotal) : 0,
          maxUses: maxUses ? Number(maxUses) : null,
        }),
      }, token);
      setCode(""); setValue(""); setMinSubtotal(""); setMaxUses(""); setShowForm(false);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    setBusyId(c.id);
    try {
      await api(`/discounts/${c.id}/status`, { method: "PATCH", body: JSON.stringify({ active: !c.active }) }, token);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div><h1 style={h1}>Discounts</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={h1}>Discount codes</h1>
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.ink, color: C.warm, border: "none", padding: "9px 16px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "New code"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCode} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 20, marginTop: 16, display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE (e.g. WELCOME10)" style={inputStyle} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off (SAR)</option>
          </select>
          <input required value={value} onChange={(e) => setValue(e.target.value)} type="number" placeholder={type === "percent" ? "e.g. 10 (for 10%)" : "e.g. 50 (for SAR 50)"} style={inputStyle} />
          <input value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} type="number" placeholder="Minimum subtotal to qualify (optional)" style={inputStyle} />
          <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} type="number" placeholder="Max total uses (optional, blank = unlimited)" style={inputStyle} />
          {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 12, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={saving} style={{ background: C.ink, color: C.warm, border: "none", padding: "11px 0", fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Create code"}
          </button>
        </form>
      )}

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {codes.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>No discount codes yet.</p>}
        {codes.map((c) => (
          <div key={c.id} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: C.ink, margin: 0 }}>{c.code}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: "4px 0 0" }}>
                {c.type === "percent" ? `${c.value}% off` : `${money(c.value)} off`}
                {Number(c.min_subtotal) > 0 && ` · min ${money(c.min_subtotal)}`}
                {c.max_uses !== null && ` · ${c.uses_count}/${c.max_uses} used`}
                {c.max_uses === null && ` · ${c.uses_count} used`}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 3, background: c.active ? "#DDE7DB" : "#F0DAD5", color: c.active ? "#2F5B3C" : C.danger }}>
                {c.active ? "Active" : "Inactive"}
              </span>
              <button onClick={() => toggleActive(c)} disabled={busyId === c.id} style={{ background: "none", border: `1px solid ${C.line}`, padding: "6px 12px", fontFamily: "Inter, sans-serif", fontSize: 12, cursor: "pointer", color: C.char }}>
                {c.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState("overview");
  const [stats, setStats] = useState(null);
  const [brands, setBrands] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (tok) => {
    setLoading(true);
    try {
      const [statsRes, brandsRes, payoutsRes, discountsRes] = await Promise.all([
        api("/admin/stats", {}, tok),
        api("/admin/brands", {}, tok),
        api("/admin/payouts", {}, tok),
        api("/discounts", {}, tok),
      ]);
      setStats(statsRes);
      setBrands(brandsRes);
      setPayouts(payoutsRes);
      setDiscountCodes(discountsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (tok) => {
    setToken(tok);
    loadData(tok);
  };

  const refresh = () => { if (token) loadData(token); };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="sadaar-app-layout" style={{ display: "flex", background: C.sand, minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <Sidebar view={view} setView={setView} onLogout={() => setToken(null)} />
      <main className="sadaar-main" style={{ flex: 1, padding: "32px 40px", maxWidth: 900 }}>
        {view === "overview" && <Overview stats={stats} loading={loading} />}
        {view === "brands" && <Brands brands={brands} loading={loading} token={token} onUpdated={refresh} />}
        {view === "payouts" && <Payouts payouts={payouts} loading={loading} token={token} onUpdated={refresh} />}
        {view === "discounts" && <Discounts codes={discountCodes} loading={loading} token={token} onUpdated={refresh} />}
      </main>
    </div>
  );
}
