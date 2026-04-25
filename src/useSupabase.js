import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// =====================================================
// HOOK DE AUTENTICAÇÃO
// =====================================================
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Escuta mudanças de login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const updateProfile = async (updates) => {
    if (!user) return
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (!error) setProfile(prev => ({ ...prev, ...updates }))
    return { error }
  }

  return { user, profile, loading, signUp, signIn, signOut, resetPassword, updateProfile }
}

// =====================================================
// HOOK DE DADOS DO USUÁRIO (categorias, contas, lançamentos)
// =====================================================
export const useUserData = (userId) => {
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    loadAll()
  }, [userId])

  const loadAll = async () => {
    setLoading(true)
    const [cats, accs, txs] = await Promise.all([
      supabase.from('categories').select('*').order('created_at'),
      supabase.from('accounts').select('*').order('created_at'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
    ])
    setCategories(cats.data || [])
    setAccounts(accs.data || [])
    setTransactions(txs.data || [])
    setLoading(false)
  }

  // ----- CATEGORIAS -----
  const saveCategory = async (cat) => {
    if (cat.id) {
      const { data } = await supabase.from('categories').update({
        name: cat.name, color: cat.color, icon: cat.icon, type: cat.type
      }).eq('id', cat.id).select().single()
      if (data) setCategories(prev => prev.map(c => c.id === data.id ? data : c))
    } else {
      const { data } = await supabase.from('categories').insert({
        user_id: userId, name: cat.name, color: cat.color, icon: cat.icon, type: cat.type
      }).select().single()
      if (data) setCategories(prev => [...prev, data])
    }
  }

  const deleteCategory = async (id) => {
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  // ----- CONTAS -----
  const saveAccount = async (acc) => {
    if (acc.id) {
      const { data } = await supabase.from('accounts').update({
        name: acc.name, type: acc.type, balance: acc.balance
      }).eq('id', acc.id).select().single()
      if (data) setAccounts(prev => prev.map(a => a.id === data.id ? data : a))
    } else {
      const { data } = await supabase.from('accounts').insert({
        user_id: userId, name: acc.name, type: acc.type, balance: acc.balance
      }).select().single()
      if (data) setAccounts(prev => [...prev, data])
    }
  }

  const deleteAccount = async (id) => {
    await supabase.from('accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  const transfer = async (fromId, toId, amount) => {
    const from = accounts.find(a => a.id === fromId)
    const to = accounts.find(a => a.id === toId)
    if (!from || !to) return
    await supabase.from('accounts').update({ balance: from.balance - amount }).eq('id', fromId)
    await supabase.from('accounts').update({ balance: to.balance + amount }).eq('id', toId)
    setAccounts(prev => prev.map(a => {
      if (a.id === fromId) return { ...a, balance: a.balance - amount }
      if (a.id === toId) return { ...a, balance: a.balance + amount }
      return a
    }))
  }

  // ----- LANÇAMENTOS -----
  const saveTransaction = async (t) => {
    const payload = {
      type: t.type,
      amount: +t.amount,
      date: t.date,
      description: t.description || null,
      payment: t.payment,
      attachment: t.attachment || null,
      category_id: t.category_id || t.categoryId || null,
      account_id: t.account_id || t.accountId || null,
    }

    if (t.id) {
      const { data } = await supabase.from('transactions').update(payload).eq('id', t.id).select().single()
      if (data) setTransactions(prev => prev.map(x => x.id === data.id ? data : x))
    } else {
      const { data } = await supabase.from('transactions').insert({ ...payload, user_id: userId }).select().single()
      if (data) {
        setTransactions(prev => [data, ...prev])
        // atualizar saldo da conta
        const acc = accounts.find(a => a.id === payload.account_id)
        if (acc) {
          const delta = payload.type === 'income' ? +payload.amount : -payload.amount
          await supabase.from('accounts').update({ balance: acc.balance + delta }).eq('id', acc.id)
          setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, balance: a.balance + delta } : a))
        }
      }
    }
  }

  const deleteTransaction = async (id) => {
    const t = transactions.find(x => x.id === id)
    if (!t) return
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(x => x.id !== id))
    // reverter saldo
    const acc = accounts.find(a => a.id === t.account_id)
    if (acc) {
      const delta = t.type === 'income' ? -t.amount : +t.amount
      await supabase.from('accounts').update({ balance: acc.balance + delta }).eq('id', acc.id)
      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, balance: a.balance + delta } : a))
    }
  }

  return {
    categories, accounts, transactions, loading,
    saveCategory, deleteCategory,
    saveAccount, deleteAccount, transfer,
    saveTransaction, deleteTransaction,
    reload: loadAll,
  }
}

// =====================================================
// HOOK DE ADMIN (lista todos os usuários)
// =====================================================
export const useAdmin = (isAdmin) => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!isAdmin) return
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setUsers(data || []))
  }, [isAdmin])

  const updateUser = async (id, patch) => {
    await supabase.from('profiles').update(patch).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u))
  }

  return { users, updateUser }
}