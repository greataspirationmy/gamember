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

// 上传头像到 Supabase Storage
async function uploadAvatar(file, agentId) {
    try {
        // 生成唯一的文件名
        const fileExt = file.name.split('.').pop();
        const fileName = `${agentId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // 上传文件到 Storage
        const { error: uploadError } = await supabaseClient
            .storage
            .from('avatars')  // 确保在 Supabase 中创建了这个 bucket
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 获取文件的公共URL
        const { data: { publicUrl } } = supabaseClient
            .storage
            .from('avatars')
            .getPublicUrl(filePath);

        // 更新用户的 avatar_url
        const { data, error: updateError } = await supabaseClient
            .from('agents')
            .update({ avatar_url: publicUrl })
            .eq('agent_id', agentId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 更新本地存储
        localStorage.setItem('currentUser', JSON.stringify(data));

        return publicUrl;
    } catch (error) {
        console.error('Avatar upload failed:', error);
        throw error;
    }
}

// 检查是否可以签到
async function canCheckin(agentId) {
    try {
        const { data, error } = await supabaseClient
            .from('agents')
            .select('last_checkin')
            .eq('agent_id', agentId)
            .single();

        if (error) throw error;

        if (!data.last_checkin) return true;

        const lastCheckin = new Date(data.last_checkin);
        const today = new Date();
        return lastCheckin.toDateString() !== today.toDateString();
    } catch (error) {
        console.error('Check-in check failed:', error);
        return false;
    }
}

// 执行签到
async function performCheckin(agentId) {
    try {
        // 获取当前用户数据
        const { data: userData, error: userError } = await supabaseClient
            .from('agents')
            .select('*')
            .eq('agent_id', agentId)
            .single();

        if (userError) throw userError;

        const oldLevel = Math.floor(userData.experience / 100) + 1;
        const newExperience = userData.experience + 10;
        const newLevel = Math.floor(newExperience / 100) + 1;

        // 更新经验值和签到时间
        const { data, error } = await supabaseClient
            .from('agents')
            .update({ 
                experience: newExperience,
                last_checkin: new Date().toISOString().split('T')[0]
            })
            .eq('agent_id', agentId)
            .select()
            .single();

        if (error) throw error;

        // 更新本地存储的用户数据
        localStorage.setItem('currentUser', JSON.stringify(data));

        // 检查是否升级
        if (newLevel > oldLevel) {
            alert(`恭喜，你升到 Level ${newLevel} 了！`);
        }

        return data;
    } catch (error) {
        console.error('Check-in failed:', error);
        throw error;
    }
}
