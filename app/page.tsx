"use client";

import { useMemo, useState } from "react";

type Partner = {
  name: string; handle: string; type: string; platform: string; niche: string;
  followers: string; engagement: string; score: number; tier: "A" | "B" | "C";
  status: string; contact: string; color: string; initials: string;
};

const partners: Partner[] = [
  { name: "Sofia Reyes", handle: "@sofiastyled", type: "KOC", platform: "Instagram", niche: "Luxury shoes · Styling", followers: "42.8K", engagement: "4.8%", score: 92, tier: "A", status: "Contact Ready", contact: "sofia@styled.co", color: "#ead7c3", initials: "SR" },
  { name: "The Bridal Edit", handle: "thebridaledit.com", type: "Affiliate", platform: "Blog", niche: "Wedding fashion · Reviews", followers: "128K", engagement: "3.9%", score: 88, tier: "A", status: "Qualified", contact: "hello@thebridaledit.com", color: "#d4d9ef", initials: "BE" },
  { name: "Maya Chen", handle: "@walkwithmaya", type: "Creator", platform: "YouTube", niche: "Try-on · Petite fashion", followers: "76.2K", engagement: "5.2%", score: 86, tier: "B", status: "Contacted", contact: "business@mayachen.tv", color: "#cfe6dc", initials: "MC" },
  { name: "Modern Heel", handle: "modernheel.com", type: "Media", platform: "Blog", niche: "Footwear · Editorial", followers: "91K", engagement: "2.7%", score: 79, tier: "B", status: "Replied", contact: "editor@modernheel.com", color: "#e6d6cf", initials: "MH" },
  { name: "Alexis Ward", handle: "@alexiswardrobe", type: "KOC", platform: "Instagram", niche: "Workwear · Shoe reviews", followers: "18.4K", engagement: "6.1%", score: 77, tier: "B", status: "Discovered", contact: "Contact page found", color: "#d8e3cd", initials: "AW" },
  { name: "Luxe for Less", handle: "luxeforless.co", type: "Affiliate", platform: "Blog", niche: "Deals · Luxury fashion", followers: "210K", engagement: "1.9%", score: 68, tier: "C", status: "Discovered", contact: "Email not found", color: "#e3d6e8", initials: "LL" },
];

const nav = ["Overview", "Campaigns", "Partner discovery", "Partner CRM", "Outreach", "Analytics"];

export default function Home() {
  const [active, setActive] = useState("Partner discovery");
  const [selected, setSelected] = useState<Partner | null>(partners[0]);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All tiers");
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaigns, setCampaigns] = useState(3);

  const filtered = useMemo(() => partners.filter(p =>
    (tier === "All tiers" || p.tier === tier.replace(" tier", "")) &&
    `${p.name} ${p.type} ${p.niche} ${p.platform}`.toLowerCase().includes(query.toLowerCase())
  ), [query, tier]);

  function notify(message: string) {
    setToast(message); window.setTimeout(() => setToast(""), 2600);
  }

  function runDiscovery() {
    setRunning(true);
    window.setTimeout(() => { setRunning(false); notify("Discovery complete · 24 new candidates found"); }, 1800);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">P</span><span>Partner<span className="brand-accent">OS</span></span></div>
        <div className="workspace"><span className="workspace-avatar">A</span><div><strong>AORARA</strong><small>Global workspace</small></div><span className="chev">⌄</span></div>
        <nav>
          <p className="nav-label">WORKSPACE</p>
          {nav.map((item, i) => <button key={item} className={active === item ? "nav-item active" : "nav-item"} onClick={() => setActive(item)}><span className="nav-icon">{["⌂","◫","⌕","◎","↗","⌁"][i]}</span>{item}{item === "Partner discovery" && <em>24</em>}</button>)}
          <p className="nav-label lower">MANAGE</p>
          <button className="nav-item"><span className="nav-icon">▱</span>Templates</button>
          <button className="nav-item"><span className="nav-icon">⚙</span>Integrations</button>
        </nav>
        <div className="trial-card"><div className="trial-icon">✦</div><strong>MVP workspace</strong><p>Connect discovery APIs when you are ready for live data.</p><button onClick={() => notify("Integration settings opened")}>Manage sources</button></div>
        <div className="user"><span>AL</span><div><strong>Adrian Li</strong><small>Administrator</small></div><button>•••</button></div>
      </aside>

      <section className="workspace-main">
        <header className="topbar">
          <div className="breadcrumbs">Campaigns <span>/</span> <strong>US High Heels Creator Outreach</strong></div>
          <div className="top-actions"><button className="icon-btn">?</button><button className="icon-btn">♢<i /></button><button className="primary" onClick={() => setCampaignOpen(true)}>＋ New campaign</button></div>
        </header>

        <div className="content">
          <div className="campaign-head">
            <div><div className="eyebrow"><span className="live-dot" /> DISCOVERY ACTIVE</div><h1>Find the partners who can<br/><em>move your market.</em></h1><p>AI-curated creators, affiliates and media matched to AORARA’s handmade heels in the United States.</p></div>
            <div className="campaign-actions"><button className="secondary" onClick={() => notify("Search strategy regenerated")}>↻ Regenerate strategy</button><button className="run" onClick={runDiscovery} disabled={running}>{running ? <><span className="spinner"/>Searching the web…</> : "▶ Run discovery"}</button></div>
          </div>

          <div className="metric-grid">
            <article><div><span className="metric-icon mint">◎</span><small>PARTNERS FOUND</small></div><strong>248</strong><p><b>+24</b> from last run</p></article>
            <article><div><span className="metric-icon blue">✦</span><small>QUALIFIED</small></div><strong>67</strong><p>27% qualification rate</p></article>
            <article><div><span className="metric-icon gold">↗</span><small>CONTACT READY</small></div><strong>41</strong><p>61% have verified email</p></article>
            <article><div><span className="metric-icon lilac">◉</span><small>AVG. MATCH SCORE</small></div><strong>78<span>/100</span></strong><p><b>↑ 6 points</b> this week</p></article>
          </div>

          <section className="strategy-card">
            <div className="strategy-top"><div><span className="ai-badge">✦ AI STRATEGY</span><h2>Your current discovery thesis</h2><p>Prioritise micro-creators with strong US female audiences and recent high-intent footwear content.</p></div><button onClick={() => notify("Partner ICP panel opened")}>View Partner ICP →</button></div>
            <div className="strategy-tags"><div><small>TARGET PROFILES</small><span>KOC · 5K–80K</span><span>Wedding blogger</span><span>Fashion affiliate</span></div><div><small>CONTENT SIGNALS</small><span>Try-on</span><span>Shoe review</span><span>Wedding styling</span></div><div><small>COOPERATION</small><span>Product seeding</span><span>12% commission</span></div></div>
          </section>

          <div className="table-head"><div><h2>Partner candidates</h2><span>{filtered.length} shown · 248 total</span></div><div className="filters"><label>⌕<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search partners…"/></label><select value={tier} onChange={e => setTier(e.target.value)}><option>All tiers</option><option>A tier</option><option>B tier</option><option>C tier</option></select><button>☷ Filters <sup>2</sup></button></div></div>

          <div className="partner-layout">
            <div className="partner-table">
              <div className="table-row table-labels"><span>PARTNER</span><span>TYPE & PLATFORM</span><span>AUDIENCE</span><span>MATCH</span><span>STATUS</span><span></span></div>
              {filtered.map(p => <button className={selected?.name === p.name ? "table-row selected" : "table-row"} key={p.name} onClick={() => setSelected(p)}>
                <span className="partner-cell"><i style={{background:p.color}}>{p.initials}</i><b>{p.name}<small>{p.handle}</small></b></span>
                <span><b>{p.type}</b><small>{p.platform} · {p.niche}</small></span>
                <span><b>{p.followers}</b><small>{p.engagement} engagement</small></span>
                <span className="score"><b>{p.score}</b><i className={`tier tier-${p.tier}`}>{p.tier}</i></span>
                <span><i className={`status status-${p.status.toLowerCase().replace(" ", "-")}`}>{p.status}</i></span><span className="dots">•••</span>
              </button>)}
            </div>

            {selected && <aside className="detail-panel">
              <button className="close-panel" onClick={() => setSelected(null)}>×</button>
              <div className="detail-profile"><span style={{background:selected.color}}>{selected.initials}</span><h3>{selected.name}</h3><p>{selected.handle}</p><div><i>{selected.type}</i><i>{selected.platform}</i></div></div>
              <div className="match-ring"><div><strong>{selected.score}</strong><small>/100</small></div><span><b>Strong match</b><small>Top 8% of this campaign</small></span></div>
              <div className="reason"><h4>✦ Why this partner fits</h4><ul><li>Published 4 high-heel related posts in the last 90 days</li><li>US women aged 25–44 are the primary audience</li><li>Consistent views and authentic comment quality</li><li>Public business contact available</li></ul></div>
              <div className="risk"><b>△ Watch signal</b><span>Posting frequency slowed slightly this month.</span></div>
              <div className="contact"><small>BEST CONTACT</small><b>{selected.contact}</b></div>
              <div className="detail-actions"><button onClick={() => notify(`${selected.name} moved to Contact Ready`)}>Qualify partner</button><button className="send" onClick={() => notify("Personalised outreach draft created")}>✦ Create outreach</button></div>
            </aside>}
          </div>
        </div>
      </section>

      {campaignOpen && <div className="modal-backdrop" onMouseDown={() => setCampaignOpen(false)}><form className="modal" onMouseDown={e => e.stopPropagation()} onSubmit={e => {e.preventDefault(); setCampaigns(campaigns + 1); setCampaignOpen(false); notify("Campaign created · AI is preparing the ICP");}}><button type="button" className="modal-close" onClick={() => setCampaignOpen(false)}>×</button><span className="ai-badge">NEW CAMPAIGN</span><h2>Build your partner pipeline</h2><p>Tell us what you sell and who you want to reach. AI will prepare the partner ICP and search strategy.</p><div className="form-grid"><label>Campaign name<input required defaultValue={`US Creator Outreach ${campaigns + 1}`}/></label><label>Brand<input required defaultValue="AORARA"/></label><label>Product<input required placeholder="e.g. Handmade high heels"/></label><label>Target market<select><option>United States</option><option>United Kingdom</option><option>Germany</option></select></label><label className="wide">Partner types<div className="check-row"><span>✓ KOC</span><span>✓ Creator</span><span>✓ Affiliate</span><span>＋ Media</span></div></label></div><button className="create-submit">Create campaign & generate ICP →</button></form></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
