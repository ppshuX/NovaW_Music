/**
 * 数据类型定义
 * MusicOS·Grigg 数据结构
 */

/**
 * 歌曲状态枚举
 */
export const SongStatus = {
  NOT_STARTED: '未开始',
  PRACTICING: '练习中',
  RECORDABLE: '可录制',
  COMPLETED: '已完成'
}

/**
 * 歌曲难度枚举
 */
export const Difficulty = {
  VERY_EASY: 1,
  EASY: 2,
  MEDIUM: 3,
  HARD: 4,
  VERY_HARD: 5
}

/**
 * 歌曲数据结构
 */
export const SongSchema = {
  song_id: '',           // 唯一ID
  title: '',             // 歌曲名
  artist: '',            // 艺术家
  key: '',               // 原调/变调
  capo: 0,               // 变调夹位置（数字）
  status: SongStatus.NOT_STARTED,  // 状态
  proficiency: 1,        // 熟练度 1~5星
  difficulty: 1,         // 难度 1~5
  tags: [],              // 标签数组 [吉他/声乐/原创/cover等]
  sections: {            // 段落掌握情况
    intro: false,
    verse: false,
    chorus: false,
    bridge: false
  },
  technical_points: [],  // 技术要点 [气息、节奏、咬字、真假声混合…]
  notes: '',             // 备注
  practice_history: [],  // 练习历史 [{date, duration_minute, notes}]
  progress_percentage: 0, // 进度百分比
  recording_links: [],    // 录音链接 [url]
  expected_release_date: '', // 预期发布日期
  created_at: '',        // 创建时间
  updated_at: '',        // 更新时间
  is_private: false      // 是否私密（不对外展示）
}

/**
 * 练习记录数据结构
 */
export const PracticeLogSchema = {
  log_id: '',
  song_id: '',
  date: '',
  duration_minute: 0,
  notes: '',
  created_at: ''
}

/**
 * 计划数据结构
 */
export const PlanSchema = {
  plan_id: '',
  title: '',
  start_date: '',
  end_date: '',
  task_list: [],         // [{song_id, type:练习/录音/发布, deadline, status}]
  weekly_goal: {         // 每周目标
    practice_time: 0,    // 练习时间（分钟）
    recording_count: 0,  // 录音次数
    learn_songs: 0       // 学习歌曲数
  },
  created_at: '',
  updated_at: ''
}

/**
 * 演出数据结构
 */
export const PerformanceSchema = {
  show_id: '',
  title: '',
  date: '',
  location: '',
  setlist: [],          // [song_id]
  prepare_status: '未准备', // 未准备/准备中/已准备
  notes: '',
  created_at: '',
  updated_at: ''
}

/**
 * 用户公开资料
 */
export const PublicProfileSchema = {
  user_id: '',
  bio: '',              // 简介
  style: '',            // 风格
  voice_type: '',       // 声线
  expertise: [],        // 擅长方向
  timeline: []          // 音乐成长时间线
}

