// pages/showcase/showcase.js
import { getSongs } from '../../utils/storage.js'
import { formatDate } from '../../utils/util.js'

Page({
  data: {
    publicSongs: [],
    completedSongs: [],
    practicingSongs: [],
    originalSongs: []
  },

  onLoad() {
    this.loadShowcaseData()
  },

  onShow() {
    this.loadShowcaseData()
  },

  loadShowcaseData() {
    const allSongs = getSongs()
    
    // 只显示非私密的歌曲
    const publicSongs = allSongs.filter(song => !song.is_private)
    
    // 分类
    const completedSongs = publicSongs.filter(song => song.status === '已完成')
    const practicingSongs = publicSongs.filter(song => song.status === '练习中')
    const originalSongs = publicSongs.filter(song => 
      song.tags && song.tags.includes('原创')
    )

    this.setData({
      publicSongs,
      completedSongs,
      practicingSongs,
      originalSongs
    })
  },

  // 跳转到歌曲详情（只读模式）
  goToSongDetail(e) {
    const songId = e.currentTarget.dataset.songId
    wx.navigateTo({
      url: `/pages/songs/song-detail/song-detail?id=${songId}&readonly=true`
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的音乐作品集',
      path: '/pages/showcase/showcase'
    }
  }
})

