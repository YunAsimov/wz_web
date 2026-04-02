# wz_web 部署包

## 目录说明
- `frontend/dist/`: 前端静态文件，上传到 1Panel 静态网站目录
- `backend/backend.jar`: Spring Boot 后端
- `backend/backend.env.example`: 后端环境变量模板，复制为 `backend.env` 后再改密码
- `backend/run-backend.sh`: Linux 启动脚本
- `backend/stop-backend.sh`: Linux 停止脚本
- `nginx/api-location.conf`: `/api` 反向代理示例

## 推荐部署方式
- 前端：1Panel 静态网站
- 后端：1Panel Java 运行环境，或手动 `java -jar`
- 数据库：1Panel MySQL
- 反代：同域名下把 `/api` 转发到 `127.0.0.1:8080`

## 1Panel 部署步骤
1. 在服务器安装 OpenResty、MySQL、Java 17。
2. 创建数据库 `wz_web`，再创建业务账号，例如 `wz_web_user`。
3. 上传 `frontend/dist/` 到静态网站目录。
4. 上传 `backend/backend.jar` 到服务器目录，例如 `/opt/wz-web/backend/`。
5. 把 `backend/backend.env.example` 复制成 `backend.env`，填入真实数据库连接信息。
6. 在 1Panel Java 运行环境中运行 `backend.jar`，或在 Linux 手动执行：`bash run-backend.sh`
7. 在网站反向代理里增加 `/api` -> `http://127.0.0.1:8080`。
8. 申请 HTTPS 证书并开启 `HTTP -> HTTPS`。

## 后端环境变量
- `WZ_DB_HOST=127.0.0.1` 或 1Panel 中 MySQL 的容器地址
- `WZ_DB_PORT=3306`
- `WZ_DB_NAME=wz_web`
- `WZ_DB_USERNAME=wz_web_user`
- `WZ_DB_PASSWORD=你的数据库密码`
- `SERVER_PORT=8080`
- `CORS_ALLOWED_ORIGIN_PATTERNS=http://你的IP或域名:网站端口,https://你的域名`
- `BOOTSTRAP_ADMIN_USERNAME=admin`
- `BOOTSTRAP_ADMIN_PASSWORD=Admin123!`
- `BOOTSTRAP_ADMIN_DISPLAY_NAME=系统管理员`

首次启动时如果数据库里还没有这个用户名，系统会自动创建一个可登录的网站管理员账号；创建成功后，你可以删掉这 3 个变量再重启，避免重复保留初始化口令。

## 重要说明
- 数据库不要对公网开放。
- 当前前端页面仍使用 Tailwind CDN。正常公网部署可用，但客户端需要能访问 `cdn.tailwindcss.com`。
- 如果你要完全离线或纯生产化静态资源，我可以下一步把 Tailwind 改成本地构建版。
