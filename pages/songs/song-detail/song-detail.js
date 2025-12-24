// pages/songs/song-detail/song-detail.js
import { getSongById, getPracticeLogs, updateSong } from '../../../utils/storage.js'
import { formatDate, formatDuration, getStatusColor, showToast } from '../../../utils/util.js'

Page({
  data: {
    song: null,
    practiceLogs: [],
    showEditMenu: false
  },

  onLoad(options) {
    const songId = options.id
    if (songId) {
      this.loadSongDetail(songId)
    }
  },

  onShow() {
    // 刷新数据
    if (this.data.song) {
      this.loadSongDetail(this.data.song.song_id)
    }
  },

  loadSongDetail(songId) {
    const song = getSongById(songId)
    if (!song) {
      showToast('歌曲不存在', 'none')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    // 加载练习记录
    const practiceLogs = getPracticeLogs(songId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10) // 只显示最近10条

    this.setData({
      song,
      practiceLogs
    })
  },

  // 编辑歌曲
  editSong() {
    wx.navigateTo({
      url: `/pages/songs/song-edit/song-edit?id=${this.data.song.song_id}`
    })
  },

  // 添加练习记录
  addPracticeLog() {
    wx.navigateTo({
      url: `/pages/practice/practice-log/practice-log?songId=${this.data.song.song_id}`
    })
  },

  // 切换段落掌握状态
  toggleSection(e) {
    const section = e.currentTarget.dataset.section
    const song = this.data.song
    const sections = { ...song.sections }
    sections[section] = !sections[section]
    
    updateSong(song.song_id, { sections })
    this.loadSongDetail(song.song_id)
  },

  // 修改熟练度
  changeProficiency(e) {
    const proficiency = parseInt(e.currentTarget.dataset.rating)
    const song = this.data.song
    
    updateSong(song.song_id, { proficiency })
    this.loadSongDetail(song.song_id)
  },

  // 修改状态
  changeStatus(e) {
    const status = e.currentTarget.dataset.status
    const song = this.data.song
    
    updateSong(song.song_id, { status })
    this.loadSongDetail(song.song_id)
  },

  // 查看所有练习记录
  viewAllLogs() {
    wx.navigateTo({
      url: `/pages/practice/practice-log/practice-log?songId=${this.data.song.song_id}&viewMode=all`
    })
  }
})

