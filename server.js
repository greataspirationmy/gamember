const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// MySQL 连接配置
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // 你的MySQL用户名
    password: 'monsret777',  // 你的MySQL密码
    database: 'great_aspiration'
});

// 确保上传目录存在
const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 创建 upload 中间件
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 限制
    },
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('只允许上传图片文件'));
        }
        cb(null, true);
    }
});

// 配置静态文件访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 验证登录 API
app.post('/api/verify', (req, res) => {
    const { employeeId } = req.body;
    
    const query = 'SELECT * FROM agents WHERE id = ?';
    connection.query(query, [employeeId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'SYSTEM ERROR' 
            });
            return;
        }
        
        if (results.length > 0) {
            res.json({ 
                success: true,
                user: results[0]
            });
        } else {
            res.json({ 
                success: false, 
                message: 'MEMBER ID NOT EXIST'
            });
        }
    });
});

// 获取用户信息 API
app.get('/api/user/:id', (req, res) => {
    const employeeId = req.params.id;
    
    const query = 'SELECT * FROM agents WHERE id = ?';
    connection.query(query, [employeeId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ 
                success: false, 
                message: '数据库错误' 
            });
            return;
        }
        
        if (results.length > 0) {
            res.json({
                success: true,
                user: results[0]
            });
        } else {
            res.json({
                success: false,
                message: 'MEMBER ID NOT EXIST'
            });
        }
    });
});

// 头像上传 API
app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有收到文件'
            });
        }

        const employeeId = req.body.employeeId;
        const avatarUrl = `http://localhost:3000/uploads/avatars/${req.file.filename}`;

        const query = 'UPDATE agents SET avatar_url = ? WHERE id = ?';
        connection.query(query, [avatarUrl, employeeId], (error) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: '数据库更新失败'
                });
            }

            res.json({
                success: true,
                avatarUrl: avatarUrl,
                message: '头像上传成功'
            });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: '上传失败'
        });
    }
});

// 经验值
// 获取用户信息 API
app.get('/api/user/:id', (req, res) => {
    const employeeId = req.params.id;
    
    const query = 'SELECT id, name, ranking, experience, last_checkin, avatar_url FROM agents WHERE id = ?';
    connection.query(query, [employeeId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ 
                success: false, 
                message: '数据库错误' 
            });
        }
        
        if (results.length > 0) {
            const user = results[0];
            const experience = user.experience || 0;
            const level = Math.floor(experience / 100) + 1;
            const currentLevelExp = experience % 100;
            
            console.log('Loading user data:', {
                id: user.id,
                experience: experience,
                level: level,
                currentLevelExp: currentLevelExp
            });

            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    ranking: user.ranking,
                    level: level,
                    experience: experience,
                    currentLevelExp: currentLevelExp,
                    experienceToNextLevel: 100 - currentLevelExp,
                    last_checkin: user.last_checkin,
                    avatar_url: user.avatar_url
                }
            });
        } else {
            res.json({
                success: false,
                message: 'MEMBER ID NOT EXIST'
            });
        }
    });
});
// 添加更新经验值的 API
app.post('/api/update-experience', (req, res) => {
    const { employeeId, experienceGained } = req.body;
    
    // 首先获取当前经验值
    const getQuery = 'SELECT experience FROM agents WHERE id = ?';
    connection.query(getQuery, [employeeId], (error, results) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: '数据库错误'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'MEMBER ID NOT EXIST'
            });
        }
        
        const currentExp = results[0].experience;
        const newExp = currentExp + experienceGained;
        
        // 更新经验值
        const updateQuery = 'UPDATE agents SET experience = ? WHERE id = ?';
        connection.query(updateQuery, [newExp, employeeId], (updateError) => {
            if (updateError) {
                return res.status(500).json({
                    success: false,
                    message: '更新经验值失败'
                });
            }
            
            // 计算新等级
            const newLevel = Math.floor(newExp / 100) + 1;
            const expToNext = 100 - (newExp % 100);
            
            res.json({
                success: true,
                experience: newExp,
                level: newLevel,
                experienceToNextLevel: expToNext
            });
        });
    });
});

// 签到 API
app.post('/api/check-in', async (req, res) => {
    const { employeeId } = req.body;
    
    try {
        // 获取当前日期（使用东八区时间）
        const now = new Date();
        now.setHours(now.getHours() + 8); // 转换为东八区时间
        const today = now.toISOString().split('T')[0];
        
        // 检查今天是否已经签到
        const checkQuery = 'SELECT last_checkin, experience FROM agents WHERE id = ?';
        
        connection.query(checkQuery, [employeeId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: '数据库错误'
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }
            
            const lastCheckin = results[0].last_checkin;
            
            // 如果有上次签到记录，检查是否是今天
            if (lastCheckin) {
                const lastCheckinDate = new Date(lastCheckin);
                lastCheckinDate.setHours(lastCheckinDate.getHours() + 8); // 转换为东八区时间
                const lastCheckinDay = lastCheckinDate.toISOString().split('T')[0];
                
                console.log('Last checkin:', lastCheckinDay);
                console.log('Today:', today);
                
                if (lastCheckinDay === today) {
                    console.log('Already checked in today');
                    return res.json({
                        success: false,
                        message: 'You have already check in today'
                    });
                }
            }
            
            // 如果没有签到过或不是今天，则更新签到
            const currentExp = results[0].experience || 0;
            const newExp = currentExp + 10;
            
            // 更新签到时间和经验值
            const updateQuery = 'UPDATE agents SET last_checkin = ?, experience = ? WHERE id = ?';
            
            connection.query(updateQuery, [today, newExp, employeeId], (updateError) => {
                if (updateError) {
                    console.error('Update error:', updateError);
                    return res.status(500).json({
                        success: false,
                        message: '签到失败'
                    });
                }
                
                // 计算新的等级
                const newLevel = Math.floor(newExp / 100) + 1;
                
                console.log('Check-in successful:', {
                    oldExp: currentExp,
                    newExp: newExp,
                    newLevel: newLevel,
                    checkinDate: today
                });
                
                res.json({
                    success: true,
                    message: 'You have successfully login',
                    experience: newExp,
                    level: newLevel,
                    experienceGained: 10
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});