import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Search,
  Download, LogOut, Settings, Home, CreditCard, Tag, BarChart3,
  Crown, Shield, Moon, Sun, Menu, X, Eye, EyeOff, Mail, Lock,
  ArrowUpCircle, ArrowDownCircle, Utensils, Car, Building, Briefcase,
  Fuel, MoreHorizontal, Smartphone, Banknote, ArrowRightLeft, FileText,
  Sparkles, Users, Ban, CheckCircle2, ArrowLeft, Check, Bell,
  PiggyBank, Target, Loader2
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
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
  }, [dark]);
  return [dark, () => setDark(d => !d)];
};

// =====================================================
// UI KIT
// =====================================================
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20',
    ghost:     'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
    outline:   'border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, icon: Icon, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
      <input
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, children, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
    <select
      className={`w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none ${className}`}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full ${sizes[size]} max-h-[92vh] overflow-y-auto shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const Badge = ({ children, color = 'slate' }) => {
  const map = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    red:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    slate:   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>{children}</span>;
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
      <Icon className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="text-sm text-slate-500 mt-1 mb-4">{description}</p>
    {action}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    blue:    'from-blue-500 to-blue-600 shadow-blue-500/30',
    red:     'from-red-500 to-rose-600 shadow-red-500/30',
    slate:   'from-slate-700 to-slate-900 shadow-slate-900/30',
  };
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-2xl bg-gradient-to-br ${colors[color]} opacity-10`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </Card>
  );
};

// =====================================================
// TELA DE LOGIN / CADASTRO
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Central de Gastos</h1>
              <p className="text-xs font-bold text-emerald-600 tracking-widest">PRO</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Controle financeiro profissional na palma da mão</p>
        </div>

        <Card className="p-6 shadow-2xl shadow-slate-200/40 dark:shadow-black/40">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button onClick={() => { setMode('login'); setError(''); setInfo(''); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'login' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow' : 'text-slate-500'}`}>Entrar</button>
            <button onClick={() => { setMode('register'); setError(''); setInfo(''); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'register' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow' : 'text-slate-500'}`}>Criar conta</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <Input label="Nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />
            )}
            <Input label="E-mail" icon={Mail} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" required />
            {mode !== 'forgot' && (
              <div className="relative">
                <Input label="Senha" icon={Lock} type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" required />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-[38px] p-1 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm"><Ban className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
            {info &&  <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm"><Bell className="w-4 h-4 mt-0.5 shrink-0" />{info}</div>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta grátis' : 'Enviar link de recuperação'}
            </Button>

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }} className="w-full text-center text-sm text-emerald-600 hover:underline">
                Esqueci minha senha
              </button>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => { setMode('login'); setError(''); setInfo(''); }} className="w-full text-center text-sm text-slate-500 hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Voltar para o login
              </button>
            )}
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
      data.push({
        month: monthLabel(k),
        entradas: tx.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0),
        saidas:   tx.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0),
      });
    }
    return data;
  }, [transactions]);

  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTx = transactions.filter(t => new Date(t.date + 'T00:00:00') >= weekAgo);
  const weekIncome  = weekTx.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const weekExpense = weekTx.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);

  const byCategory = categories.map(c => ({
    ...c,
    total: monthTx.filter(t => t.type === 'expense' && t.category_id === c.id).reduce((s, t) => s + +t.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const topCat = byCategory[0];
  const smartInsight = topCat
    ? `Você gastou mais com ${topCat.name.toLowerCase()} este mês (${brl(topCat.total)}).`
    : 'Cadastre seus primeiros lançamentos para ver insights inteligentes.';

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Olá, {(profile?.name || 'usuário').split(' ')[0]} 👋</h2>
        <p className="text-sm text-slate-500">Aqui está o resumo das suas finanças</p>
      </div>

      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-900/40">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Resumo inteligente</p>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{smartInsight}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Saldo total"  value={brl(balance)} icon={Wallet}        color="slate" />
        <StatCard title="Entradas"     value={brl(income)}  icon={TrendingUp}    color="emerald" subtitle="este mês" />
        <StatCard title="Saídas"       value={brl(expense)} icon={TrendingDown}  color="red"     subtitle="este mês" />
        <StatCard title="Resultado"    value={brl(result)}  icon={result >= 0 ? ArrowUpCircle : ArrowDownCircle} color={result >= 0 ? 'emerald' : 'red'} subtitle="este mês" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Evolução mensal</h3>
            <p className="text-xs text-slate-500">Últimos 6 meses</p>
          </div>
          <Badge color="emerald">Entradas vs Saídas</Badge>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(v) => brl(v)} />
            <Area type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2.5} fill="url(#gEnt)" name="Entradas" />
            <Area type="monotone" dataKey="saidas"   stroke="#ef4444" strokeWidth={2.5} fill="url(#gSai)" name="Saídas" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Resumo da semana</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Entradas</span>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{brl(weekIncome)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Saídas</span>
              </div>
              <span className="font-bold text-red-700 dark:text-red-400">{brl(weekExpense)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Saldo</span>
              <span className={`font-black ${weekIncome - weekExpense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {brl(weekIncome - weekExpense)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Lançamentos recentes</h3>
            <button onClick={() => setView('transactions')} className="text-xs font-semibold text-emerald-600 hover:underline">Ver todos</button>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-sm text-slate-500 text-center py-6">Nenhum lançamento ainda.</p>}
            {recent.map(t => {
              const cat = categories.find(c => c.id === t.category_id);
              const Icon = cat ? (CAT_ICONS[cat.icon] || Tag) : Tag;
              return (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}>
                    <Icon className="w-4 h-4" style={{ color: cat?.color || '#94a3b8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.description || cat?.name || 'Sem descrição'}</p>
                    <p className="text-xs text-slate-500">{fmtDate(t.date)} · {cat?.name}</p>
                  </div>
                  <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '−'} {brl(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Lançamentos</h2>
          <p className="text-sm text-slate-500">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => {
          if (!canAdd) return alert('Limite do plano Grátis atingido (100 lançamentos/mês). Faça upgrade!');
          setModal({ type: 'expense', amount: '', date: new Date().toISOString().slice(0, 10), category_id: '', account_id: accounts[0]?.id || '', payment: 'Dinheiro', description: '', attachment: '' });
        }}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input icon={Search} placeholder="Buscar descrição..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Todos os tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </Select>
          <Select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 && <EmptyState icon={FileText} title="Sem lançamentos" description="Cadastre sua primeira entrada ou saída." />}
        {filtered.map(t => {
          const cat = categories.find(c => c.id === t.category_id);
          const acc = accounts.find(a => a.id === t.account_id);
          const Icon = cat ? (CAT_ICONS[cat.icon] || Tag) : Tag;
          return (
            <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}>
                <Icon className="w-5 h-5" style={{ color: cat?.color || '#94a3b8' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{t.description || cat?.name || '—'}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-500">{fmtDate(t.date)}</span>
                  {cat && <Badge color="slate">{cat.name}</Badge>}
                  {acc && <span className="text-xs text-slate-400">· {acc.name}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '−'} {brl(t.amount)}
                </p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <button onClick={() => setModal({ ...t })} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><Edit2 className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={() => { if (window.confirm('Excluir este lançamento?')) onDelete(t.id); }} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                </div>
              </div>
            </div>
          );
        })}
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

  const onDescriptionBlur = () => {
    if (!form.category_id && form.description) {
      const suggested = suggestCategory(form.description, availableCats);
      if (suggested) setSuggestion(suggested);
    }
  };

  const acceptSuggestion = () => { setForm({ ...form, category_id: suggestion.id }); setSuggestion(null); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.amount || +form.amount <= 0) return alert('Informe um valor válido.');
    if (!form.category_id) return alert('Selecione uma categoria.');
    if (!form.account_id) return alert('Selecione uma conta.');
    onSave({ ...form, amount: +form.amount });
  };

  return (
    <Modal open={!!form} onClose={onClose} title={form.id ? 'Editar lançamento' : 'Novo lançamento'} size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setForm({ ...form, type: 'income', category_id: '' })} className={`p-3 rounded-xl border-2 font-semibold transition flex items-center justify-center gap-2 ${form.type === 'income' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
            <ArrowUpCircle className="w-4 h-4" /> Entrada
          </button>
          <button type="button" onClick={() => setForm({ ...form, type: 'expense', category_id: '' })} className={`p-3 rounded-xl border-2 font-semibold transition flex items-center justify-center gap-2 ${form.type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
            <ArrowDownCircle className="w-4 h-4" /> Saída
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Valor (R$)" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
          <Input label="Data" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            onBlur={onDescriptionBlur}
            placeholder="ex: Mercado, Uber, Salário..."
          />
          {suggestion && (
            <button type="button" onClick={acceptSuggestion} className="mt-2 w-full flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm hover:bg-blue-100 transition">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Sugestão: categoria <b>{suggestion.name}</b></span>
              <Check className="w-4 h-4 ml-auto" />
            </button>
          )}
        </div>

        <Select label="Categoria" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Selecionar...</option>
          {availableCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Conta" value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })}>
            <option value="">Selecionar...</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
          <Select label="Pagamento" value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value })}>
            <option>Dinheiro</option>
            <option>Pix</option>
            <option>Débito</option>
            <option>Cartão</option>
            <option>Transferência</option>
            <option>Boleto</option>
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
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Categorias</h2>
          <p className="text-sm text-slate-500">Organize seus lançamentos</p>
        </div>
        <Button onClick={() => setModal({ name: '', color: COLORS[0], icon: ICONS[0], type: 'expense' })}>
          <Plus className="w-4 h-4" /> Nova
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(c => {
          const Icon = CAT_ICONS[c.icon] || Tag;
          return (
            <Card key={c.id} className="p-4 relative group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: c.color + '20' }}>
                <Icon className="w-6 h-6" style={{ color: c.color }} />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
              <p className="text-xs text-slate-500">{c.type === 'income' ? 'Entrada' : c.type === 'expense' ? 'Saída' : 'Ambos'}</p>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setModal({ ...c })} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"><Edit2 className="w-3.5 h-3.5 text-slate-500" /></button>
                <button onClick={() => { if (window.confirm(`Excluir categoria "${c.name}"?`)) onDelete(c.id); }} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
              <option value="expense">Saída</option>
              <option value="income">Entrada</option>
              <option value="both">Ambos</option>
            </Select>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setModal({ ...modal, color: c })} className={`w-9 h-9 rounded-xl ${modal.color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ícone</label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(name => {
                  const Ic = CAT_ICONS[name];
                  return (
                    <button key={name} onClick={() => setModal({ ...modal, icon: name })} className={`aspect-square rounded-xl border-2 flex items-center justify-center ${modal.icon === name ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                      <Ic className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                  );
                })}
              </div>
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
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Contas</h2>
          <p className="text-sm text-slate-500">Carteira, banco, cartão e Pix</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            if (!canTransfer) return alert('Transferência entre contas é exclusiva do plano Pro.');
            if (accounts.length < 2) return alert('Você precisa de pelo menos 2 contas para transferir.');
            setTModal({ fromId: accounts[0]?.id, toId: accounts[1]?.id, amount: '' });
          }}>
            <ArrowRightLeft className="w-4 h-4" /> Transferir
          </Button>
          <Button onClick={() => setModal({ name: '', type: 'wallet', balance: 0 })}>
            <Plus className="w-4 h-4" /> Nova
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map(a => {
          const Icon = ACCOUNT_ICON[a.type] || Wallet;
          const positive = +a.balance >= 0;
          return (
            <Card key={a.id} className="p-5 relative overflow-hidden group">
              <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${positive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${positive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <Icon className={`w-5 h-5 ${positive ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{ACCOUNT_LABEL[a.type]}</p>
              <p className="font-bold text-slate-900 dark:text-white">{a.name}</p>
              <p className={`text-2xl font-black mt-2 ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{brl(a.balance)}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setModal({ ...a })} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"><Edit2 className="w-3.5 h-3.5 text-slate-500" /></button>
                <button onClick={() => { if (window.confirm(`Excluir conta "${a.name}"?`)) onDelete(a.id); }} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal open onClose={() => setModal(null)} title={modal.id ? 'Editar conta' : 'Nova conta'}>
          <div className="space-y-4">
            <Input label="Nome" value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })} placeholder="ex: Itaú Conta Corrente" />
            <Select label="Tipo" value={modal.type} onChange={e => setModal({ ...modal, type: e.target.value })}>
              <option value="wallet">Carteira</option>
              <option value="bank">Banco</option>
              <option value="card">Cartão</option>
              <option value="pix">Pix</option>
            </Select>
            <Input label="Saldo inicial (R$)" type="number" step="0.01" value={modal.balance} onChange={e => setModal({ ...modal, balance: +e.target.value })} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => { if (!modal.name) return alert('Informe o nome.'); onSave(modal); setModal(null); }}>Salvar</Button>
            </div>
          </div>
        </Modal>
      )}

      {tModal && (
        <Modal open onClose={() => setTModal(null)} title="Transferir entre contas">
          <div className="space-y-4">
            <Select label="De" value={tModal.fromId} onChange={e => setTModal({ ...tModal, fromId: e.target.value })}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {brl(a.balance)}</option>)}
            </Select>
            <div className="flex justify-center"><ArrowRightLeft className="w-5 h-5 text-slate-400" /></div>
            <Select label="Para" value={tModal.toId} onChange={e => setTModal({ ...tModal, toId: e.target.value })}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {brl(a.balance)}</option>)}
            </Select>
            <Input label="Valor (R$)" type="number" step="0.01" value={tModal.amount} onChange={e => setTModal({ ...tModal, amount: e.target.value })} placeholder="0,00" />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setTModal(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => {
                if (!+tModal.amount || +tModal.amount <= 0) return alert('Valor inválido.');
                if (tModal.fromId === tModal.toId) return alert('Selecione contas diferentes.');
                onTransfer(tModal.fromId, tModal.toId, +tModal.amount);
                setTModal(null);
              }}>Transferir</Button>
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
      if (period === '3m') {
        const limit = new Date(now); limit.setMonth(limit.getMonth() - 3);
        return d >= limit;
      }
      if (period === 'year') return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, period]);

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);

  const byCategory = categories.map(c => ({
    name: c.name,
    value: filtered.filter(t => t.type === 'expense' && t.category_id === c.id).reduce((s, t) => s + +t.amount, 0),
    color: c.color,
  })).filter(c => c.value > 0);

  const byMonth = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      const k = monthKey(t.date);
      if (!map[k]) map[k] = { month: monthLabel(k), entradas: 0, saidas: 0 };
      if (t.type === 'income') map[k].entradas += +t.amount; else map[k].saidas += +t.amount;
    });
    return Object.values(map);
  }, [filtered]);

  const exportCSV = () => {
    if (!canExport) return alert('Exportação é exclusiva do plano Pro.');
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'];
    const rows = filtered.map(t => {
      const cat = categories.find(c => c.id === t.category_id);
      return [t.date, t.type === 'income' ? 'Entrada' : 'Saída', cat?.name || '', (t.description || '').replace(/,/g, ';'), (+t.amount).toFixed(2)];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-cgpro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Relatórios</h2>
          <p className="text-sm text-slate-500">Analise seus gastos em detalhes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={period} onChange={e => setPeriod(e.target.value)} className="!w-auto">
            <option value="month">Este mês</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="year">Este ano</option>
            <option value="all">Todo o período</option>
          </Select>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Exportar CSV {!canExport && <Crown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard title="Total de entradas" value={brl(income)} icon={TrendingUp} color="emerald" />
        <StatCard title="Total de saídas"   value={brl(expense)} icon={TrendingDown} color="red" />
        <StatCard title="Resultado"          value={brl(income - expense)} icon={Wallet} color={income - expense >= 0 ? 'emerald' : 'red'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Gastos por categoria</h3>
          {byCategory.length === 0 ? (
            <EmptyState icon={BarChart3} title="Sem dados" description="Nenhuma despesa no período selecionado." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name}>
                  {byCategory.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Entradas vs Saídas</h3>
          {byMonth.length === 0 ? (
            <EmptyState icon={BarChart3} title="Sem dados" description="Nenhum lançamento no período." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byMonth} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(v) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="entradas" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="saidas"   fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Ranking de gastos por categoria</h3>
        <div className="space-y-2">
          {byCategory.sort((a, b) => b.value - a.value).map((c, i) => {
            const pct = expense > 0 ? (c.value / expense) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{c.name}</span>
                  <span className="text-slate-500">{brl(c.value)} · {pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                </div>
              </div>
            );
          })}
          {byCategory.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Sem dados para exibir.</p>}
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
    <div className="text-center">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white">Escolha seu plano</h2>
      <p className="text-slate-500 mt-1">Faça upgrade quando quiser. Cancele quando quiser.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLANS.map(p => {
        const current = profile?.plan === p.id;
        return (
          <Card key={p.id} className={`p-6 relative ${p.highlighted ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02]' : ''}`}>
            {p.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                Mais popular
              </div>
            )}
            <h3 className="font-black text-xl text-slate-900 dark:text-white">{p.name}</h3>
            <div className="mt-3 mb-5">
              <span className="text-4xl font-black text-slate-900 dark:text-white">R$ {p.price.toFixed(2).replace('.', ',')}</span>
              {p.price > 0 && <span className="text-slate-500 text-sm">/mês</span>}
            </div>
            <ul className="space-y-2 mb-6 min-h-[180px]">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {current ? (
              <Button variant="outline" className="w-full" disabled>
                <CheckCircle2 className="w-4 h-4" /> Plano atual
              </Button>
            ) : (
              <Button variant={p.highlighted ? 'primary' : 'secondary'} className="w-full" onClick={() => onChangePlan(p.id)}>
                Assinar {p.name}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  </div>
);

// =====================================================
// ADMIN
// =====================================================
const AdminView = ({ users, onUpdateUser }) => {
  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    paying: users.filter(u => u.plan !== 'free').length,
    mrr: users.filter(u => u.plan !== 'free' && u.active).reduce((s, u) => s + (PLANS.find(p => p.id === u.plan)?.price || 0), 0),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Painel Administrativo</h2>
          <p className="text-sm text-slate-500">Gerencie usuários e assinaturas</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total usuários" value={stats.total} icon={Users} color="blue" />
        <StatCard title="Ativos"         value={stats.active} icon={CheckCircle2} color="emerald" />
        <StatCard title="Pagantes"       value={stats.paying} icon={Crown} color="slate" />
        <StatCard title="MRR estimado"   value={brl(stats.mrr)} icon={Banknote} color="emerald" />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Usuários cadastrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left">
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Usuário</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Plano</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">Cadastro</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(u.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <select value={u.plan} onChange={e => onUpdateUser(u.id, { plan: e.target.value })} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 text-xs font-semibold">
                      {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-slate-500 hidden md:table-cell">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">
                    {u.active ? <Badge color="emerald">Ativo</Badge> : <Badge color="red">Bloqueado</Badge>}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onUpdateUser(u.id, { active: !u.active })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${u.active ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                    >
                      {u.active ? 'Bloquear' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Configurações</h2>
        <p className="text-sm text-slate-500">Gerencie sua conta e preferências</p>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Perfil</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-xl font-black">
            {(profile?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{profile?.name}</p>
            <Badge color={profile?.plan === 'pro' ? 'emerald' : profile?.plan === 'basic' ? 'blue' : 'slate'}>
              Plano {PLANS.find(p => p.id === profile?.plan)?.name}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          <Input label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="E-mail" value={form.email} disabled />
          <Button onClick={() => onUpdate({ name: form.name })}>Salvar alterações</Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Aparência</h3>
        <button onClick={toggleDark} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Modo {dark ? 'escuro' : 'claro'}
          </span>
          <div className={`w-11 h-6 rounded-full p-0.5 transition ${dark ? 'bg-emerald-600' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${dark ? 'translate-x-5' : ''}`} />
          </div>
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

  // Loading inicial
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Não logado
  if (!auth.user) {
    return <AuthScreen onLogin={auth.signIn} onRegister={auth.signUp} onReset={auth.resetPassword} />;
  }

  // Carregando dados do usuário
  if (data.loading || !auth.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  // Conta bloqueada
  if (!auth.profile.active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <Card className="p-8 max-w-md text-center">
          <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Conta bloqueada</h2>
          <p className="text-sm text-slate-500 mb-4">Sua conta foi desativada. Entre em contato com o suporte.</p>
          <Button variant="outline" onClick={auth.signOut}>Sair</Button>
        </Card>
      </div>
    );
  }

  const plan = PLANS.find(p => p.id === auth.profile.plan);
  const monthCount = data.transactions.filter(t => monthKey(t.date) === monthKey(new Date())).length;
  const canAddTransaction = auth.profile.plan !== 'free' || monthCount < plan.limit;
  const canExport = auth.profile.plan === 'pro';
  const canTransfer = auth.profile.plan === 'pro';

  const changePlan = (planId) => {
    auth.updateProfile({ plan: planId });
    alert(`Plano alterado para ${PLANS.find(p => p.id === planId).name}! (Em produção: integrar com gateway de pagamento)`);
  };

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',    icon: Home },
    { id: 'transactions', label: 'Lançamentos',  icon: FileText },
    { id: 'categories',   label: 'Categorias',   icon: Tag },
    { id: 'accounts',     label: 'Contas',       icon: CreditCard },
    { id: 'reports',      label: 'Relatórios',   icon: BarChart3 },
    { id: 'plans',        label: 'Planos',       icon: Crown },
    ...(auth.profile.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    { id: 'settings',     label: 'Configurações', icon: Settings },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen sticky top-0 p-5">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black leading-tight">Central de Gastos</h1>
              <p className="text-[10px] font-bold text-emerald-600 tracking-widest">PRO</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${view === item.id ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {auth.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{auth.profile.name}</p>
                <Badge color={auth.profile.plan === 'pro' ? 'emerald' : auth.profile.plan === 'basic' ? 'blue' : 'slate'}>
                  {PLANS.find(p => p.id === auth.profile.plan)?.name}
                </Badge>
              </div>
            </div>
            <button onClick={auth.signOut} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-1.5 rounded-lg">
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* Header mobile */}
          <header className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black leading-tight">Central de Gastos</h1>
                <p className="text-[9px] font-bold text-emerald-600 tracking-widest leading-tight">PRO</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Header desktop */}
          <header className="hidden lg:flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-lg font-bold">{navItems.find(n => n.id === view)?.label}</h1>
            <div className="flex items-center gap-2">
              <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          <div className="p-4 lg:p-6 pb-24 lg:pb-6">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Drawer mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {auth.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold">{auth.profile.name}</p>
                  <p className="text-xs text-slate-500">{auth.profile.email}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${view === item.id ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700' : 'text-slate-600 dark:text-slate-300'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <button onClick={auth.signOut} className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-600 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </aside>
        </div>
      )}

      {/* Bottom Nav mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-5">
          {navItems.slice(0, 5).map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${view === item.id ? 'text-emerald-600' : 'text-slate-500'}`}>
              <item.icon className="w-5 h-5" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
