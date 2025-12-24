// app.js
App({
  onLaunch() {
    // 初始化云开发（如果使用云开发）
    // wx.cloud.init({
    //   env: 'your-env-id'
    // })
    
    // 初始化本地存储
    this.initStorage()
  },

  initStorage() {
    // 检查并初始化本地数据
    const songs = wx.getStorageSync('songs') || []
    const practiceLogs = wx.getStorageSync('practice_logs') || []
    const plans = wx.getStorageSync('plans') || []
    const performances = wx.getStorageSync('performances') || []
    
    if (songs.length === 0) {
      wx.setStorageSync('songs', [])
    }
    if (practiceLogs.length === 0) {
      wx.setStorageSync('practice_logs', [])
    }
    if (plans.length === 0) {
      wx.setStorageSync('plans', [])
    }
    if (performances.length === 0) {
      wx.setStorageSync('performances', [])
    }
  },

  globalData: {
    userInfo: null
  }
})

