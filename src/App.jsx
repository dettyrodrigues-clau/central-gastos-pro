import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Search,
  Download, LogOut, Settings, Home, CreditCard, Tag, BarChart3,
  Crown, Shield, Moon, Sun, Menu, X, Eye, EyeOff, Mail, Lock,
  ArrowUpCircle, ArrowDownCircle, Utensils, Car, Building, Briefcase,
  Fuel, MoreHorizontal, Smartphone, Banknote, ArrowRightLeft, FileText,
  Sparkles, Users, Ban, CheckCircle2, ArrowLeft, Check, Bell,
  PiggyBank, Target, Loader2, ChevronRight, Zap
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from 'recharts';
import { useAuth, useUserData, useAdmin } from './useSupabase';

// =====================================================
// UTILITÁRIOS
// =====================================================
const brl = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const parseMoney = (v) => {
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
  return parseFloat(s) || 0;
};
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
const monthKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (key) => {
  const [y, m] = key.split('-');
  return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

const CAT_ICONS = { Utensils, Car, Building, Briefcase, Fuel, MoreHorizontal, PiggyBank, Target, Tag };
const ACCOUNT_ICON = { wallet: Wallet, bank: Building, card: CreditCard, pix: Smartphone };
const ACCOUNT_LABEL = { wallet: 'Carteira', bank: 'Banco', card: 'Cartão', pix: 'Pix' };

const PLANS = [
  { id: 'free',  name: 'Grátis', price: 0,    limit: 100,       features: ['Até 100 lançamentos/mês', 'Dashboard básico', '1 conta', 'Suporte por e-mail'] },
  { id: 'basic', name: 'Básico', price: 19.9, limit: Infinity,  features: ['Lançamentos ilimitados', 'Contas ilimitadas', 'Categorias personalizadas', 'Suporte prioritário'] },
  { id: 'pro',   name: 'Pro',    price: 39.9, limit: Infinity,  features: ['Tudo do Básico', 'Relatórios avançados', 'Exportação CSV/Excel', 'Sugestão inteligente', 'Transferências entre contas', 'Suporte VIP'], highlighted: true },
];

const SUGGESTION_RULES = [
  { match: /mercado|padaria|restaurant|ifood|lanche|pizza|comida/i, name: 'Alimentacao' },
  { match: /uber|99|gasolina|combust|onibus|metro|posto/i, name: 'Transporte' },
  { match: /aluguel|condom|luz|agua|internet|iptu/i, name: 'Moradia' },
  { match: /salario|pagamento|recebimento|freela|venda/i, name: 'Salario' },
  { match: /gas|botij/i, name: 'Gas' },
];

const suggestCategory = (description, categories) => {
  if (!description) return null;
  for (const rule of SUGGESTION_RULES) {
    if (rule.match.test(description)) {
      const cat = categories.find(c => c.name === rule.name);
      if (cat) return cat;
    }
  }
  return null;
};

const useTheme = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
  }, [dark]);
  return [dark, () => setDark(d => !d)];
};

// =====================================================
// UI KIT PREMIUM
// =====================================================
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed select-none';
  const variants = {
    primary:   'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5',
    secondary: 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5',
    ghost:     'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200',
    outline:   'border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800/50',
    danger:    'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, icon: Icon, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />}
      <input
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 rounded-2xl border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${error ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
);

const Select = ({ label, children, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-wider">{label}</label>}
    <select
      className={`w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-3xl w-full ${sizes[size]} max-h-[92vh] overflow-y-auto shadow-2xl border border-zinc-100 dark:border-zinc-800`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10 rounded-t-[2rem] sm:rounded-t-3xl">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="w-4 h-4 text-zinc-500" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const Badge = ({ children, color = 'zinc' }) => {
  const map = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    blue:    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    red:     'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    amber:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    zinc:    'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    purple:  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[color]}`}>{children}</span>;
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-16 px-4">
    <div className="w-14 h-14 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center">
      <Icon className="w-7 h-7 text-zinc-400" />
    </div>
    <h3 className="text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
    <p className="text-sm text-zinc-400 mt-1 mb-5">{description}</p>
    {action}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', light: 'bg-emerald-50 dark:bg-emerald-500/10' },
    blue:    { bg: 'bg-blue-500',    shadow: 'shadow-blue-500/20',    light: 'bg-blue-50 dark:bg-blue-500/10' },
    red:     { bg: 'bg-red-500',     shadow: 'shadow-red-500/20',     light: 'bg-red-50 dark:bg-red-500/10' },
    zinc:    { bg: 'bg-zinc-600 dark:bg-zinc-500', shadow: 'shadow-zinc-500/10', light: 'bg-zinc-100 dark:bg-zinc-800' },
  };
  const c = colors[color] || colors.zinc;
  return (
    <Card className="p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200 cursor-default">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${c.light} group-hover:scale-125 transition-transform duration-300`} />
      <div className={`w-10 h-10 rounded-2xl ${c.bg} shadow-lg ${c.shadow} flex items-center justify-center mb-4 relative z-10`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 relative z-10">{title}</p>
      <p className="text-xl font-black text-zinc-900 dark:text-white tabular-nums relative z-10">{value}</p>
      {subtitle && <p className="text-xs text-zinc-400 mt-0.5 relative z-10">{subtitle}</p>}
    </Card>
  );
};

const HeroBalanceCard = ({ balance, income, expense, name }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-6 text-white shadow-2xl shadow-emerald-500/30">
    <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
    <div className="absolute right-4 bottom-4 w-24 h-24 rounded-full bg-black/5 pointer-events-none" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-white/80 text-sm font-medium">Saldo total</span>
        </div>
        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <Zap className="w-3 h-3" /><span className="text-xs font-bold">PRO</span>
        </div>
      </div>
      <p className="text-4xl font-black tabular-nums tracking-tight mb-1">{brl(balance)}</p>
      <p className="text-white/70 text-sm mb-5">Olá, {(name || 'usuário').split(' ')[0]}! 👋</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpCircle className="w-3.5 h-3.5 text-white/80" />
            <span className="text-white/70 text-xs font-medium">Entradas</span>
          </div>
          <p className="text-white font-bold tabular-nums text-sm">{brl(income)}</p>
        </div>
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownCircle className="w-3.5 h-3.5 text-white/80" />
            <span className="text-white/70 text-xs font-medium">Saídas</span>
          </div>
          <p className="text-white font-bold tabular-nums text-sm">{brl(expense)}</p>
        </div>
      </div>
    </div>
  </div>
);

// =====================================================
// AUTH
// =====================================================
const AuthScreen = ({ onLogin, onRegister, onReset }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await onLogin(form.email, form.password);
        if (error) setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message);
      } else if (mode === 'register') {
        if (!form.name || form.password.length < 6) { setError('Preencha o nome e use senha de pelo menos 6 caracteres.'); setLoading(false); return; }
        const { error } = await onRegister(form.email, form.password, form.name);
        if (error) setError(error.message); else setInfo('Conta criada! Você já pode entrar.');
      } else {
        const { error } = await onReset(form.email);
        if (error) setError(error.message); else setInfo('Se o e-mail existir, você receberá instruções de recuperação.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">Central de<br />Gastos</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-bold text-emerald-500 tracking-widest">PRO</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-500">Controle financeiro inteligente</p>
        </div>
        <Card className="p-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/30">
          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-6">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setInfo(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === m ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && <Input label="Nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />}
            <Input label="E-mail" icon={Mail} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" required />
            {mode !== 'forgot' && (
              <div className="relative">
                <Input label="Senha" icon={Lock} type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3.5 top-[38px] p-1 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
            {error && <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm"><Ban className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
            {info && <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm"><Check className="w-4 h-4 mt-0.5 shrink-0" />{info}</div>}
            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              {mode === 'login' ? 'Entrar na conta' : mode === 'register' ? 'Criar conta grátis' : 'Enviar link'}
            </Button>
            {mode === 'login' && <button type="button" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }} className="w-full text-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Esqueci minha senha</button>}
            {mode === 'forgot' && <button type="button" onClick={() => { setMode('login'); setError(''); setInfo(''); }} className="w-full text-center text-sm text-zinc-500 hover:underline flex items-center justify-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login</button>}
          </form>
        </Card>
      </div>
    </div>
  );
};

// =====================================================
// DASHBOARD
// =====================================================
const Dashboard = ({ transactions, accounts, categories, profile, setView }) => {
  const now = new Date();
  const thisMonth = monthKey(now);
  const monthTx = transactions.filter(t => monthKey(t.date) === thisMonth);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
  const balance = accounts.reduce((s, a) => s + +a.balance, 0);
  const result = income - expense;

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = monthKey(d);
      const tx = transactions.filter(t => monthKey(t.date) === k);
      data.push({ month: monthLabel(k), entradas: tx.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0), saidas: tx.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0) });
    }
    return data;
  }, [transactions]);

  const byCategory = categories.map(c => ({ ...c, total: monthTx.filter(t => t.type === 'expense' && t.category_id === c.id).reduce((s, t) => s + +t.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const topCat = byCategory[0];
  const smartInsight = topCat ? `Você gastou mais com ${topCat.name.toLowerCase()} este mês (${brl(topCat.total)}).` : 'Cadastre seus primeiros lançamentos para ver insights.';
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-4">
      <HeroBalanceCard balance={balance} income={income} expense={expense} name={profile?.name} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Resultado" value={brl(result)} icon={result >= 0 ? TrendingUp : TrendingDown} color={result >= 0 ? 'emerald' : 'red'} subtitle="este mês" />
        <StatCard title="Lançamentos" value={monthTx.length} icon={FileText} color="blue" subtitle="este mês" />
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5">Insight do mês</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{smartInsight}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-bold text-zinc-900 dark:text-white">Evolução mensal</h3><p className="text-xs text-zinc-400 mt-0.5">Últimos 6 meses</p></div>
          <Badge color="emerald">6 meses</Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gEnt2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              <linearGradient id="gSai2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} formatter={(v) => [brl(v)]} />
            <Area type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} fill="url(#gEnt2)" name="Entradas" dot={false} />
            <Area type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} fill="url(#gSai2)" name="Saídas" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {byCategory.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Top categorias</h3>
          <div className="space-y-3">
            {byCategory.slice(0, 4).map((c) => {
              const pct = expense > 0 ? (c.total / expense) * 100 : 0;
              const Icon = CAT_ICONS[c.icon] || Tag;
              return (
                <div key={c.id}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: c.color + '20' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{c.name}</span>
                      <span className="text-xs font-bold text-zinc-400 tabular-nums">{brl(c.total)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden ml-10">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-zinc-900 dark:text-white">Recentes</h3>
          <button onClick={() => setView('transactions')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">Ver todos <ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {recent.length === 0 && <div className="py-10 text-center text-sm text-zinc-400">Nenhum lançamento ainda.</div>}
          {recent.map(t => {
            const cat = categories.find(c => c.id === t.category_id);
            const Icon = cat ? (CAT_ICONS[cat.icon] || Tag) : Tag;
            return (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: (cat?.color || '#a1a1aa') + '20' }}>
                  <Icon className="w-5 h-5" style={{ color: cat?.color || '#a1a1aa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{t.description || cat?.name || 'Sem descrição'}</p>
                  <p className="text-xs text-zinc-400">{fmtDate(t.date)}</p>
                </div>
                <span className={`font-bold text-sm tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {t.type === 'income' ? '+' : '−'}{brl(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// =====================================================
// LANÇAMENTOS
// =====================================================
const TransactionsView = ({ transactions, categories, accounts, onSave, onDelete, canAdd }) => {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCat !== 'all' && t.category_id !== filterCat) return false;
    if (search && !(t.description || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-2xl font-black text-zinc-900 dark:text-white">Lançamentos</h2><p className="text-sm text-zinc-400">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p></div>
        <Button onClick={() => { if (!canAdd) return alert('Limite atingido!'); setModal({ type: 'expense', amount: '', date: new Date().toISOString().slice(0, 10), category_id: '', account_id: accounts[0]?.id || '', payment: 'Dinheiro', description: '' }); }}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input icon={Search} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Todos os tipos</option><option value="income">Entradas</option><option value="expense">Saídas</option>
          </Select>
          <Select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        {filtered.length === 0 && <EmptyState icon={FileText} title="Sem lançamentos" description="Cadastre sua primeira entrada ou saída." />}
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {filtered.map(t => {
            const cat = categories.find(c => c.id === t.category_id);
            const acc = accounts.find(a => a.id === t.account_id);
            const Icon = cat ? (CAT_ICONS[cat.icon] || Tag) : Tag;
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: (cat?.color || '#a1a1aa') + '20' }}>
                  <Icon className="w-5 h-5" style={{ color: cat?.color || '#a1a1aa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-white truncate">{t.description || cat?.name || '—'}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-zinc-400">{fmtDate(t.date)}</span>
                    {cat && <Badge color="zinc">{cat.name}</Badge>}
                    {acc && <span className="text-xs text-zinc-400">· {acc.name}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {t.type === 'income' ? '+' : '−'}{brl(t.amount)}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-1.5">
                    <button onClick={() => setModal({ ...t })} className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><Edit2 className="w-3.5 h-3.5 text-zinc-400" /></button>
                    <button onClick={() => { if (window.confirm('Excluir?')) onDelete(t.id); }} className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <TransactionModal data={modal} categories={categories} accounts={accounts} onClose={() => setModal(null)} onSave={(t) => { onSave(t); setModal(null); }} />
    </div>
  );
};

const TransactionModal = ({ data, categories, accounts, onClose, onSave }) => {
  const [form, setForm] = useState(data || null);
  const [suggestion, setSuggestion] = useState(null);
  useEffect(() => { setForm(data); setSuggestion(null); }, [data]);
  if (!form) return null;
  const availableCats = categories.filter(c => c.type === 'both' || c.type === form.type);
  const onDescriptionBlur = () => { if (!form.category_id && form.description) { const s = suggestCategory(form.description, availableCats); if (s) setSuggestion(s); } };
  const acceptSuggestion = () => { setForm({ ...form, category_id: suggestion.id }); setSuggestion(null); };
  const submit = (e) => {
    e.preventDefault();
    const parsed = parseMoney(form.amount);
    if (!parsed || parsed <= 0) return alert('Informe um valor válido.');
    if (!form.category_id) return alert('Selecione uma categoria.');
    if (!form.account_id) return alert('Selecione uma conta.');
    onSave({ ...form, amount: parsed });
  };
  return (
    <Modal open={!!form} onClose={onClose} title={form.id ? 'Editar lançamento' : 'Novo lançamento'} size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[{ type: 'income', label: 'Entrada', icon: ArrowUpCircle, a: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' }, { type: 'expense', label: 'Saída', icon: ArrowDownCircle, a: 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' }].map(opt => (
            <button key={opt.type} type="button" onClick={() => setForm({ ...form, type: opt.type, category_id: '' })}
              className={`p-3.5 rounded-2xl border-2 font-semibold transition-all flex items-center justify-center gap-2 text-sm ${form.type === opt.type ? opt.a : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}>
              <opt.icon className="w-4 h-4" /> {opt.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Valor (R$)" type="text" inputMode="decimal" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value.replace(/[^0-9,\.]/g, '') })} onBlur={e => setForm({ ...form, amount: parseMoney(e.target.value) })} placeholder="0,00" />
          <Input label="Data" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-wider">Descrição</label>
          <input className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} onBlur={onDescriptionBlur} placeholder="ex: Mercado, Uber, Salário..." />
          {suggestion && <button type="button" onClick={acceptSuggestion} className="mt-2 w-full flex items-center gap-2 p-3 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-sm"><Sparkles className="w-4 h-4 shrink-0" /><span>Sugestão: <b>{suggestion.name}</b></span><Check className="w-4 h-4 ml-auto" /></button>}
        </div>
        <Select label="Categoria" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Selecionar categoria...</option>
          {availableCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Conta" value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })}>
            <option value="">Selecionar...</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
          <Select label="Pagamento" value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value })}>
            <option>Dinheiro</option><option>Pix</option><option>Débito</option><option>Cartão</option><option>Transferência</option><option>Boleto</option>
          </Select>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{form.id ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// =====================================================
// CATEGORIAS
// =====================================================
const CategoriesView = ({ categories, onSave, onDelete }) => {
  const [modal, setModal] = useState(null);
  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6b7280'];
  const ICONS = Object.keys(CAT_ICONS);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-black text-zinc-900 dark:text-white">Categorias</h2><p className="text-sm text-zinc-400">Organize seus lançamentos</p></div>
        <Button onClick={() => setModal({ name: '', color: COLORS[0], icon: ICONS[0], type: 'expense' })}><Plus className="w-4 h-4" /> Nova</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(c => {
          const Icon = CAT_ICONS[c.icon] || Tag;
          return (
            <Card key={c.id} className="p-4 relative group hover:scale-[1.02] transition-transform duration-200">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: c.color + '20' }}><Icon className="w-6 h-6" style={{ color: c.color }} /></div>
              <p className="font-bold text-zinc-900 dark:text-white text-sm">{c.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{c.type === 'income' ? 'Entrada' : c.type === 'expense' ? 'Saída' : 'Ambos'}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal({ ...c })} className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Edit2 className="w-3 h-3 text-zinc-500" /></button>
                <button onClick={() => { if (window.confirm(`Excluir "${c.name}"?`)) onDelete(c.id); }} className="p-1.5 rounded-xl bg-red-50 dark:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-500" /></button>
              </div>
            </Card>
          );
        })}
      </div>
      {modal && (
        <Modal open onClose={() => setModal(null)} title={modal.id ? 'Editar categoria' : 'Nova categoria'}>
          <div className="space-y-4">
            <Input label="Nome" value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })} placeholder="ex: Lazer" />
            <Select label="Tipo" value={modal.type} onChange={e => setModal({ ...modal, type: e.target.value })}>
              <option value="expense">Saída</option><option value="income">Entrada</option><option value="both">Ambos</option>
            </Select>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Cor</label>
              <div className="flex flex-wrap gap-2">{COLORS.map(c => <button key={c} onClick={() => setModal({ ...modal, color: c })} className={`w-9 h-9 rounded-2xl hover:scale-110 transition-transform ${modal.color === c ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white scale-110' : ''}`} style={{ backgroundColor: c }} />)}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Ícone</label>
              <div className="grid grid-cols-6 gap-2">{ICONS.map(name => { const Ic = CAT_ICONS[name]; return <button key={name} onClick={() => setModal({ ...modal, icon: name })} className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all ${modal.icon === name ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20' : 'border-zinc-200 dark:border-zinc-700'}`}><Ic className="w-4 h-4 text-zinc-600 dark:text-zinc-300" /></button>; })}</div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => { if (!modal.name) return alert('Informe o nome.'); onSave(modal); setModal(null); }}>Salvar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// =====================================================
// CONTAS
// =====================================================
const AccountsView = ({ accounts, onSave, onDelete, onTransfer, canTransfer }) => {
  const [modal, setModal] = useState(null);
  const [tModal, setTModal] = useState(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-black text-zinc-900 dark:text-white">Contas</h2><p className="text-sm text-zinc-400">Carteira, banco, cartão e Pix</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { if (!canTransfer) return alert('Exclusivo do plano Pro.'); if (accounts.length < 2) return alert('Você precisa de pelo menos 2 contas.'); setTModal({ fromId: accounts[0]?.id, toId: accounts[1]?.id, amount: '' }); }}><ArrowRightLeft className="w-4 h-4" /> Transferir</Button>
          <Button onClick={() => setModal({ name: '', type: 'wallet', balance: '' })}><Plus className="w-4 h-4" /> Nova</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map(a => {
          const Icon = ACCOUNT_ICON[a.type] || Wallet;
          const positive = +a.balance >= 0;
          return (
            <Card key={a.id} className="p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
              <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${positive ? 'bg-emerald-500/8' : 'bg-red-500/8'} group-hover:scale-125 transition-transform duration-300`} />
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${positive ? 'bg-emerald-50 dark:bg-emerald-500/20' : 'bg-red-50 dark:bg-red-500/20'}`}><Icon className={`w-5 h-5 ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} /></div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{ACCOUNT_LABEL[a.type]}</p>
              <p className="font-bold text-zinc-900 dark:text-white mt-0.5">{a.name}</p>
              <p className={`text-2xl font-black mt-2 tabular-nums ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{brl(a.balance)}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal({ ...a })} className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Edit2 className="w-3.5 h-3.5 text-zinc-500" /></button>
                <button onClick={() => { if (window.confirm(`Excluir "${a.name}"?`)) onDelete(a.id); }} className="p-1.5 rounded-xl bg-red-50 dark:bg-red-900/30"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </Card>
          );
        })}
      </div>
      {modal && (
        <Modal open onClose={() => setModal(null)} title={modal.id ? 'Editar conta' : 'Nova conta'}>
          <div className="space-y-4">
            <Input label="Nome" value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })} placeholder="ex: Itaú" />
            <Select label="Tipo" value={modal.type} onChange={e => setModal({ ...modal, type: e.target.value })}>
              <option value="wallet">Carteira</option><option value="bank">Banco</option><option value="card">Cartão</option><option value="pix">Pix</option>
            </Select>
            <Input label="Saldo inicial (R$)" type="text" inputMode="decimal" value={modal.balance} onChange={e => setModal({ ...modal, balance: e.target.value.replace(/[^0-9,\.\-]/g, '') })} onBlur={e => setModal({ ...modal, balance: parseMoney(e.target.value) })} placeholder="0,00" />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => { if (!modal.name) return alert('Informe o nome.'); onSave({ ...modal, balance: parseMoney(modal.balance) }); setModal(null); }}>Salvar</Button>
            </div>
          </div>
        </Modal>
      )}
      {tModal && (
        <Modal open onClose={() => setTModal(null)} title="Transferir entre contas">
          <div className="space-y-4">
            <Select label="De" value={tModal.fromId} onChange={e => setTModal({ ...tModal, fromId: e.target.value })}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {brl(a.balance)}</option>)}</Select>
            <div className="flex justify-center"><div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><ArrowRightLeft className="w-4 h-4 text-zinc-400" /></div></div>
            <Select label="Para" value={tModal.toId} onChange={e => setTModal({ ...tModal, toId: e.target.value })}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {brl(a.balance)}</option>)}</Select>
            <Input label="Valor (R$)" type="text" inputMode="decimal" value={tModal.amount} onChange={e => setTModal({ ...tModal, amount: e.target.value.replace(/[^0-9,\.]/g, '') })} onBlur={e => setTModal({ ...tModal, amount: parseMoney(e.target.value) })} placeholder="0,00" />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setTModal(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => { const val = parseMoney(tModal.amount); if (!val || val <= 0) return alert('Valor inválido.'); if (tModal.fromId === tModal.toId) return alert('Contas iguais.'); onTransfer(tModal.fromId, tModal.toId, val); setTModal(null); }}>Transferir</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// =====================================================
// RELATÓRIOS
// =====================================================
const ReportsView = ({ transactions, categories, canExport }) => {
  const [period, setPeriod] = useState('month');
  const now = new Date();
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === '3m') { const l = new Date(now); l.setMonth(l.getMonth() - 3); return d >= l; }
      if (period === 'year') return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, period]);
  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
  const byCategory = categories.map(c => ({ name: c.name, value: filtered.filter(t => t.type === 'expense' && t.category_id === c.id).reduce((s, t) => s + +t.amount, 0), color: c.color })).filter(c => c.value > 0);
  const byMonth = useMemo(() => { const map = {}; filtered.forEach(t => { const k = monthKey(t.date); if (!map[k]) map[k] = { month: monthLabel(k), entradas: 0, saidas: 0 }; if (t.type === 'income') map[k].entradas += +t.amount; else map[k].saidas += +t.amount; }); return Object.values(map); }, [filtered]);
  const exportCSV = () => {
    if (!canExport) return alert('Exportação é exclusiva do plano Pro.');
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'];
    const rows = filtered.map(t => { const cat = categories.find(c => c.id === t.category_id); return [t.date, t.type === 'income' ? 'Entrada' : 'Saída', cat?.name || '', (t.description || '').replace(/,/g, ';'), (+t.amount).toFixed(2)]; });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `relatorio-cgpro-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-black text-zinc-900 dark:text-white">Relatórios</h2><p className="text-sm text-zinc-400">Analise seus gastos</p></div>
        <div className="flex gap-2 flex-wrap">
          <Select value={period} onChange={e => setPeriod(e.target.value)} className="!w-auto"><option value="month">Este mês</option><option value="3m">Últimos 3 meses</option><option value="year">Este ano</option><option value="all">Todo o período</option></Select>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4" /> CSV {!canExport && <Crown className="w-3 h-3" />}</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard title="Entradas" value={brl(income)} icon={TrendingUp} color="emerald" />
        <StatCard title="Saídas" value={brl(expense)} icon={TrendingDown} color="red" />
        <StatCard title="Resultado" value={brl(income - expense)} icon={Wallet} color={income - expense >= 0 ? 'emerald' : 'red'} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Gastos por categoria</h3>
          {byCategory.length === 0 ? <EmptyState icon={BarChart3} title="Sem dados" description="Nenhuma despesa no período." /> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart><Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>{byCategory.map((c, i) => <Cell key={i} fill={c.color} />)}</Pie><Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} /></PieChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Entradas vs Saídas</h3>
          {byMonth.length === 0 ? <EmptyState icon={BarChart3} title="Sem dados" description="Nenhum lançamento no período." /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byMonth} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} formatter={(v) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="entradas" fill="#10b981" radius={[8, 8, 0, 0]} /><Bar dataKey="saidas" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Ranking por categoria</h3>
        <div className="space-y-3">
          {byCategory.sort((a, b) => b.value - a.value).map((c, i) => { const pct = expense > 0 ? (c.value / expense) * 100 : 0; return (
            <div key={i}><div className="flex items-center justify-between text-sm mb-1.5"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} /><span className="font-semibold text-zinc-700 dark:text-zinc-300">{c.name}</span></div><span className="text-zinc-400 tabular-nums">{brl(c.value)} · {pct.toFixed(1)}%</span></div><div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} /></div></div>
          ); })}
          {byCategory.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">Sem dados para exibir.</p>}
        </div>
      </Card>
    </div>
  );
};

// =====================================================
// PLANOS
// =====================================================
const PlansView = ({ profile, onChangePlan }) => (
  <div className="space-y-6">
    <div className="text-center"><h2 className="text-3xl font-black text-zinc-900 dark:text-white">Planos</h2><p className="text-zinc-400 mt-1">Faça upgrade quando quiser.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLANS.map(p => { const current = profile?.plan === p.id; return (
        <Card key={p.id} className={`p-6 relative ${p.highlighted ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20' : ''}`}>
          {p.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-xs font-bold uppercase tracking-wider shadow-lg">Mais popular</div>}
          <h3 className="font-black text-xl text-zinc-900 dark:text-white">{p.name}</h3>
          <div className="mt-3 mb-5"><span className="text-4xl font-black text-zinc-900 dark:text-white tabular-nums">R$ {p.price.toFixed(2).replace('.', ',')}</span>{p.price > 0 && <span className="text-zinc-400 text-sm">/mês</span>}</div>
          <ul className="space-y-2.5 mb-6 min-h-[180px]">{p.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"><div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" /></div><span>{f}</span></li>)}</ul>
          {current ? <Button variant="outline" className="w-full" disabled><CheckCircle2 className="w-4 h-4" /> Plano atual</Button> : <Button variant={p.highlighted ? 'primary' : 'secondary'} className="w-full" onClick={() => onChangePlan(p.id)}>Assinar {p.name}</Button>}
        </Card>
      ); })}
    </div>
  </div>
);

// =====================================================
// ADMIN
// =====================================================
const AdminView = ({ users, onUpdateUser }) => {
  const stats = { total: users.length, active: users.filter(u => u.active).length, paying: users.filter(u => u.plan !== 'free').length, mrr: users.filter(u => u.plan !== 'free' && u.active).reduce((s, u) => s + (PLANS.find(p => p.id === u.plan)?.price || 0), 0) };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center"><Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div><div><h2 className="text-2xl font-black text-zinc-900 dark:text-white">Admin</h2><p className="text-sm text-zinc-400">Gerencie usuários</p></div></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><StatCard title="Usuários" value={stats.total} icon={Users} color="blue" /><StatCard title="Ativos" value={stats.active} icon={CheckCircle2} color="emerald" /><StatCard title="Pagantes" value={stats.paying} icon={Crown} color="zinc" /><StatCard title="MRR" value={brl(stats.mrr)} icon={Banknote} color="emerald" /></div>
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800"><h3 className="font-bold text-zinc-900 dark:text-white">Usuários</h3></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-zinc-50 dark:bg-zinc-800/50"><tr>{['Usuário', 'Plano', 'Cadastro', 'Status', 'Ações'].map(h => <th key={h} className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider text-left">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">{users.map(u => (
            <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{(u.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('')}</div><div><p className="font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">{u.name}</p><p className="text-xs text-zinc-400 truncate max-w-[120px]">{u.email}</p></div></div></td>
              <td className="px-4 py-3"><select value={u.plan} onChange={e => onUpdateUser(u.id, { plan: e.target.value })} className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300">{PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
              <td className="px-4 py-3 text-zinc-400 text-xs">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
              <td className="px-4 py-3">{u.active ? <Badge color="emerald">Ativo</Badge> : <Badge color="red">Bloqueado</Badge>}</td>
              <td className="px-4 py-3"><button onClick={() => onUpdateUser(u.id, { active: !u.active })} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${u.active ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>{u.active ? 'Bloquear' : 'Ativar'}</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      </Card>
    </div>
  );
};

// =====================================================
// CONFIGURAÇÕES
// =====================================================
const SettingsView = ({ profile, onUpdate, dark, toggleDark }) => {
  const [form, setForm] = useState({ name: profile?.name || '', email: profile?.email || '' });
  return (
    <div className="space-y-4 max-w-2xl">
      <div><h2 className="text-2xl font-black text-zinc-900 dark:text-white">Configurações</h2><p className="text-sm text-zinc-400">Gerencie sua conta</p></div>
      <Card className="p-5">
        <h3 className="font-bold text-zinc-900 dark:text-white mb-5">Perfil</h3>
        <div className="flex items-center gap-4 mb-5"><div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/20">{(profile?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('')}</div><div><p className="font-bold text-zinc-900 dark:text-white">{profile?.name}</p><Badge color={profile?.plan === 'pro' ? 'emerald' : profile?.plan === 'basic' ? 'blue' : 'zinc'}>Plano {PLANS.find(p => p.id === profile?.plan)?.name}</Badge></div></div>
        <div className="space-y-3"><Input label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /><Input label="E-mail" value={form.email} disabled className="opacity-60" /><Button onClick={() => onUpdate({ name: form.name })}>Salvar alterações</Button></div>
      </Card>
      <Card className="p-5">
        <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Aparência</h3>
        <button onClick={toggleDark} className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors">
          <span className="flex items-center gap-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200"><div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">{dark ? <Moon className="w-4 h-4 text-zinc-500" /> : <Sun className="w-4 h-4 text-zinc-500" />}</div>Modo {dark ? 'escuro' : 'claro'}</span>
          <div className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 ${dark ? 'bg-emerald-500' : 'bg-zinc-300'}`}><div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${dark ? 'translate-x-6' : ''}`} /></div>
        </button>
      </Card>
    </div>
  );
};

// =====================================================
// APP PRINCIPAL
// =====================================================
export default function App() {
  const [dark, toggleDark] = useTheme();
  const auth = useAuth();
  const data = useUserData(auth.user?.id);
  const admin = useAdmin(auth.profile?.role === 'admin');
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (auth.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30"><Wallet className="w-6 h-6 text-white" /></div>
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
      </div>
    </div>
  );

  if (!auth.user) return <AuthScreen onLogin={auth.signIn} onRegister={auth.signUp} onReset={auth.resetPassword} />;

  if (data.loading || !auth.profile) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" /><p className="text-sm text-zinc-400">Carregando seus dados...</p></div>
    </div>
  );

  if (!auth.profile.active) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <Card className="p-8 max-w-sm text-center"><div className="w-12 h-12 rounded-3xl bg-red-50 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4"><Ban className="w-6 h-6 text-red-500" /></div><h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Conta bloqueada</h2><p className="text-sm text-zinc-400 mb-5">Sua conta foi desativada.</p><Button variant="outline" onClick={auth.signOut}>Sair</Button></Card>
    </div>
  );

  const plan = PLANS.find(p => p.id === auth.profile.plan);
  const monthCount = data.transactions.filter(t => monthKey(t.date) === monthKey(new Date())).length;
  const canAddTransaction = auth.profile.plan !== 'free' || monthCount < plan.limit;
  const canExport = auth.profile.plan === 'pro';
  const canTransfer = auth.profile.plan === 'pro';
  const changePlan = (planId) => { auth.updateProfile({ plan: planId }); alert(`Plano alterado para ${PLANS.find(p => p.id === planId).name}!`); };

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',   icon: Home },
    { id: 'transactions', label: 'Lançamentos', icon: FileText },
    { id: 'categories',   label: 'Categorias',  icon: Tag },
    { id: 'accounts',     label: 'Contas',      icon: CreditCard },
    { id: 'reports',      label: 'Relatórios',  icon: BarChart3 },
    { id: 'plans',        label: 'Planos',      icon: Crown },
    ...(auth.profile.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    { id: 'settings',     label: 'Config',      icon: Settings },
  ];

  const renderView = () => {
    switch (view) {
      case 'dashboard':    return <Dashboard transactions={data.transactions} accounts={data.accounts} categories={data.categories} profile={auth.profile} setView={setView} />;
      case 'transactions': return <TransactionsView transactions={data.transactions} categories={data.categories} accounts={data.accounts} onSave={data.saveTransaction} onDelete={data.deleteTransaction} canAdd={canAddTransaction} />;
      case 'categories':   return <CategoriesView categories={data.categories} onSave={data.saveCategory} onDelete={data.deleteCategory} />;
      case 'accounts':     return <AccountsView accounts={data.accounts} onSave={data.saveAccount} onDelete={data.deleteAccount} onTransfer={data.transfer} canTransfer={canTransfer} />;
      case 'reports':      return <ReportsView transactions={data.transactions} categories={data.categories} canExport={canExport} />;
      case 'plans':        return <PlansView profile={auth.profile} onChangePlan={changePlan} />;
      case 'admin':        return <AdminView users={admin.users} onUpdateUser={admin.updateUser} />;
      case 'settings':     return <SettingsView profile={auth.profile} onUpdate={auth.updateProfile} dark={dark} toggleDark={toggleDark} />;
      default:             return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-200">
      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 min-h-screen sticky top-0">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25"><Wallet className="w-5 h-5 text-white" /></div>
              <div><h1 className="text-sm font-black text-zinc-900 dark:text-white leading-tight">Central de Gastos</h1><div className="flex items-center gap-1 mt-0.5"><div className="w-1 h-1 rounded-full bg-emerald-500" /><p className="text-[9px] font-bold text-emerald-500 tracking-widest">PRO</p></div></div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${view === item.id ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'}`}>
                <item.icon className="w-4 h-4 shrink-0" />{item.label}
                {view === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold shrink-0">{auth.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{auth.profile.name}</p><Badge color={auth.profile.plan === 'pro' ? 'emerald' : auth.profile.plan === 'basic' ? 'blue' : 'zinc'}>{PLANS.find(p => p.id === auth.profile.plan)?.name}</Badge></div>
              </div>
              <button onClick={auth.signOut} className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-500 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><LogOut className="w-3.5 h-3.5" /> Sair</button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* Header Mobile */}
          <header className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center"><Wallet className="w-4 h-4 text-white" /></div>
              <div><h1 className="text-sm font-black text-zinc-900 dark:text-white">Central de Gastos</h1><p className="text-[9px] font-bold text-emerald-500 tracking-widest">PRO</p></div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{dark ? <Sun className="w-4 h-4 text-zinc-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}</button>
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><Menu className="w-5 h-5 text-zinc-500" /></button>
            </div>
          </header>

          {/* Header Desktop */}
          <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">{navItems.find(n => n.id === view)?.label}</h1>
            <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{dark ? <Sun className="w-4 h-4 text-zinc-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}</button>
          </header>

          <div className="p-4 lg:p-6 pb-28 lg:pb-8">{renderView()}</div>
        </main>
      </div>

      {/* Drawer Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-900 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">{auth.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                <div><p className="text-sm font-bold text-zinc-900 dark:text-white">{auth.profile.name}</p><p className="text-xs text-zinc-400 truncate max-w-[140px]">{auth.profile.email}</p></div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <nav className="p-3 space-y-0.5">
              {navItems.map(item => (
                <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${view === item.id ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-100 dark:border-zinc-800">
              <button onClick={auth.signOut} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-500 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"><LogOut className="w-4 h-4" /> Sair da conta</button>
            </div>
          </aside>
        </div>
      )}

      {/* Bottom Nav Mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 px-2 py-1">
        <div className="grid grid-cols-5 max-w-sm mx-auto">
          {navItems.slice(0, 5).map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-all ${view === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
              <div className={`p-1.5 rounded-xl transition-all ${view === item.id ? 'bg-emerald-50 dark:bg-emerald-500/15' : ''}`}><item.icon className="w-5 h-5" /></div>
              <span className="text-[9px] font-semibold leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
