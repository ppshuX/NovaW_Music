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

4. **公开展示页**
   - 展示已完成作品
   - 展示正在练习的歌曲
   - 展示原创作品
   - 支持分享功能

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
│   └── util.js           # 通用工具函数
└── pages/                # 页面目录
    ├── dashboard/        # 仪表盘
    ├── songs/            # 歌曲相关页面
    │   ├── song-list/    # 歌曲列表
    │   ├── song-detail/  # 歌曲详情
    │   └── song-edit/    # 添加/编辑歌曲
    ├── practice/         # 练习记录
    │   └── practice-log/
    └── showcase/         # 公开展示页
```

## 🛠️ 技术栈

- **前端框架**: 微信小程序原生框架
- **数据存储**: 微信小程序本地存储（wx.storage）
- **样式**: WXSS（类似CSS）

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

### 查看统计

- 在仪表盘查看今日和本周的练习统计
- 查看正在练习的歌曲进度
- 查看即将发布的作品

### 公开展示

- 进入"作品集"页面
- 查看已完成、正在练习和原创作品
- 点击右上角分享给朋友

## 🔮 未来扩展功能

- [ ] 音乐计划系统（Plan/Schedule）
- [ ] 演出系统（Performance System）
- [ ] 音乐成长曲线可视化
- [ ] 录音/视频上传功能
- [ ] 云开发数据同步
- [ ] 多用户支持
- [ ] 数据导出功能

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
  expected_release_date: string,// 预期发布日期
  is_private: boolean,          // 是否私密
  created_at: string,           // 创建时间
  updated_at: string            // 更新时间
}
```

### 练习记录（Practice Log）

```javascript
{
  log_id: string,               // 唯一ID
  song_id: string,              // 歌曲ID
  date: string,                 // 日期
  duration_minute: number,      // 时长（分钟）
  notes: string,                // 备注
  created_at: string            // 创建时间
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

