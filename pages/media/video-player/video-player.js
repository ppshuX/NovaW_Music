// pages/media/video-player/video-player.js
Page({
  data: {
    videoUrl: '',
    videoContext: null
  },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '')
    this.setData({
      videoUrl: url
    })
  },

  onReady() {
    this.videoContext = wx.createVideoContext('videoPlayer')
  },

  // 播放
  play() {
    this.videoContext.play()
  },

  // 暂停
  pause() {
    this.videoContext.pause()
  },

  // 播放错误
  onError(e) {
    console.error('视频播放错误:', e)
    wx.showToast({
      title: '播放失败',
      icon: 'none'
    })
  }
})

