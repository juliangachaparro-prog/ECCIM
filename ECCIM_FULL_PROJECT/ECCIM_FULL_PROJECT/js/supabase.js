import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl =
'https://hxlmzjeeywcutdfrqxio.supabase.co'

const supabaseKey =
'sb_publishable_FwaG4RT0uyguCRhz9XpwGA_9KAioBcR'

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)