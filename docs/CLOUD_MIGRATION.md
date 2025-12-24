# 云开发迁移指南

## 🚀 快速开始

### 第一步：开通云开发

1. 打开微信开发者工具
2. 点击顶部菜单栏的"云开发"
3. 开通云开发环境
4. 创建环境（选择免费版即可）
5. **记录环境ID**（Environment ID）

### 第二步：创建数据库集合

在云开发控制台的"数据库"中创建以下集合：

1. **songs** - 歌曲库
2. **practice_logs** - 练习记录
3. **posts** - 动态数据

### 第三步：配置数据库权限

在云开发控制台的"数据库" -> "权限设置"中：

**所有集合的权限**：
```json
{
  "read": true,    // 所有人可读（展示型）
  "write": false   // 所有人不可写（通过代码控制）
}
```

### 第四步：上传云函数

1. 在云开发控制台的"云函数"中
2. 右键点击 `cloudfunctions/getOpenId` 文件夹
3. 选择"上传并部署：云端安装依赖"
4. 等待部署完成

### 第五步：修改配置文件

编辑 `config/index.js`：

```javascript
// 是否使用云开发
export const USE_CLOUD = true

// 云开发环境ID（从云开发控制台获取）
export const CLOUD_ENV_ID = 'your-env-id'  // 替换为你的环境ID

// 主人OpenID（只有这个OpenID可以编辑数据）
export const OWNER_OPENID = null  // 暂时留空，稍后获取
```

### 第六步：获取你的OpenID

1. 在小程序中添加临时代码（在任意页面的onLoad中）：

```javascript
wx.cloud.callFunction({
  name: 'getOpenId',
  success: res => {
    console.log('你的OpenID:', res.result.openid)
    wx.showModal({
      title: '你的OpenID',
      content: res.result.openid,
      showCancel: false
    })
  }
})
```

2. 运行小程序，复制显示的OpenID
3. 将OpenID填入 `config/index.js` 的 `OWNER_OPENID`

### 第七步：测试

1. 使用你的微信账号登录小程序
2. 应该可以正常添加、编辑数据
3. 使用其他微信账号登录
4. 应该只能查看，不能编辑

---

## 📦 数据迁移

### 从本地存储迁移到云数据库

#### 方法一：手动导入（推荐）

1. 在小程序中导出本地数据（功能开发中）
2. 在云开发控制台的"数据库"中
3. 选择对应集合
4. 点击"导入"
5. 上传JSON文件

#### 方法二：使用迁移脚本

在小程序中添加临时迁移页面（开发中）

---

## 🎯 云存储目录结构

上传文件会自动创建以下目录结构：

```
cloud://your-env-id/
  music/
    songs/
      {song_id}/
        demos/          # 演示视频
        sheets/         # 乐谱
        recordings/     # 录音
    posts/
      {post_id}/
        images/        # 动态图片
```

---

## ⚠️ 注意事项

1. **云开发有免费额度**，超出后需要付费
2. **数据库权限**需要正确配置
3. **文件存储**也需要使用云存储
4. **OpenID是唯一的**，确保正确设置OWNER_OPENID
5. **云存储文件**需要使用临时URL显示

---

## 🐛 常见问题

### Q: 上传文件失败？

A: 检查：
- 云开发是否已开通
- 环境ID是否正确
- 云存储权限是否配置

### Q: 文件显示不出来？

A: 云存储文件需要使用临时URL，代码已自动处理。

### Q: 如何备份数据？

A: 在云开发控制台可以导出数据。

---

**完成迁移后，你的小程序就真正支持数据共享了！** 🎵

