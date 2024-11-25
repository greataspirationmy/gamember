CREATE DATABASE great_aspiration;

-- 使用数据库
USE great_aspiration;

-- 创建会员表
CREATE TABLE agents (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    ranking VARCHAR(30) NOT NULL,
    level INT DEFAULT 1,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT INTO agents (id, name, ranking, level) VALUES
('6633851', 'TAN WEI BIN', 'AGENT', 1),
('6333947', 'LEE CHEN HONG', 'LIA', 1),
('5066541', 'TAN BOON HUANG', 'GROUP MANAGER', 1);

USE great_aspiration;
ALTER TABLE agents ADD COLUMN avatar_url VARCHAR(255);

USE great_aspiration;
ALTER TABLE agents ADD COLUMN experience INT DEFAULT 0;

use great_aspiration;
show tables agents;

SELECT 
    id,
    name,
    experience,
    FLOOR(experience/100) + 1 as level,
    experience % 100 as current_level_exp
FROM agents;

UPDATE agents 
SET experience = 0 
WHERE id = '6633851';

INSERT INTO agents (id, name, ranking, experience, avatar_url) 
VALUES ('6748055', 'TAN RUI YING', 'AGENT', 0, NULL);

ALTER TABLE agents 
ADD COLUMN last_checkin DATE DEFAULT NULL;

UPDATE agents 
SET last_checkin = NULL 
WHERE id = '6633851';

