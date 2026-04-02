# Auth Setup

## 用户表
应用启动后会自动创建 `app_users` 表。

字段说明：
- `username`: 登录账号，唯一
- `password_hash`: BCrypt 哈希，不保存明文密码
- `display_name`: 展示名称
- `enabled`: 是否启用
- `created_at`: 创建时间

## 手工录入账号
推荐由管理员在数据库中直接插入账号记录。

```sql
INSERT INTO app_users (username, password_hash, display_name, enabled, created_at)
VALUES ('admin', '<bcrypt_hash>', '系统管理员', 1, NOW());
```

## 首次初始化辅助
如果你暂时不想手工生成 BCrypt 哈希，也可以在启动后端时设置环境变量：

- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_DISPLAY_NAME`

应用启动时会在账号不存在的情况下自动创建管理员，并对密码进行 BCrypt 加密。
