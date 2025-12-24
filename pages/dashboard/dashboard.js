// pages/dashboard/dashboard.js
import { getTodayPracticeStats, getWeekPracticeStats, getPracticingSongs, getSongs } from '../../utils/storage.js'
import { formatDuration, formatDate } from '../../utils/util.js'

Page({
  data: {
    todayStats: {
      totalMinutes: 0,
      songCount: 0,
      logCount: 0
    },
    weekStats: {
      totalMinutes: 0,
      songCount: 0,
      logCount: 0
    },
    practicingSongs: [],
    upcomingReleases: []
  },

  onLoad() {
    this.loadDashboardData()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadDashboardData()
  },

  loadDashboardData() {
    // 加载今日统计
    const todayStats = getTodayPracticeStats()
    
    // 加载本周统计
    const weekStats = getWeekPracticeStats()
    
    // 加载正在练习的歌曲
    const practicingSongs = getPracticingSongs(3)
    
    // 加载即将发布的作品（这里简化处理，实际可以从歌曲中筛选）
    const upcomingReleases = this.getUpcomingReleases()
    
    this.setData({
      todayStats,
      weekStats,
      practicingSongs,
      upcomingReleases
    })
  },

  getUpcomingReleases() {
    // 获取状态为"可录制"或"已完成"且有预期发布日期的歌曲
    const songs = getSongs()
    const now = new Date()
    const upcoming = songs
      .filter(song => {
        if (!song.expected_release_date) return false
        const releaseDate = new Date(song.expected_release_date)
        return releaseDate >= now && (song.status === '可录制' || song.status === '已完成')
      })
      .sort((a, b) => new Date(a.expected_release_date) - new Date(b.expected_release_date))
      .slice(0, 3)
    
    return upcoming.map(song => ({
      ...song,
      releaseDateFormatted: formatDate(song.expected_release_date)
    }))
  },

  // 跳转到歌曲详情
  goToSongDetail(e) {
    const songId = e.currentTarget.dataset.songId
    wx.navigateTo({
      url: `/pages/songs/song-detail/song-detail?id=${songId}`
    })
  },

  // 跳转到歌曲列表
  goToSongList() {
    wx.switchTab({
      url: '/pages/songs/song-list/song-list'
    })
  },

  // 添加练习记录
  addPracticeLog() {
    wx.navigateTo({
      url: '/pages/practice/practice-log/practice-log'
    })
  }
})

