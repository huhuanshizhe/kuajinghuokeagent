"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter(); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setError("");const password=String(new FormData(event.currentTarget).get("password")??"");const response=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({password})});const result=await response.json();setLoading(false);if(!response.ok){setError(result.error??"登录失败");return;}router.replace("/");router.refresh()}
  return <main className="login-page"><form className="login-card" onSubmit={submit}><span className="brand-mark">P</span><small>内部系统</small><h1>登录伙伴智库</h1><p>请输入团队内部访问密码。</p><label>访问密码<input name="password" type="password" autoComplete="current-password" required autoFocus/></label>{error&&<div className="login-error">{error}</div>}<button disabled={loading}>{loading?"正在验证…":"进入工作台"}</button></form></main>;
}
