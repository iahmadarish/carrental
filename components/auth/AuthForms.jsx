"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useAuth, useToast } from "@/components/providers/AppProviders";
import { api } from "@/lib/api";
import { AU_STATES } from "@/lib/format";
import { useQueryParam } from "@/lib/hooks";

const IMG = {
  login: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
  register: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=80",
  forgot: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=80",
  reset: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80",
};

const qs = (k) => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get(k));
const safeNext = (locale) => {
  const n = qs("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : `/${locale}/account`;
};

function Shell({ kind, eyebrow, quote, children }) {
  const ref = useRef(null);
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".auth-box > *", { y: 30, opacity: 0, stagger: 0.06, duration: 0.8, ease: "power3.out", delay: 0.1 });
      gsap.from(".auth-img", { scale: 1.2, duration: 2.2, ease: "power3.out" });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-2 lg:block">
        {imgOk && <Image src={IMG[kind]} alt="" fill priority sizes="50vw" className="auth-img object-cover opacity-55" onError={() => setImgOk(false)} />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,100,44,.25),transparent_55%)]" />
        {quote && (
          <div className="absolute right-12 bottom-14 left-12">
            <span className="eyebrow">{eyebrow}</span>
            <p className="h-md mt-4">{quote}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center px-6 pt-32 pb-16 sm:px-16">
        <div className="auth-box mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function PwMeter({ value }) {
  let s = 0;
  if (value.length >= 8) s++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
  if (/\d/.test(value)) s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  if (value.length >= 12) s++;
  const colors = ["#ff5d5d", "#ff5d5d", "#ffb347", "#ffd23f", "#8fb39a", "#58d68d"];
  return (
    <div className="mt-2 h-1 overflow-hidden rounded bg-line-2">
      <i className="block h-full transition-all duration-500" style={{ width: `${(s / 5) * 100}%`, background: colors[s] }} />
    </div>
  );
}

function shake(el) {
  gsap.fromTo(el, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1,.3)" });
}

/* ---------------- Login ---------------- */
export function LoginForm({ locale, dict }) {
  const a = dict.auth;
  const { setUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const form = useRef(null);
  const [f, setF] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api("/auth/login", { method: "POST", body: f });
      setUser(r.user);
      toast(r.message, "ok");
      router.push(r.user.role === "admin" && !qs("next") ? `/${locale}/admin` : safeNext(locale));
    } catch (err) {
      toast(err.message, "err");
      shake(form.current);
      if (err.data?.code === "UNVERIFIED") router.push(`/${locale}/register?verify=${encodeURIComponent(err.data.email)}`);
    }
    setBusy(false);
  }

  return (
    <Shell kind="login" eyebrow="Welcome back" quote={a.sideLogin}>
      <span className="eyebrow">{a.login}</span>
      <h1 className="mt-4 text-5xl font-bold">{a.loginTitle}</h1>
      <p className="mt-2 mb-8 text-mute">{a.loginSub}</p>
      <form ref={form} onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="field-label">{a.email}</span>
          <input type="email" autoComplete="email" required className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </label>
        <label className="block">
          <span className="field-label flex justify-between">
            {a.password}
            <Link href={`/${locale}/forgot`} className="text-ochre-2">
              {a.forgot}
            </Link>
          </span>
          <input type="password" autoComplete="current-password" required className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </label>
        <button className="btn w-full" disabled={busy}>
          {busy ? "…" : a.login} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-mute">
        {a.newHere}{" "}
        <Link href={`/${locale}/register`} className="font-bold text-ochre-2">
          {a.createAccount}
        </Link>
      </p>
    </Shell>
  );
}

/* ---------------- Register + OTP ---------------- */
export function RegisterForm({ locale, dict }) {
  const a = dict.auth;
  const { setUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const verifyParam = useQueryParam("verify"); // set when login bounced an unverified user
  const [stepState, setStep] = useState(null);
  const [emailState, setEmail] = useState("");
  const step = stepState || (verifyParam ? "otp" : "details");
  const email = emailState || verifyParam;
  const [f, setF] = useState({ name: "", email: "", phone: "", state: "", password: "", acceptTerms: false, marketingOptIn: true });
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [cool, setCool] = useState(0);
  const inputs = useRef([]);
  const box = useRef(null);

  useEffect(() => {
    if (step !== "otp") return;
    gsap.fromTo(".otp-step > *", { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: "power3.out" });
    setTimeout(() => inputs.current[0]?.focus(), 300);
  }, [step]);
  useEffect(() => {
    if (cool <= 0) return;
    const id = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cool]);

  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function register(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api("/auth/register", { method: "POST", body: f });
      toast(r.message, "ok");
      setEmail(r.email);
      setCool(45);
      gsap.to(box.current, { x: -40, opacity: 0, duration: 0.35, onComplete: () => setStep("otp") });
    } catch (err) {
      toast(err.message, "err");
      shake(box.current);
    }
    setBusy(false);
  }

  async function verify(digits) {
    const c = (digits || code).join("");
    if (c.length !== 6) return toast("Enter all 6 digits", "err");
    setBusy(true);
    try {
      const r = await api("/auth/verify-otp", { method: "POST", body: { email, code: c } });
      if (r.user) setUser(r.user);
      toast(r.message, "ok");
      router.push(r.user ? safeNext(locale) : `/${locale}/login`);
    } catch (err) {
      toast(err.message, "err");
      setCode(["", "", "", "", "", ""]);
      shake(".otp-inputs");
      inputs.current[0]?.focus();
    }
    setBusy(false);
  }

  function onDigit(i, v) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && inputs.current[i + 1]) inputs.current[i + 1].focus();
    if (next.every(Boolean)) verify(next);
  }
  function onPaste(e) {
    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    e.preventDefault();
    const next = [...code];
    digits.forEach((d, k) => (next[k] = d));
    setCode(next);
    if (digits.length === 6) verify(next);
  }

  async function resend() {
    try {
      const r = await api("/auth/resend-otp", { method: "POST", body: { email } });
      toast(r.message, "ok");
      setCool(45);
    } catch (err) {
      toast(err.message, "err");
    }
  }

  return (
    <Shell kind="register" eyebrow="VeloDrive Club" quote={a.sideRegister}>
      {step === "details" ? (
        // distinct keys: otherwise React reuses this <div> for the OTP step and keeps GSAP's opacity:0
        <div key="details" ref={box}>
          <span className="eyebrow">{a.createAccount}</span>
          <h1 className="mt-4 text-5xl font-bold">{a.registerTitle}</h1>
          <p className="mt-2 mb-8 text-mute">{a.registerSub}</p>
          <form onSubmit={register} className="space-y-4" noValidate>
            <label className="block">
              <span className="field-label">{a.name}</span>
              <input className="input" autoComplete="name" value={f.name} onChange={set("name")} />
            </label>
            <label className="block">
              <span className="field-label">{a.email}</span>
              <input type="email" className="input" autoComplete="email" value={f.email} onChange={set("email")} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="field-label">{a.phone}</span>
                <input className="input" placeholder="04xx xxx xxx" autoComplete="tel" value={f.phone} onChange={set("phone")} />
              </label>
              <label>
                <span className="field-label">{a.state}</span>
                <select className="input" value={f.state} onChange={set("state")}>
                  <option value="">—</option>
                  {AU_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="field-label">{a.password}</span>
              <input type="password" className="input" autoComplete="new-password" value={f.password} onChange={set("password")} />
              <PwMeter value={f.password} />
              <small className="mt-1.5 block text-mute">{a.passwordHint}</small>
            </label>
            <label className="flex items-start gap-2.5 text-sm text-mute">
              <input type="checkbox" className="mt-1" checked={f.acceptTerms} onChange={set("acceptTerms")} /> {a.terms}
            </label>
            <label className="flex items-start gap-2.5 text-sm text-mute">
              <input type="checkbox" className="mt-1" checked={f.marketingOptIn} onChange={set("marketingOptIn")} /> {a.marketing}
            </label>
            <button className="btn w-full" disabled={busy}>
              {busy ? "…" : a.createAccount} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-mute">
            {a.haveAccount}{" "}
            <Link href={`/${locale}/login`} className="font-bold text-ochre-2">
              {a.login}
            </Link>
          </p>
        </div>
      ) : (
        <div key="otp" className="otp-step">
          <span className="eyebrow">Verify email</span>
          <h1 className="mt-4 text-5xl font-bold">{a.verifyTitle}</h1>
          <p className="mt-2 text-mute">
            {a.verifySub} <b className="text-foreground">{email}</b>.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <div className="otp-inputs my-7 flex justify-center gap-2.5">
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  value={d}
                  onChange={(e) => onDigit(i, e.target.value)}
                  onKeyDown={(e) => e.key === "Backspace" && !d && inputs.current[i - 1]?.focus()}
                  onPaste={onPaste}
                  className="h-16 w-12 rounded-2xl border border-line-2 bg-white/[0.04] text-center font-display text-3xl font-bold outline-none focus:border-ochre sm:w-14"
                />
              ))}
            </div>
            <button className="btn w-full" disabled={busy}>
              {busy ? "…" : a.verify} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-mute">
            {a.noCode}{" "}
            <button type="button" disabled={cool > 0} onClick={resend} className="font-bold text-ochre-2 disabled:opacity-50">
              {a.resend}
            </button>{" "}
            {cool > 0 && `(${cool}s)`}
          </p>
        </div>
      )}
    </Shell>
  );
}

/* ---------------- Forgot ---------------- */
export function ForgotForm({ locale, dict }) {
  const a = dict.auth;
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api("/auth/forgot-password", { method: "POST", body: { email } });
      toast(r.message, "ok");
    } catch (err) {
      toast(err.message, "err");
    }
    setBusy(false);
  }
  return (
    <Shell kind="forgot">
      <span className="eyebrow">Reset password</span>
      <h1 className="mt-4 text-5xl font-bold">{a.forgotTitle}</h1>
      <p className="mt-2 mb-8 text-mute">{a.forgotSub}</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="field-label">{a.email}</span>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className="btn w-full" disabled={busy}>
          {a.sendLink} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href={`/${locale}/login`} className="text-ochre-2">
          ← {a.backToLogin}
        </Link>
      </p>
    </Shell>
  );
}

/* ---------------- Reset ---------------- */
export function ResetForm({ locale, dict }) {
  const a = dict.auth;
  const { setUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [f, setF] = useState({ password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (f.password !== f.confirm) return toast(a.mismatch, "err");
    setBusy(true);
    try {
      const r = await api("/auth/reset-password", { method: "POST", body: { password: f.password, token: qs("token"), email: qs("email") } });
      setUser(r.user);
      toast(r.message, "ok");
      router.push(`/${locale}/account`);
    } catch (err) {
      toast(err.message, "err");
    }
    setBusy(false);
  }
  return (
    <Shell kind="reset">
      <span className="eyebrow">New password</span>
      <h1 className="mt-4 text-5xl font-bold">{a.resetTitle}</h1>
      <p className="mt-2 mb-8 text-mute">{a.resetSub}</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="field-label">{a.newPassword}</span>
          <input type="password" required autoComplete="new-password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <PwMeter value={f.password} />
        </label>
        <label className="block">
          <span className="field-label">{a.confirmPassword}</span>
          <input type="password" required autoComplete="new-password" className="input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} />
        </label>
        <button className="btn w-full" disabled={busy}>
          {a.updatePassword} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </Shell>
  );
}
