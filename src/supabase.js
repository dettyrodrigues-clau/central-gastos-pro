import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vkhloyusncxrfwfgqpyb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_xWR53XpOoXrPJ4WcHLqJWg_s8xIqEDU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)