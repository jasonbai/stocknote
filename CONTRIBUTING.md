# 贡献指南

感谢您对股票交易记录管理平台的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 Bug报告
- 💡 功能建议
- 📝 文档改进
- 🔧 代码贡献
- 🎨 UI/UX改进

## 开始之前

请确保您已经：

1. ⭐ 给项目点个星
2. 🍴 Fork项目到您的GitHub账户
3. 📖 阅读了项目的README文档
4. 🔍 检查了现有的Issues和Pull Requests，避免重复工作

## 开发环境设置

### 前置要求
- Node.js 18+
- pnpm (推荐) 或 npm
- Git

### 本地开发设置

1. **克隆您的Fork**
```bash
git clone https://github.com/your-username/stocknote-back9.0.git
cd stocknote-back9.0
```

2. **添加上游仓库**
```bash
git remote add upstream https://github.com/original-owner/stocknote-back9.0.git
```

3. **安装依赖**
```bash
cd frontend
pnpm install
```

4. **环境配置**
```bash
cp .env.example .env.local
# 编辑 .env.local 填入您的Supabase配置
```

5. **启动开发服务器**
```bash
pnpm dev
```

## 贡献流程

### 1. 创建Issue（可选但推荐）

对于重大更改，建议先创建一个Issue来讨论：

- **Bug报告**：使用Bug报告模板
- **功能请求**：使用功能请求模板
- **其他**：详细描述您的想法

### 2. 创建分支

```bash
# 确保main分支是最新的
git checkout main
git pull upstream main

# 创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b bugfix/issue-number
```

### 3. 开发和测试

- 编写代码时请遵循项目的代码风格
- 确保所有现有测试通过
- 为新功能添加测试
- 更新相关文档

### 4. 提交代码

使用清晰的提交信息：

```bash
git add .
git commit -m "feat: 添加股票价格自动更新功能"

# 提交信息格式建议：
# feat: 新功能
# fix: Bug修复
# docs: 文档更新
# style: 代码格式调整
# refactor: 代码重构
# test: 测试相关
# chore: 构建/工具相关
```

### 5. 推送和创建Pull Request

```bash
git push origin feature/your-feature-name
```

然后在GitHub上创建Pull Request：

1. 前往您的Fork页面
2. 点击"Compare & pull request"
3. 填写PR标题和描述
4. 选择正确的base分支（通常是main）
5. 提交PR

## Pull Request指南

### PR标题格式
```
[类型] 简短描述

示例：
[feat] 添加股票价格自动更新功能
[fix] 修复交易记录删除问题
[docs] 更新API文档
```

### PR描述模板
```markdown
## 更改类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 代码重构
- [ ] 文档更新
- [ ] 其他

## 更改描述
简要描述您的更改...

## 相关Issue
Closes #123

## 测试
- [ ] 本地测试通过
- [ ] 添加了新的测试用例
- [ ] 所有现有测试通过

## 截图（如适用）
添加截图来展示UI更改...

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自我审查了代码
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
```

## 代码规范

### TypeScript/React
- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 使用函数式组件和Hooks
- 组件名使用PascalCase
- 文件名使用kebab-case

### 提交规范
遵循[Conventional Commits](https://www.conventionalcommits.org/)规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 代码审查

所有PR都需要经过代码审查：

- 保持PR较小和专注
- 响应审查意见
- 确保CI/CD检查通过
- 保持代码库的一致性

## 社区准则

### 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境：

- 🤝 尊重不同观点和经验
- 💬 使用友好和包容的语言
- 🎯 专注于对社区最有利的事情
- 🙏 对其他社区成员表示同理心

### 获得帮助

如果您需要帮助：

1. 📖 查看项目文档和README
2. 🔍 搜索现有的Issues
3. 💬 创建新的Issue提问
4. 📧 通过GitHub Issues联系维护者

## 认可贡献者

我们感谢所有贡献者的努力！贡献者将被列在：

- README文件中
- 发布说明中
- GitHub贡献者页面

## 许可证

通过贡献代码，您同意您的贡献将在MIT许可证下授权。

---

再次感谢您的贡献！🎉 