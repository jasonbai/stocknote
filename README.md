# 股票交易记录管理平台

一个现代化的多用户股票交易记录管理平台，专为个人投资者设计，提供完整的交易记录管理、盈亏分析和策略追踪功能。

## ✨ 项目特性

### 🔐 用户管理
- **多用户支持**：每个用户独立管理自己的股票和交易记录
- **权限分级**：管理员和普通用户权限分离
- **用户标签**：支持用户分组管理，"星球"标签用户享有无限制权限

### 📊 股票管理
- **股票清单**：展示持仓股票的实时盈亏状态
- **手动价格管理**：用户自主维护股票当前价格
- **智能计算**：自动计算持仓数量、浮动盈亏、盈亏百分比等关键指标

### 💰 交易记录
- **精准配对**：每笔卖出必须关联特定买入记录，支持部分卖出
- **完整记录**：记录买入/卖出时间、数量、价格、手续费、交易理由等
- **状态追踪**：清晰显示未卖出、部分卖出、已卖出状态
- **智能计算**：自动计算手续费（0.03%费率，最低5元）

### 📈 数据分析
- **交易策略分析**：按理由标签统计交易表现
- **盈亏可视化**：图表展示不同策略的盈利表现
- **胜率统计**：计算各类交易的成功率和平均持仓时间

### 📱 响应式设计
- **移动端优化**：完美适配手机、平板和桌面端
- **现代UI**：基于Shadcn/UI的精美界面设计
- **暗色模式**：支持明暗主题切换

## 🛠️ 技术栈

### 前端技术
- **React 19** - 用户界面构建
- **TypeScript** - 类型安全开发
- **Vite** - 现代化构建工具
- **TanStack Router** - 类型安全路由
- **TanStack Query** - 数据获取和缓存
- **Tailwind CSS** - 原子化CSS框架
- **Shadcn/UI** - 高质量组件库
- **Zustand** - 轻量级状态管理
- **React Hook Form + Zod** - 表单处理和验证
- **Recharts** - 数据可视化

### 后端服务
- **Supabase** - 后端即服务平台
  - PostgreSQL数据库
  - 用户认证系统
  - 实时数据同步

### 部署平台
- **Netlify** - 前端部署
- **Supabase Cloud** - 后端服务托管

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm (推荐) 或 npm

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/stocknote-back9.0.git
cd stocknote-back9.0
```

2. **安装依赖**
```bash
cd frontend
pnpm install
```

3. **环境配置**
在 `frontend` 目录下创建 `.env.local` 文件：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **启动开发服务器**
```bash
pnpm dev
```

5. **构建生产版本**
```bash
pnpm build
```

## 📁 项目结构

```
stocknote-back9.0/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # UI组件
│   │   │   ├── auth/        # 认证相关
│   │   │   ├── settings/    # 设置页面
│   │   │   └── errors/      # 错误页面
│   │   ├── routes/          # 路由配置
│   │   ├── lib/             # 工具库
│   │   │   ├── supabase.ts  # Supabase配置
│   │   │   ├── database.types.ts # 数据库类型
│   │   │   └── schemas.ts   # 验证模式
│   │   └── hooks/           # 自定义Hooks
│   ├── public/              # 静态资源
│   └── package.json         # 项目配置
├── 业务需求及技术栈.md        # 详细需求文档
└── README.md                # 项目说明
```

## 🔧 核心功能模块

### 1. 用户认证模块
- 邮箱密码登录/注册
- 用户角色管理（管理员/普通用户）
- 用户标签系统

### 2. 股票管理模块
- 股票信息维护（代码、名称、当前价格）
- 持仓状态计算
- 盈亏统计展示

### 3. 交易记录模块
- 买入/卖出记录管理
- 交易配对逻辑
- 手续费自动计算
- 交易理由标签化

### 4. 数据分析模块
- 按标签统计交易表现
- 盈亏趋势图表
- 胜率和持仓时间分析

## 💡 核心算法

### 盈亏计算公式
```typescript
// 浮动盈亏 = (当前价格 - 加权平均成本价) × 持仓数量 - 总交易费用
floatingPnL = (currentPrice - avgCostPrice) * holdingQuantity - totalFees

// 盈亏百分比 = 浮动盈亏 ÷ 总成本 × 100%
pnlPercent = (floatingPnL / totalCost) * 100

// 加权平均成本 = Σ(买入价格 × 数量 + 交易费用) ÷ 总持仓数量
avgCostPrice = Σ(buyPrice * quantity + fees) / totalQuantity
```

### 手续费计算
```typescript
// 手续费 = 交易金额 × 0.0003，最低5元（交易金额低于5000元时）
fee = Math.max(tradeAmount * 0.0003, tradeAmount < 5000 ? 5 : 0)
```

## 🚀 部署指南

### Netlify部署
1. 将代码推送到GitHub
2. 在Netlify中连接GitHub仓库
3. 设置构建命令：`cd frontend && npm run build`
4. 设置发布目录：`frontend/dist`
5. 配置环境变量（Supabase配置）

### Supabase配置
1. 创建Supabase项目
2. 运行数据库初始化脚本（`src/lib/db_setup.sql`）
3. 配置认证设置
4. 获取项目URL和API密钥

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发日志

详细的开发历程和版本更新记录请查看 [log.md](./log.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

- **开发者** - 股票交易记录管理平台
- **联系方式** - [GitHub Issues](https://github.com/your-username/stocknote-back9.0/issues)

## 🙏 致谢

- [Shadcn/UI](https://ui.shadcn.com/) - 优秀的组件库
- [Supabase](https://supabase.com/) - 强大的后端服务
- [TanStack](https://tanstack.com/) - 现代化的React工具链

---

⭐ 如果这个项目对你有帮助，请给它一个星标！ 