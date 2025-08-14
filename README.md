# Url Shortner - 短链接管理系统

基于 Cloudflare Pages 的短链接服务，带有管理员登录和数据管理功能。

## 功能特性

### 🔐 管理员登录

- 进入主页显示登录界面
- 管理密码：`wuweixiang`
- 支持会话保持（24 小时）

### 📊 数据管理

- 创建短链接（支持自定义短码）
- 数据列表展示（分页显示）
- 编辑现有链接
- 删除不需要的链接
- 一键复制短链接

### 🛡️ API 安全

- 所有 API 调用需要密码验证
- 密码参数：`password=wuweixiang`

## 技术栈

### 前端

- **Vue.js 2.6.11** - 渐进式 JavaScript 框架
- **Element UI 2.13.0** - 基于 Vue 的组件库
- **jQuery 3.6.0** - HTTP 客户端
- **Vue-clipboard2 0.3.1** - 剪贴板功能

### 后端

- **Cloudflare Pages** - 静态网站托管服务
- **Cloudflare KV** - 键值存储数据库

## 部署方法

### Cloudflare Pages

1. Fork 本仓库
2. 在 Cloudflare Pages 中创建新项目

- 连接到您的 GitHub 仓库
- 构建设置：
  - 构建命令：不需要
  - 输出目录：/

3. 创建 KV 命名空间

![1738067979664](https://github.com/user-attachments/assets/ae96e948-0148-4bd6-bb19-4a0a53b6f229)
![e16e83362b97668fba0d9ec1e100585](https://github.com/user-attachments/assets/2f9ddec3-6ad0-4a11-a1b7-d2c5287ecfb6)

- 在 Cloudflare 控制台创建 KV 命名空间，命名为 "`LINKS`"
- 在 Pages 项目设置中绑定 KV：
  - 变量名：`LINKS`
  - KV 命名空间：选择刚创建的命名空间
    ![fe25d11f7ca80cd4ea987d069c81f3f](https://github.com/user-attachments/assets/b15b2b50-b8c5-4ce1-a789-184c022709a6)

4. 部署后 请重新部署后 即可使用 Pages 必须重重试部署 否则无法使用 KV 空间
   ![49f211b9addcf51a324e8ec6e0f0965](https://github.com/user-attachments/assets/63b64cfa-9d2d-4a64-a2f5-8f1403f6d0d6)

## 项目结构

```
├── functions/
│   ├── short.js          # 处理短链接创建 (POST /short)
│   ├── [shortKey].js     # 处理短链接重定向 (GET /{shortKey})
│   └── api/
│       ├── list.js       # 获取短链接列表 (GET /api/list)
│       ├── delete.js     # 删除短链接 (POST /api/delete)
│       └── update.js     # 更新短链接 (POST /api/update)
├── index.html            # 管理界面前端页面
├── README.md
└── LICENSE
```

## 核心功能

- ✅ **管理员登录系统** - 密码保护的管理界面
- ✅ **数据列表管理** - 分页展示所有短链接
- ✅ **CRUD 操作** - 创建、查看、编辑、删除短链接
- ✅ **自定义短码** - 支持自定义短链接后缀
- ✅ **自动生成** - 自动生成随机短链接
- ✅ **密码验证** - 所有 API 调用需要密码验证
- ✅ **会话管理** - 24 小时登录状态保持
- ✅ **响应式设计** - 适配移动端和桌面端
- ✅ **一键复制** - 快速复制短链接到剪贴板

## API 说明

### 创建短链接

- **端点**: `POST /short`
- **参数**:
  - `longUrl`: Base64 编码的长链接
  - `shortKey`: 可选的自定义短码
  - `password`: wuweixiang

### 获取链接列表

- **端点**: `GET /api/list`
- **参数**:
  - `page`: 页码
  - `pageSize`: 每页数量
  - `password`: wuweixiang

### 删除链接

- **端点**: `POST /api/delete`
- **参数**:
  - `shortKey`: 要删除的短码
  - `password`: wuweixiang

### 更新链接

- **端点**: `POST /api/update`
- **参数**:
  - `shortKey`: 要更新的短码
  - `longUrl`: 新的长链接
  - `password`: wuweixiang

### 访问短链接

- **端点**: `GET /{shortKey}`
- **响应**: 301 重定向到原始 URL

## 使用方法

1. 访问网站，输入管理密码 `wuweixiang` 登录
2. 在管理界面中输入长链接，点击"缩短"按钮创建短链接
3. 在数据列表中可以查看、编辑、删除已创建的短链接
4. 点击"复制"按钮可以快速复制短链接到剪贴板

## 部署注意事项

1. **KV 绑定是必需的**：确保在 Pages 设置中正确绑定 KV 命名空间
2. **重新部署**：绑定 KV 后必须重新部署项目
3. **域名配置**：可以绑定自定义域名以获得更短的链接
4. **HTTPS**：Cloudflare Pages 默认提供 HTTPS 支持
