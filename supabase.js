const SUPABASE_URL = 'https://tzekaxushnvtrpywvfcu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZWtheHVzaG52dHJweXd2ZmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2ODkwMzcsImV4cCI6MjA0ODI2NTAzN30.e8FCxsbI0aj9mZOtxyCZ7sA-fIlzLN-2x8HYoE74ESY'

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 

// 登录函数
async function login(agentId) {
    try {
        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .eq('agent_id', agentId)
            .single();

        if (error) throw error;

        if (data) {
            // 保存用户信息到localStorage
            localStorage.setItem('currentUser', JSON.stringify(data));
            window.location.href = 'dashboard.html';
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// 获取当前用户信息
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}