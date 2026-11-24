import React, { useState, useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { ROLE_CREDENTIALS } from '../../data/mockEnterpriseData';
import {
  ShieldCheck,
  Lock,
  User,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Trees,
  Building2,
  Sparkles,
  MapPin,
  FlaskConical,
  Factory,
  Scale,
  Axe,
  Truck,
  FileBadge2,
  QrCode,
  Compass,
  Check,
  ChevronDown,
  ExternalLink,
  Info,
  Layers,
  Globe,
  Key
} from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, activeRole } = useEnterprise();

  // Selected preset role
  const [selectedRole, setSelectedRole] = useState('NERAMAC_ADMIN');
  const [username, setUsername] = useState('admin.neramac');
  const [password, setPassword] = useState('Admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFillBadge, setAutoFillBadge] = useState('NERAMAC Administrator');
  const [roleTab, setRoleTab] = useState('ALL');

  // Auto-fill inputs when a role is clicked
  const handleSelectRole = (cred) => {
    setSelectedRole(cred.role);
    setUsername(cred.username);
    setPassword(cred.password);
    setAutoFillBadge(cred.roleName);
  };

  const currentRoleConfig = ROLE_CREDENTIALS.find(r => r.role === selectedRole) || ROLE_CREDENTIALS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching credentials or fallback to selected role
      const matched = ROLE_CREDENTIALS.find(
        r => r.username.toLowerCase() === username.trim().toLowerCase()
      ) || currentRoleConfig;

      const cred = login(matched.role, { username, password });
      setIsSubmitting(false);

      if (onNavigate) {
        onNavigate(cred.defaultRoute || '/dashboard');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Subtle Gradient & Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* ── 2. Main Login Hero Grid (Left Branding + Right SSO Login Card) ──────────── */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 flex items-center">
        
        <div className="items-center w-full">
          

          {/* Right Column: Single Sign-On Authentication Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              
              {/* Card Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-1.5">
                <h1 className="text-3xl sm:text-4xl font-black pb-2 italic tracking-tight leading-tight">
                Agarwood Traceability &amp; Supply Chain Management System
              </h1>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Stakeholder Single Sign-In
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Select your stakeholder role below to <strong>auto-fill</strong> official demonstration credentials:
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Role Preset Selector Dropdown (Auto-Fills Username & Password) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <label htmlFor="role-select" className="font-extrabold uppercase text-slate-700 tracking-wider">
                      Select Role to Auto-Fill Credentials:
                    </label>
                    <span className="text-emerald-700 font-mono font-bold text-[10px]">
                      1-Click Auto-Fill
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      id="role-select"
                      value={selectedRole}
                      onChange={(e) => {
                        const cred = ROLE_CREDENTIALS.find(r => r.role === e.target.value);
                        if (cred) handleSelectRole(cred);
                      }}
                      className="w-full px-3 py-2.5 pr-9 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-white border-2 border-emerald-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs transition appearance-none cursor-pointer"
                    >
                      {ROLE_CREDENTIALS.map(cred => (
                        <option key={cred.role} value={cred.role} className="text-xs font-semibold py-1 text-slate-900">
                          {cred.roleName} ({cred.username}) — {cred.badge}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-emerald-700">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Auto-fill Confirmation Banner */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div className="text-[11px] text-emerald-950 font-medium">
                        Auto-filled credentials for <strong className="font-black text-emerald-900">{autoFillBadge}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-300">
                      {currentRoleConfig.username}
                    </span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Username / Stakeholder ID *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        placeholder="e.g. admin.neramac"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Password *
                      </label>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                        (Auto-Filled)
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Terminal Assurance */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span>Remember session on this workstation</span>
                    </label>
                    <span className="text-slate-400 text-[10px]">Gov NIC-SSO</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 tracking-wide disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Authenticating Secure Session...' : `Sign In as ${currentRoleConfig.roleName}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Overview Route Link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Want to explore without logging in?</span>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('/overview')}
                    className="font-bold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1"
                  >
                    <span>System Overview (/overview)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── 3. Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-800 py-4 text-slate-400 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-slate-300 font-semibold block">
              © 2026 NERAMAC Ltd (A Govt. of India Enterprise) • Ministry of DoNER
            </span>
            <span className="text-slate-500 text-[10px]">
              Assam Agarwood (Aquilaria malaccensis) Traceability &amp; Regulatory Chain of Custody System (ASCTS)
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-medium text-[10px]">
            <span>Security Certified</span>
            <span>•</span>
            <span>WCCB Anti-Poaching Vault</span>
            <span>•</span>
            <span>MeitY Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
