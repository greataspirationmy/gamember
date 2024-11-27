const { createClient } = supabase;
const supabaseClient = createClient(
    'https://tzekaxushnvtrpywvfcu.supabase.co',  // 替换为您的 Supabase URL
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZWtheHVzaG52dHJweXd2ZmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2ODkwMzcsImV4cCI6MjA0ODI2NTAzN30.e8FCxsbI0aj9mZOtxyCZ7sA-fIlzLN-2x8HYoE74ESY'  // 替换为您的 anon key
);

// 登录函数
async function login(agentId) {
    try {
        const { data, error } = await supabaseClient
            .from('agents')
            .select('*')
            .eq('agent_id', agentId)
            .single();

        if (error) throw error;

        if (data) {
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
