# MusicOS·Grigg - 音乐生涯管理系统

一个用于记录、管理、规划和展示音乐生涯的微信小程序。

## 📋 项目简介

**MusicOS·Grigg** 是一个"音乐成长管理系统"，帮助你：
- 📝 记录和管理你的歌曲库
- 📊 追踪练习进度和熟练度
- 📅 规划音乐计划和目标
- 🎤 展示你的音乐作品集
- 📈 可视化你的音乐成长曲线

## 🚀 功能特性

### MVP 版本功能

1. **歌曲库管理**
   - 添加/编辑/删除歌曲
   - 记录歌曲信息（调性、变调夹、难度等）
   - 跟踪段落掌握情况（Intro、Verse、Chorus、Bridge）
   - 设置熟练度和状态（未开始/练习中/可录制/已完成）
   - 添加标签和技术要点

2. **练习记录**
   - 记录每次练习的时长和日期
   - 添加练习备注
   - 查看历史练习记录

3. **仪表盘**
   - 今日练习统计
   - 本周进度概览
   - 正在练习的歌曲
   - 即将发布的作品

4. **动态发布**
   - 发布新歌预告
   - 发布新歌发布
   - 发布演出信息
   - 支持图片上传

5. **媒体管理**
   - 上传演示视频
   - 上传乐谱图片
   - 查看和播放

## 📁 项目结构

```
NovaW_Music/
├── app.js                 # 小程序入口文件
├── app.json               # 小程序配置文件
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── sitemap.json          # 站点地图
├── types/                # 数据类型定义
│   └── index.js
├── utils/                # 工具类
│   ├── storage.js        # 本地存储工具
│   ├── cloud-storage.js  # 云开发存储工具（可选）
│   ├── posts.js          # 动态管理
│   ├── file-upload.js    # 文件上传
│   └── util.js           # 通用工具函数
└── pages/                # 页面目录
    ├── dashboard/        # 仪表盘
    ├── posts/            # 动态相关
    ├── songs/            # 歌曲相关页面
    ├── practice/         # 练习记录
    └── media/            # 媒体播放
```

## 🛠️ 技术栈

- **前端框架**: 微信小程序原生框架
- **数据存储**: 微信小程序本地存储（wx.storage）
- **样式**: WXSS（类似CSS）
- **可选**: 微信云开发（用于数据分享功能）

## ⚠️ 重要说明

### 当前数据存储方式

**本地存储**：
- ✅ 数据存储在本地设备，速度快，无需网络
- ❌ 分享给朋友后，朋友看到的是**他们自己的数据**，不是你的
- ❌ 卸载小程序会丢失所有数据
- ❌ 无法跨设备同步

### 如何实现"别人查看我的数据"

如果需要实现真正的数据分享功能，需要：

1. **集成微信云开发**（推荐）
   - 将数据存储到云端
   - 配置数据库权限（公开读取）
   - 参考 `docs/CLOUD_SETUP.md`

2. **或使用自建后端API**
   - 搭建自己的服务器
   - 提供数据接口

## 📦 安装和运行

1. **安装微信开发者工具**
   - 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. **导入项目**
   - 打开微信开发者工具
   - 选择"导入项目"
   - 选择项目目录
   - 填写 AppID（可以使用测试号）

3. **运行项目**
   - 点击"编译"按钮
   - 在模拟器中预览效果

## 📝 使用说明

### 添加歌曲

1. 进入"歌曲库"页面
2. 点击右下角的"+"按钮
3. 填写歌曲信息（歌曲名、艺术家为必填项）
4. 设置状态、熟练度、难度等
5. 点击"添加"保存

### 记录练习

1. 在仪表盘或歌曲详情页点击"记录练习"
2. 选择歌曲和日期
3. 输入练习时长（分钟）
4. 可选：添加练习备注
5. 保存记录

### 发布动态

1. 进入"动态"页面
2. 点击右下角"+"按钮
3. 选择动态类型（新歌预告/新歌发布/演出信息）
4. 填写内容和信息
5. 发布

### 上传视频/乐谱

1. 进入歌曲详情页
2. 在"演示视频"或"乐谱"区域点击"+ 上传"
3. 选择文件
4. 自动上传

## 🔮 未来扩展功能

- [ ] 微信云开发集成（实现数据分享）
- [ ] 音乐计划系统（Plan/Schedule）
- [ ] 演出系统（Performance System）
- [ ] 音乐成长曲线可视化
- [ ] 数据导出功能
- [ ] 多设备同步

## 📄 数据模型

### 歌曲（Song）

```javascript
{
  song_id: string,              // 唯一ID
  title: string,                // 歌曲名
  artist: string,               // 艺术家
  key: string,                  // 调性
  capo: number,                 // 变调夹位置
  status: string,               // 状态：未开始/练习中/可录制/已完成
  proficiency: number,          // 熟练度 1-5
  difficulty: number,           // 难度 1-5
  tags: string[],               // 标签
  sections: {                   // 段落掌握
    intro: boolean,
    verse: boolean,
    chorus: boolean,
    bridge: boolean
  },
  technical_points: string[],   // 技术要点
  notes: string,                // 备注
  practice_history: array,      // 练习历史
  progress_percentage: number,  // 进度百分比
  recording_links: string[],    // 录音链接
  demo_videos: array,           // 演示视频
  sheet_music: array,           // 乐谱
  expected_release_date: string,// 预期发布日期
  is_private: boolean,          // 是否私密
  created_at: string,           // 创建时间
  updated_at: string            // 更新时间
}
```

### 动态（Post）

```javascript
{
  post_id: string,             // 唯一ID
  type: string,                // 类型：song_coming/song_released/show
  title: string,               // 标题
  content: string,             // 内容
  song_id: string,             // 关联歌曲ID
  song_title: string,         // 歌曲名
  date: string,                // 日期
  location: string,            // 地点
  images: string[],           // 图片数组
  created_at: string,          // 创建时间
  updated_at: string           // 更新时间
}
```

### 练习记录（Practice Log）

```javascript
{
  log_id: string,              // 唯一ID
  song_id: string,             // 歌曲ID
  date: string,                 // 日期
  duration_minute: number,     // 时长（分钟）
  notes: string,               // 备注
  created_at: string           // 创建时间
}
```

## 🎨 UI 设计

- **主题色**: 深色系（#1a1a2e, #16213e, #0f3460）
- **强调色**: #533483, #00d4aa
- **字体**: 系统默认字体
- **风格**: 现代、简洁、专业

## 📞 联系方式

如有问题或建议，欢迎反馈！

## 📜 许可证

MIT License

---

**MusicOS·Grigg** - 让音乐之路像工程一样可控、可衡量、可成长 🎵
