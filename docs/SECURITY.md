# 安全指南

## ⚠️ 重要安全提示

### 敏感信息处理

**请勿在代码中提交以下敏感信息：**

1. **微信小程序 AppID**
   - 位置：`project.config.json`
   - 处理：使用占位符 `your-appid-here`
   - 说明：AppID 是敏感信息，不应提交到公开仓库

2. **云开发环境ID**
   - 位置：`config/index.js`
   - 处理：使用占位符 `your-env-id`
   - 说明：环境ID 不应公开

3. **OpenID**
   - 位置：`config/index.js`
   - 处理：使用占位符或环境变量
   - 说明：用户唯一标识，不应公开

4. **API密钥**
   - 任何第三方服务的 API Key
   - 数据库连接字符串
   - 其他认证凭据

### 配置文件管理

#### 已添加到 .gitignore

以下文件不会被提交到 Git：

- `project.config.json` - 包含真实 AppID
- `project.private.config.json` - 私有配置
- `config/index.js` - 可能包含敏感配置（如果添加）

#### 使用示例文件

项目提供了示例配置文件：

- `project.config.example.json` - 项目配置示例
- 复制并重命名后填写真实信息

### 如果已经提交了敏感信息

如果敏感信息已经被提交到 Git 历史：

1. **立即处理**
   - 修改配置文件，移除敏感信息
   - 提交更改

2. **从历史中移除（可选）**
   ```bash
   # 使用 git filter-branch 或 BFG Repo-Cleaner
   # 注意：这会重写 Git 历史，需要强制推送
   ```

3. **轮换凭据**
   - 如果 AppID 已泄露，考虑在微信公众平台重新生成
   - 更新所有使用该 AppID 的地方

### 最佳实践

1. **使用环境变量**
   - 敏感信息通过环境变量传递
   - 不在代码中硬编码

2. **使用配置文件模板**
   - 提供 `.example` 或 `.template` 文件
   - 在 README 中说明如何配置

3. **代码审查**
   - 提交前检查是否包含敏感信息
   - 使用工具自动检测（如 GitHub Secret Scanning）

4. **定期检查**
   - 定期检查仓库中是否有敏感信息
   - 使用 `git-secrets` 等工具

### 当前项目配置

#### project.config.json

**已处理：**
- ✅ AppID 已替换为占位符 `your-appid-here`
- ✅ 文件已添加到 .gitignore
- ✅ 提供了 `project.config.example.json` 示例文件

**使用步骤：**
1. 复制 `project.config.example.json` 为 `project.config.json`
2. 将 `your-appid-here` 替换为你的真实 AppID
3. 文件会自动被 .gitignore 忽略，不会提交

#### config/index.js

**当前状态：**
- ✅ 使用占位符 `your-env-id`
- ✅ 使用占位符 `null` 作为 OWNER_OPENID
- ⚠️ 如果后续添加真实值，建议也添加到 .gitignore

### GitHub Secret Scanning

GitHub 会自动扫描仓库中的敏感信息。如果收到警告：

1. **立即处理**
   - 按照警告提示移除敏感信息
   - 轮换已泄露的凭据

2. **更新配置**
   - 确保 .gitignore 包含敏感文件
   - 使用占位符替代真实值

3. **验证修复**
   - 提交修复后，GitHub 会重新扫描
   - 确认警告已解决

---

**安全第一！** 请妥善保管你的敏感信息，不要提交到公开仓库。



