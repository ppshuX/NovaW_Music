# 设置指南 - 个人展示型小程序

## 📌 核心概念

这是一个**个人展示型小程序**，用于展示你的音乐作品和动态。

- ✅ **所有访问者**看到的是**你的数据**（不是他们自己的）
- ✅ **只有你**可以编辑和修改数据
- ✅ **其他人**只能查看，不能修改

## 🚀 快速开始

### 方式一：使用本地存储（当前默认）

适合个人使用，数据存储在本地设备。

1. 直接使用，无需配置
2. 数据存储在本地
3. 所有访问者看到的是他们自己的数据（本地存储的限制）

### 方式二：使用云开发（推荐用于展示）

适合需要分享给他人查看的场景。

#### 步骤1：开通云开发

1. 打开微信开发者工具
2. 点击顶部菜单栏的"云开发"
3. 开通云开发环境
4. 创建环境（选择免费版即可）
5. 记录环境ID（Environment ID）

#### 步骤2：创建云数据库集合

在云开发控制台的"数据库"中创建以下集合：

- `songs` - 歌曲数据
- `practice_logs` - 练习记录
- `posts` - 动态数据

#### 步骤3：配置数据库权限

在云开发控制台的"数据库" -> "权限设置"中：

**songs 集合权限**：
```json
{
  "read": true,    // 所有人可读
  "write": false   // 所有人不可写（通过云函数控制）
}
```

**practice_logs 集合权限**：
```json
{
  "read": true,
  "write": false
}
```

**posts 集合权限**：
```json
{
  "read": true,
  "write": false
}
```

#### 步骤4：创建云函数获取OpenID

在云开发控制台的"云函数"中创建函数 `getOpenId`：

```javascript
// cloudfunctions/getOpenId/index.js
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return {
    openid: wxContext.OPENID
  }
}
```

#### 步骤5：修改配置文件

编辑 `config/index.js`：

```javascript
// 是否使用云开发
export const USE_CLOUD = true

// 云开发环境ID（从云开发控制台获取）
export const CLOUD_ENV_ID = 'your-env-id'  // 替换为你的环境ID

// 主人OpenID（只有这个OpenID可以编辑数据）
// 获取方式：在云开发控制台查看，或通过云函数获取
export const OWNER_OPENID = 'oXxxxxx...'  // 替换为你的OpenID
```

#### 步骤6：获取你的OpenID

1. 在小程序中添加临时代码获取OpenID：

```javascript
// 临时添加到某个页面的onLoad中
wx.cloud.callFunction({
  name: 'getOpenId',
  success: res => {
    console.log('你的OpenID:', res.result.openid)
    // 复制这个OpenID到config/index.js的OWNER_OPENID
  }
})
```

2. 复制OpenID到 `config/index.js` 的 `OWNER_OPENID`

#### 步骤7：上传云函数

1. 在云开发控制台上传 `getOpenId` 云函数
2. 等待部署完成

#### 步骤8：测试

1. 使用你的微信账号登录小程序
2. 应该可以正常编辑数据
3. 使用其他微信账号登录
4. 应该只能查看，不能编辑

## 🔐 权限说明

### 主人（OWNER_OPENID）

- ✅ 可以查看所有数据
- ✅ 可以添加、编辑、删除歌曲
- ✅ 可以添加、编辑、删除动态
- ✅ 可以添加练习记录
- ✅ 可以上传视频和乐谱

### 访客（其他OpenID）

- ✅ 可以查看所有数据
- ❌ 不能添加、编辑、删除任何内容
- ❌ 所有编辑按钮自动隐藏
- ❌ 尝试修改时会提示"只读模式，无法修改"

## 📝 数据迁移

如果从本地存储迁移到云开发：

1. 导出本地数据（功能开发中）
2. 或手动在云数据库中导入数据
3. 或使用小程序的数据导入功能

## ⚠️ 注意事项

1. **云开发有免费额度**，超出后需要付费
2. **数据库权限**需要正确配置
3. **文件存储**（视频、乐谱）也需要使用云存储
4. **OpenID是唯一的**，确保正确设置OWNER_OPENID

## 🐛 常见问题

### Q: 如何知道我的OpenID？

A: 在云开发控制台的"云函数"中调用 `getOpenId`，或在小程序中临时打印。

### Q: 为什么访客还能看到编辑按钮？

A: 检查 `config/index.js` 中的 `USE_CLOUD` 和 `OWNER_OPENID` 是否正确配置。

### Q: 数据存储在哪里？

A: 如果 `USE_CLOUD = true`，数据存储在云数据库；否则存储在本地。

### Q: 如何备份数据？

A: 在云开发控制台可以导出数据，或使用小程序的数据导出功能（开发中）。

---

**完成设置后，你的小程序就是一个真正的个人展示型应用了！** 🎵

