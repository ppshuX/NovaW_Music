# 数据库设计文档

## 📊 云数据库集合设计

### 1. `songs` - 歌曲库

存储所有歌曲的基本信息和状态。

```javascript
{
  _id: "自动生成",
  _openid: "用户OpenID",
  
  // 基本信息
  title: "歌曲名",
  artist: "艺术家",
  key: "调性（如：C、G、Am）",
  capo: 0,  // 变调夹位置（数字）
  
  // 状态和进度
  status: "未开始" | "练习中" | "可录制" | "已完成",
  proficiency: 1-5,  // 熟练度（星级）
  difficulty: 1-5,   // 难度
  progress_percentage: 0-100,  // 进度百分比
  
  // 分类和标签
  tags: ["吉他", "声乐", "原创", "cover", "弹唱"],
  technical_points: ["气息", "节奏", "咬字", "真假声混合"],
  
  // 段落掌握情况
  sections: {
    intro: false,
    verse: false,
    chorus: false,
    bridge: false
  },
  
  // 媒体文件（云存储文件ID）
  demo_videos: [
    {
      fileID: "cloud://xxx.mp4",  // 云存储文件ID
      name: "演示视频1",
      duration: 180,  // 秒
      thumbnail: "cloud://xxx.jpg",  // 缩略图
      uploaded_at: "2025-01-01T00:00:00.000Z"
    }
  ],
  sheet_music: [
    {
      fileID: "cloud://xxx.jpg",
      name: "乐谱1",
      uploaded_at: "2025-01-01T00:00:00.000Z"
    }
  ],
  recording_links: [
    {
      fileID: "cloud://xxx.mp3",
      name: "录音1",
      uploaded_at: "2025-01-01T00:00:00.000Z"
    }
  ],
  
  // 其他信息
  notes: "备注",
  expected_release_date: "2025-01-01",  // 预期发布日期
  is_private: false,  // 是否私密（不对外展示）
  
  // 时间戳
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z"
}
```

**索引**：
- `_openid`（自动）
- `status`
- `created_at`
- `updated_at`

---

### 2. `practice_logs` - 练习记录

记录每次练习的详细信息。

```javascript
{
  _id: "自动生成",
  _openid: "用户OpenID",
  
  song_id: "歌曲ID（关联songs）",
  song_title: "歌曲名（冗余，方便查询）",
  song_artist: "艺术家（冗余）",
  
  date: "2025-01-01",  // 练习日期
  duration_minute: 30,  // 练习时长（分钟）
  notes: "今天重点练习了副歌部分",
  
  // 可选：练习时的状态
  practice_status: "练习中",  // 可选
  
  created_at: "2025-01-01T00:00:00.000Z"
}
```

**索引**：
- `_openid`
- `song_id`
- `date`
- `created_at`

---

### 3. `posts` - 动态/作品发布

发布新歌预告、新歌发布、演出信息等动态。

```javascript
{
  _id: "自动生成",
  _openid: "用户OpenID",
  
  post_id: "自定义ID（用于关联）",
  type: "song_coming" | "song_released" | "show",
  
  title: "动态标题",
  content: "动态内容",
  
  // 关联歌曲
  song_id: "歌曲ID（可选）",
  song_title: "歌曲名（冗余）",
  
  // 日期和地点
  date: "2025-01-01",  // 相关日期（发布日期/演出日期）
  location: "XX酒吧",  // 演出地点（仅show类型）
  
  // 图片（云存储文件ID）
  images: [
    "cloud://xxx.jpg",
    "cloud://xxx.jpg"
  ],
  
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z"
}
```

**索引**：
- `_openid`
- `type`
- `created_at`
- `post_id`

---

### 4. `user_profile` - 用户资料（可选）

存储用户的公开资料信息。

```javascript
{
  _id: "自动生成",
  _openid: "用户OpenID",
  
  nickname: "音乐人昵称",
  avatar: "cloud://xxx.jpg",  // 头像（云存储）
  bio: "个人简介",
  style: "民谣、流行",  // 音乐风格
  voice_type: "男中音",  // 声线类型
  specialties: ["吉他", "弹唱", "原创"],  // 擅长方向
  
  // 社交链接（可选）
  wechat: "",
  weibo: "",
  douyin: "",
  
  updated_at: "2025-01-01T00:00:00.000Z"
}
```

**索引**：
- `_openid`（唯一）

---

## 📁 云存储目录结构

```
cloud://your-env-id/
  music/
    songs/
      {song_id}/
        demos/          # 演示视频
          video_xxx.mp4
          thumbnail_xxx.jpg
        sheets/         # 乐谱
          sheet_xxx.jpg
        recordings/     # 录音
          recording_xxx.mp3
    posts/
      {post_id}/
        images/         # 动态图片
          image_xxx.jpg
    user/
      avatar/           # 用户头像
        avatar.jpg
```

---

## 🔐 数据库权限规则

### `songs` 集合

```json
{
  "read": true,    // 所有人可读（展示型）
  "write": false   // 所有人不可写（通过云函数或前端控制）
}
```

**注意**：实际写入权限通过前端代码控制（只有OWNER_OPENID可以写入）

### `practice_logs` 集合

```json
{
  "read": true,
  "write": false
}
```

### `posts` 集合

```json
{
  "read": true,
  "write": false
}
```

### `user_profile` 集合

```json
{
  "read": true,
  "write": false
}
```

---

## 📝 数据迁移计划

### 从本地存储迁移到云数据库

1. **导出本地数据**
   - 从 `wx.getStorageSync('songs')` 获取数据
   - 转换为云数据库格式

2. **批量导入**
   - 使用云开发控制台的"数据导入"功能
   - 或编写迁移脚本

3. **文件迁移**
   - 本地文件需要上传到云存储
   - 更新数据库中的文件路径为云存储fileID

---

## 🎯 下一步

1. ✅ 数据库结构设计（已完成）
2. ⏳ 实现云存储上传功能
3. ⏳ 更新前端代码使用云数据库
4. ⏳ 实现数据迁移工具

