// pages/practice/practice-log/practice-log.js
import { getSongs, getPracticeLogs, addPracticeLog, isOwner } from '../../../utils/unified-storage.js'
import { formatDate, showToast } from '../../../utils/util.js'

Page({
  data: {
    songId: null,
    viewMode: 'add', // add 或 all
    songs: [],
    selectedSongId: '',
    selectedSongIndex: -1,
    selectedSongTitle: '请选择歌曲',
    formData: {
      date: '',
      duration_minute: 0,
      notes: ''
    },
    practiceLogs: []
  },

  async onLoad(options) {
    const songId = options.songId
    const viewMode = options.viewMode || 'add'
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0]
    
    // 检查是否是主人（只有主人可以添加记录）
    const owner = await isOwner()
    if (viewMode === 'add' && !owner) {
      showToast('只读模式，无法添加记录', 'none')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.setData({
      songId,
      viewMode,
      selectedSongId: songId || '',
      'formData.date': today,
      isOwner: owner
    })

    if (viewMode === 'all') {
      await this.loadPracticeLogs(songId)
    } else {
      await this.loadSongs()
    }
  },

  async loadSongs() {
    const songs = await getSongs()
    let selectedSongIndex = -1
    let selectedSongTitle = '请选择歌曲'
    
    if (this.data.selectedSongId) {
      selectedSongIndex = songs.findIndex(s => s.song_id === this.data.selectedSongId)
      const selectedSong = songs.find(s => s.song_id === this.data.selectedSongId)
      if (selectedSong) {
        selectedSongTitle = selectedSong.title
      }
    }
    
    this.setData({
      songs,
      selectedSongIndex,
      selectedSongTitle
    })
  },

  async loadPracticeLogs(songId) {
    const allLogs = await getPracticeLogs(songId)
    const logs = allLogs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // 关联歌曲信息
    const songs = await getSongs()
    const logsWithSongInfo = logs.map(log => {
      const song = songs.find(s => s.song_id === log.song_id)
      return {
        ...log,
        songTitle: song ? song.title : '未知歌曲',
        songArtist: song ? song.artist : ''
      }
    })
    
    this.setData({
      practiceLogs: logsWithSongInfo
    })
  },

  // 选择歌曲
  onSongChange(e) {
    const index = parseInt(e.detail.value)
    const song = this.data.songs[index]
    if (song) {
      this.setData({
        selectedSongId: song.song_id,
        selectedSongIndex: index,
        selectedSongTitle: song.title
      })
    }
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  // 时长输入
  onDurationInput(e) {
    this.setData({
      'formData.duration_minute': parseInt(e.detail.value) || 0
    })
  },

  // 备注输入
  onNotesInput(e) {
    this.setData({
      'formData.notes': e.detail.value
    })
  },

  // 添加新记录
  addNewLog() {
    wx.navigateTo({
      url: '/pages/practice/practice-log/practice-log'
    })
  },

  // 保存练习记录
  async save() {
    if (!this.data.isOwner) {
      showToast('只读模式，无法添加记录', 'none')
      return
    }
    
    const { selectedSongId, formData } = this.data
    
    if (!selectedSongId) {
      showToast('请选择歌曲', 'none')
      return
    }
    
    if (!formData.date) {
      showToast('请选择日期', 'none')
      return
    }
    
    if (formData.duration_minute <= 0) {
      showToast('请输入练习时长', 'none')
      return
    }

    const log = {
      song_id: selectedSongId,
      date: formData.date,
      duration_minute: formData.duration_minute,
      notes: formData.notes
    }

    try {
      await addPracticeLog(log)
      showToast('记录成功', 'success')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      showToast('记录失败', 'none')
    }
  }
})

