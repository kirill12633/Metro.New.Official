// === CONFIGURATION FROM SUPABASE DASHBOARD ===
// URL: https://supabase.com/dashboard/project/hwvlhcmpgzvsvkrklcnb/settings/api

const SUPABASE_URL = 'https://hwvlhcmpgzvsvkrklcnb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_MHvA3bB_Qg9YO_sEm5mtLA_akGAujKQ'; // Ваш ключ

// === INITIALIZE SUPABASE CLIENT ===
try {
    // Создаем клиент Supabase с публичным ключом
    const supabaseClient = supabase.createClient(
        SUPABASE_URL, 
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: false, // Для верификации не нужно сохранять сессию
                detectSessionInUrl: false
            },
            global: {
                headers: {
                    'apikey': SUPABASE_PUBLISHABLE_KEY
                }
            }
        }
    );
    
    // === GLOBAL STATE ===
    const verificationState = {
        currentEmail: '',
        verificationAttempts: 0,
        MAX_ATTEMPTS: 3,
        countdownInterval: null,
        countdownTime: 300
    };
    
    // === EXPORT TO GLOBAL WINDOW ===
    window.supabase = supabaseClient;
    window.verificationState = verificationState;
    
    console.log('✅ Supabase подключен. Project:', SUPABASE_URL);
    
} catch (error) {
    console.error('❌ Ошибка инициализации Supabase:', error);
    alert('Ошибка подключения к сервису верификации. Обновите страницу.');
}
