"use client";

import { useEffect, useMemo, useState } from "react";

type Partner = { name:string; handle:string; type:string; platform:string; niche:string; followers:string; engagement:string; score:number; tier:"A"|"B"|"C"; status:string; contact:string; color:string; initials:string };
type Project = { id:string; databaseId?:string; isSample?:boolean; name:string; brand:string; product:string; market:string; code:string; description:string; partnerTypes:string; signals:string; cooperation:string; metrics:{found:number;qualified:number;ready:number;score:number}; partners:Partner[] };

const initialProjects: Project[] = [
  { id:"heels-us", name:"美国手工高跟鞋合作伙伴开发", brand:"AORARA", product:"手工高跟鞋", market:"美国", code:"HH-US-01", description:"优先寻找拥有美国女性受众、近期发布鞋履内容的中小型创作者与婚礼时尚联盟站。", partnerTypes:"KOC · 5千–8万粉丝 / 婚礼博主 / 时尚联盟站", signals:"试穿 · 鞋履测评 · 婚礼穿搭", cooperation:"产品寄样 · 12% 佣金", metrics:{found:248,qualified:67,ready:41,score:78}, partners:[
    {name:"Sofia Reyes",handle:"@sofiastyled",type:"KOC",platform:"Instagram",niche:"高端鞋履 · 穿搭",followers:"4.28万",engagement:"4.8%",score:92,tier:"A",status:"待联系",contact:"sofia@styled.co",color:"#ead7c3",initials:"SR"},
    {name:"The Bridal Edit",handle:"thebridaledit.com",type:"联盟站",platform:"独立博客",niche:"婚礼时尚 · 测评",followers:"12.8万",engagement:"3.9%",score:88,tier:"A",status:"已入选",contact:"hello@thebridaledit.com",color:"#d4d9ef",initials:"BE"},
    {name:"Maya Chen",handle:"@walkwithmaya",type:"创作者",platform:"YouTube",niche:"试穿 · 小个子穿搭",followers:"7.62万",engagement:"5.2%",score:86,tier:"B",status:"已联系",contact:"business@mayachen.tv",color:"#cfe6dc",initials:"MC"},
    {name:"Modern Heel",handle:"modernheel.com",type:"媒体",platform:"独立博客",niche:"鞋履 · 编辑内容",followers:"9.1万",engagement:"2.7%",score:79,tier:"B",status:"已回复",contact:"editor@modernheel.com",color:"#e6d6cf",initials:"MH"},
    {name:"Alexis Ward",handle:"@alexiswardrobe",type:"KOC",platform:"Instagram",niche:"职场穿搭 · 鞋履测评",followers:"1.84万",engagement:"6.1%",score:77,tier:"B",status:"新发现",contact:"已找到联系页面",color:"#d8e3cd",initials:"AW"}
  ]},
  { id:"tibet-global", name:"藏文化产品全球内容合作", brand:"TIBETAN TREASURES", product:"藏文化艺术与冥想产品", market:"美国、英国", code:"TC-GL-02", description:"寻找关注佛教文化、冥想、瑜伽与艺术收藏的创作者和媒体，强调文化尊重与内容质量。", partnerTypes:"灵性博主 / 瑜伽创作者 / 艺术媒体", signals:"冥想 · 佛教文化 · 艺术收藏", cooperation:"内容共创 · 专家访谈 · 寄样", metrics:{found:136,qualified:38,ready:19,score:74}, partners:[
    {name:"Quiet Mind Studio",handle:"@quietmindstudio",type:"创作者",platform:"YouTube",niche:"冥想 · 东方文化",followers:"8.6万",engagement:"4.4%",score:90,tier:"A",status:"待联系",contact:"hello@quietmind.studio",color:"#ddd1bd",initials:"QM"},
    {name:"Sacred Arts Journal",handle:"sacredartsjournal.com",type:"媒体",platform:"独立博客",niche:"宗教艺术 · 收藏",followers:"6.4万",engagement:"3.6%",score:85,tier:"A",status:"已入选",contact:"editor@sacredartsjournal.com",color:"#d5c8b4",initials:"SA"},
    {name:"Emma Flow",handle:"@emmaflowyoga",type:"KOL",platform:"Instagram",niche:"瑜伽 · 正念生活",followers:"15.2万",engagement:"3.2%",score:81,tier:"B",status:"洽谈中",contact:"collab@emmaflow.com",color:"#cfded5",initials:"EF"},
    {name:"The Dharma Path",handle:"thedharmapath.org",type:"社群",platform:"论坛",niche:"佛教学习 · 社群",followers:"3.1万",engagement:"5.8%",score:76,tier:"B",status:"新发现",contact:"管理员联系表单",color:"#e6d9c9",initials:"DP"}
  ]},
  { id:"pet-us", name:"美国宠物口腔护理达人计划", brand:"PETSMILE LAB", product:"宠物口腔护理产品", market:"美国", code:"PC-US-03", description:"重点开发兽医、宠物护理博主和专业宠物媒体，优先选择可信度高、内容科学严谨的合作伙伴。", partnerTypes:"兽医 KOL / 宠物护理博主 / 行业媒体", signals:"口腔护理 · 兽医科普 · 产品测评", cooperation:"专业测评 · 付费内容 · 联盟佣金", metrics:{found:184,qualified:52,ready:33,score:82}, partners:[
    {name:"Dr. Kelly Pets",handle:"@drkellypets",type:"兽医 KOL",platform:"YouTube",niche:"兽医科普 · 口腔健康",followers:"19.8万",engagement:"5.6%",score:94,tier:"A",status:"已回复",contact:"team@drkellypets.com",color:"#cfe1dd",initials:"DK"},
    {name:"Happy Paws Daily",handle:"@happypawsdaily",type:"KOC",platform:"Instagram",niche:"宠物护理 · 产品体验",followers:"5.3万",engagement:"6.4%",score:89,tier:"A",status:"待联系",contact:"partnerships@happypaws.co",color:"#e8d6c1",initials:"HP"},
    {name:"Pet Care Review",handle:"petcarereview.com",type:"联盟站",platform:"独立博客",niche:"宠物用品 · 测评",followers:"11.2万",engagement:"3.1%",score:83,tier:"B",status:"已联系",contact:"reviews@petcarereview.com",color:"#d7ddef",initials:"PR"},
    {name:"Vet Community US",handle:"vetcommunity.us",type:"社群",platform:"论坛",niche:"兽医交流 · 临床经验",followers:"2.7万",engagement:"7.2%",score:78,tier:"B",status:"新发现",contact:"管理员联系页面",color:"#d4e5d2",initials:"VC"}
  ]}
];

const nav = ["工作台","项目中心","伙伴发现","伙伴 CRM","触达管理","效果分析"];

export default function Home() {
  const [active,setActive] = useState("伙伴发现");
  const [projectList,setProjectList] = useState<Project[]>(initialProjects.map(item=>({...item,isSample:true})));
  const [projectId,setProjectId] = useState(initialProjects[0].id);
  const [databaseStatus,setDatabaseStatus] = useState<"checking"|"connected"|"unconfigured"|"error">("checking");
  const project = projectList.find(x=>x.id===projectId) ?? projectList[0];
  const [selectedName,setSelectedName] = useState(project.partners[0]?.name ?? "");
  const selected = project.partners.find(x=>x.name===selectedName) ?? project.partners[0];
  const [query,setQuery] = useState(""); const [tier,setTier] = useState("全部层级");
  const [running,setRunning] = useState(false); const [toast,setToast] = useState(""); const [campaignOpen,setCampaignOpen] = useState(false);
  const filtered = useMemo(()=>project.partners.filter(p=>(tier==="全部层级"||p.tier===tier.slice(0,1))&&`${p.name} ${p.type} ${p.niche} ${p.platform}`.toLowerCase().includes(query.toLowerCase())),[project,query,tier]);
  const notify=(msg:string)=>{setToast(msg);window.setTimeout(()=>setToast(""),2600)};

  useEffect(()=>{
    void (async()=>{
      try {
        const health=await fetch("/api/health",{cache:"no-store"});
        if(!health.ok){setDatabaseStatus(health.status===503?"unconfigured":"error");return;}
        setDatabaseStatus("connected");
        const response=await fetch("/api/campaigns",{cache:"no-store"}); const result=await response.json();
        if(!response.ok) throw new Error(result.error);
        setProjectList(current=>result.data.map((row:{id:string;code:string;name:string;brand_name:string;product_name:string;target_countries:string[];product_intro:string})=>{
          const sample=current.find(item=>item.code===row.code);
          return sample?{...sample,databaseId:row.id}:{id:row.id,databaseId:row.id,name:row.name,brand:row.brand_name,product:row.product_name,market:(row.target_countries??[]).join("、"),code:row.code,description:row.product_intro||"尚未生成项目画像。",partnerTypes:"待生成",signals:"待生成",cooperation:"待配置",metrics:{found:0,qualified:0,ready:0,score:0},partners:[]};
        }));
      } catch { setDatabaseStatus("error"); }
    })();
  },[]);

  const loadRemotePartners=async(next:Project)=>{
    if(!next.databaseId)return;
    try{
      const response=await fetch(`/api/campaigns/${next.databaseId}/partners`,{cache:"no-store"}); const result=await response.json();
      if(!response.ok||!result.data?.length)return;
      const mapped:Partner[]=result.data.map((row:{score:number;tier:"A"|"B"|"C";crm_status:string;partner:Record<string,unknown>})=>{const p=row.partner;return{name:String(p.display_name),handle:String(p.profile_url??p.website??""),type:String(p.partner_type),platform:String(p.primary_platform),niche:Array.isArray(p.content_categories)?p.content_categories.join(" · "):"",followers:p.followers?Number(p.followers).toLocaleString("zh-CN"):"—",engagement:p.engagement_rate?`${(Number(p.engagement_rate)*100).toFixed(1)}%`:"—",score:Number(row.score??0),tier:row.tier??"C",status:row.crm_status,contact:String(p.email??p.other_contact??"待补充"),color:"#dbe7e1",initials:String(p.display_name).slice(0,2).toUpperCase()}});
      setProjectList(current=>current.map(item=>item.id===next.id?{...item,partners:mapped,isSample:false,metrics:{...item.metrics,found:mapped.length,qualified:mapped.filter(p=>p.score>=70).length,ready:mapped.filter(p=>p.contact!=="待补充").length,score:Math.round(mapped.reduce((sum,p)=>sum+p.score,0)/mapped.length)}}:item));
      setSelectedName(mapped[0]?.name??"");
    }catch{notify("读取正式伙伴数据失败")}
  };

  const switchProject=(id:string)=>{const next=projectList.find(x=>x.id===id)??projectList[0];setProjectId(id);setSelectedName(next.partners[0]?.name??"");setQuery("");setTier("全部层级");notify(`已切换到：${next.name}`);void loadRemotePartners(next)};
  const runDiscovery=async()=>{if(databaseStatus!=="connected"){notify("请先完成 Supabase 与搜索数据源配置");return;}if(!project.databaseId){notify("当前项目尚未写入数据库");return;}setRunning(true);try{const response=await fetch("/api/discovery",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({campaignId:project.databaseId})});const result=await response.json();if(!response.ok)throw new Error(result.error);notify(`发现完成：找到 ${result.found} 个候选人，${result.qualified} 个符合条件`);await loadRemotePartners(project)}catch(error){notify(error instanceof Error?error.message:"发现任务失败")}finally{setRunning(false)}};
  const createProject=async(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(databaseStatus!=="connected"){notify("正式数据库尚未连接，暂时无法创建项目");return;}
    const form=new FormData(event.currentTarget);
    try{
      const response=await fetch("/api/campaigns",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:form.get("name"),brandName:form.get("brandName"),productName:form.get("productName"),targetCountry:form.get("targetCountry"),partnerTypes:["KOC","内容创作者","联盟站"]})});
      const result=await response.json(); if(!response.ok)throw new Error(result.error);
      const row=result.data; const created:Project={id:row.id,databaseId:row.id,name:row.name,brand:row.brand_name,product:row.product_name,market:(row.target_countries??[]).join("、"),code:row.code,description:"AI 正在生成项目画像。",partnerTypes:"待生成",signals:"待生成",cooperation:"待配置",metrics:{found:0,qualified:0,ready:0,score:0},partners:[]};
      setProjectList(current=>[...current,created]); setProjectId(created.id); setSelectedName(""); setCampaignOpen(false); notify("项目已写入 Supabase 数据库");
    }catch(error){notify(error instanceof Error?error.message:"创建项目失败")}
  };

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">P</span><span>伙伴<span className="brand-accent">智库</span></span></div>
      <div className="workspace"><span className="workspace-avatar">A</span><div><strong>内部运营中心</strong><small>仅限团队使用</small></div><span className="chev">⌄</span></div>
      <nav><p className="nav-label">业务工作区</p>{nav.map((item,i)=><button key={item} className={active===item?"nav-item active":"nav-item"} onClick={()=>setActive(item)}><span className="nav-icon">{["⌂","◫","⌕","◎","↗","⌁"][i]}</span>{item}{item==="伙伴发现"&&<em>{project.metrics.ready}</em>}</button>)}<p className="nav-label lower">系统管理</p><button className="nav-item"><span className="nav-icon">▱</span>话术模板</button><button className="nav-item"><span className="nav-icon">⚙</span>数据源设置</button></nav>
      <div className="trial-card"><div className="trial-icon">✦</div><strong>当前为 MVP 版本</strong><p>接入正式数据源后，可运行真实搜索、抓取与邮件触达。</p><button onClick={()=>notify("已打开数据源设置")}>管理数据源</button></div>
      <div className="user"><span>管</span><div><strong>系统管理员</strong><small>管理员权限</small></div><button>•••</button></div>
    </aside>
    <section className="workspace-main">
      <header className="topbar"><div className="project-switch"><span>当前项目</span><select value={projectId} onChange={e=>switchProject(e.target.value)} aria-label="切换项目">{projectList.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select><i>{project.code}</i><b className={`database-pill ${databaseStatus}`}>{databaseStatus==="connected"?"数据库已连接":databaseStatus==="checking"?"正在检查数据库":"数据库未配置"}</b></div><div className="top-actions"><button className="icon-btn">?</button><button className="icon-btn">♢<i/></button><button className="primary" onClick={()=>setCampaignOpen(true)}>＋ 新建项目</button></div></header>
      <div className="content">
        <div className="project-context"><span><b>{project.brand}</b> · {project.product}</span><span>目标市场：{project.market}</span><span>项目编号：{project.code}</span></div>
        <div className="campaign-head"><div><div className="eyebrow"><span className="live-dot"/> 项目发现任务运行中</div><h1>找到真正能够<br/><em>推动市场的合作伙伴</em></h1><p>{project.description}</p></div><div className="campaign-actions"><button className="secondary" onClick={()=>notify("AI 搜索策略已重新生成")}>↻ 重新生成策略</button><button className="run" onClick={runDiscovery} disabled={running}>{running?<><span className="spinner"/>正在搜索公开网络…</>:"▶ 运行伙伴发现"}</button></div></div>
        <div className="metric-grid"><article><div><span className="metric-icon mint">◎</span><small>已发现伙伴</small></div><strong>{project.metrics.found}</strong><p><b>+24</b> 来自上次任务</p></article><article><div><span className="metric-icon blue">✦</span><small>符合条件</small></div><strong>{project.metrics.qualified}</strong><p>{Math.round(project.metrics.qualified/project.metrics.found*100)}% 入选率</p></article><article><div><span className="metric-icon gold">↗</span><small>可以联系</small></div><strong>{project.metrics.ready}</strong><p>已找到并核验联系方式</p></article><article><div><span className="metric-icon lilac">◉</span><small>平均匹配分</small></div><strong>{project.metrics.score}<span>/100</span></strong><p><b>项目独立计算</b></p></article></div>
        <section className="strategy-card"><div className="strategy-top"><div><span className="ai-badge">✦ AI 项目策略</span><h2>本项目的伙伴发现逻辑</h2><p>{project.description}</p></div><button onClick={()=>notify("已打开本项目的伙伴画像")}>查看伙伴画像 →</button></div><div className="strategy-tags"><div><small>目标伙伴</small><span>{project.partnerTypes}</span></div><div><small>内容信号</small><span>{project.signals}</span></div><div><small>合作方式</small><span>{project.cooperation}</span></div></div></section>
        <div className="table-head"><div><h2>本项目候选伙伴</h2><span>显示 {filtered.length} 条 · 项目共 {project.metrics.found} 条</span>{project.isSample&&<span className="sample-badge">样例数据，尚未来自正式搜索</span>}</div><div className="filters"><label>⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索伙伴…"/></label><select value={tier} onChange={e=>setTier(e.target.value)}><option>全部层级</option><option>A 级</option><option>B 级</option><option>C 级</option></select><button>☷ 筛选 <sup>2</sup></button></div></div>
        <div className="partner-layout"><div className="partner-table"><div className="table-row table-labels"><span>合作伙伴</span><span>类型与平台</span><span>账号规模</span><span>匹配度</span><span>当前状态</span><span></span></div>{filtered.map(p=><button className={selected?.name===p.name?"table-row selected":"table-row"} key={p.name} onClick={()=>setSelectedName(p.name)}><span className="partner-cell"><i style={{background:p.color}}>{p.initials}</i><b>{p.name}<small>{p.handle}</small></b></span><span><b>{p.type}</b><small>{p.platform} · {p.niche}</small></span><span><b>{p.followers}</b><small>互动率 {p.engagement}</small></span><span className="score"><b>{p.score}</b><i className={`tier tier-${p.tier}`}>{p.tier}</i></span><span><i className="status">{p.status}</i></span><span className="dots">•••</span></button>)}</div>
          {selected&&<aside className="detail-panel"><div className="detail-project">仅属于项目：{project.code}</div><div className="detail-profile"><span style={{background:selected.color}}>{selected.initials}</span><h3>{selected.name}</h3><p>{selected.handle}</p><div><i>{selected.type}</i><i>{selected.platform}</i></div></div><div className="match-ring"><div><strong>{selected.score}</strong><small>/100</small></div><span><b>高度匹配</b><small>本项目候选池前 8%</small></span></div><div className="reason"><h4>✦ 为什么适合本项目</h4><ul><li>近期内容与“{project.product}”相关</li><li>核心受众覆盖目标市场：{project.market}</li><li>内容互动真实，更新频率稳定</li><li>已找到公开商务联系方式</li></ul></div><div className="risk"><b>△ 需要关注</b><span>正式联系前建议人工复核近期内容与品牌安全。</span></div><div className="contact"><small>推荐联系方式</small><b>{selected.contact}</b></div><div className="detail-actions"><button onClick={()=>notify(`${selected.name} 已加入本项目待联系名单`)}>确认入选</button><button className="send" onClick={()=>notify("已生成中文个性化触达草稿")}>✦ 生成触达话术</button></div></aside>}
        </div>
      </div>
    </section>
    {campaignOpen&&<div className="modal-backdrop" onMouseDown={()=>setCampaignOpen(false)}><form className="modal" onMouseDown={e=>e.stopPropagation()} onSubmit={createProject}><button type="button" className="modal-close" onClick={()=>setCampaignOpen(false)}>×</button><span className="ai-badge">新建独立项目</span><h2>创建合作伙伴开发项目</h2><p>每个项目的数据完全独立，包括画像、搜索词、伙伴池、触达记录和效果数据。</p><div className="form-grid"><label>项目名称<input name="name" required placeholder="例如：德国宠物护理伙伴开发"/></label><label>品牌名称<input name="brandName" required placeholder="请输入品牌名称"/></label><label>产品名称<input name="productName" required placeholder="请输入具体产品"/></label><label>目标市场<select name="targetCountry"><option>美国</option><option>英国</option><option>德国</option><option>全球</option></select></label><label className="wide">伙伴类型<div className="check-row"><span>✓ KOC</span><span>✓ 内容创作者</span><span>✓ 联盟站</span><span>＋ 垂直媒体</span></div></label></div><button className="create-submit">写入数据库并创建项目 →</button></form></div>}
    {toast&&<div className="toast"><span>✓</span>{toast}</div>}
  </main>;
}
