// app.js
import { initStorage } from './utils/unified-storage.js'
import { USE_CLOUD } from './config/index.js'

App({
  async onLaunch() {
    // 初始化存储（自动选择云开发或本地存储）
    await initStorage()
    
    // 初始化本地存储（作为备份）
    this.initStorage()
  },

  initStorage() {
    // 检查并初始化本地数据
    const songs = wx.getStorageSync('songs') || []
    const practiceLogs = wx.getStorageSync('practice_logs') || []
    const posts = wx.getStorageSync('posts') || []
    
    if (songs.length === 0) {
      wx.setStorageSync('songs', [])
    }
    if (practiceLogs.length === 0) {
      wx.setStorageSync('practice_logs', [])
    }
    if (posts.length === 0) {
      wx.setStorageSync('posts', [])
    }
  },

  globalData: {
    userInfo: null
  }
})

