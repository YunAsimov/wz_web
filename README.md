# wz_web

前后端分离后的标准项目结构：

- `frontend/`: React + Vite 前端工程
- `backend/`: Spring Boot + MySQL 后端工程

## 目录结构

```text
wz_web/
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ src/
│  │  ├─ app/
│  │  │  └─ App.jsx
│  │  ├─ features/
│  │  │  ├─ auth/
│  │  │  │  └─ AuthGate.jsx
│  │  │  └─ dashboard/
│  │  │     └─ DashboardApp.jsx
│  │  └─ shared/
│  │     └─ api/
│  │        └─ client.js
│  └─ dist/
├─ backend/
│  ├─ pom.xml
│  ├─ sql/
│  └─ src/
│     ├─ main/
│     │  ├─ java/com/wzweb/backend/
│     │  │  ├─ auth/
│     │  │  ├─ config/
│     │  │  ├─ match/
│     │  │  └─ BackendApplication.java
│     │  └─ resources/
│     │     └─ application.properties
│     └─ test/
├─ .gitignore
└─ README.md
```

## 前端约定

- `app/`: 应用装配层，只负责挂载顶层页面入口
- `features/`: 按业务拆分的页面与模块，例如登录、仪表盘
- `shared/`: 跨模块复用代码，例如 API 请求封装

## 后端约定

- `auth/`: 登录、会话、密码加密、管理员引导创建
- `match/`: 战绩数据的实体、控制器、服务、仓储
- `config/`: Web 拦截器与全局配置

## 本地开发

### 启动前端

```powershell
cd frontend
npm install
npm run dev
```

### 打包前端

```powershell
cd frontend
npm run build
```

### 启动后端

```powershell
cd backend
$env:WZ_DB_PASSWORD='你的数据库密码'
.\mvnw.cmd spring-boot:run
```

### 打包后端

```powershell
cd backend
.\mvnw.cmd -DskipTests package
```

## 部署产物

- 前端静态文件：`frontend/dist/`
- 后端可执行包：`backend/target/backend-0.0.1-SNAPSHOT.jar`
