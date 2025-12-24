// pages/songs/song-list/song-list.js
import { getSongs, deleteSong, calculateProgress, isOwner } from '../../../utils/unified-storage.js'
import { showModal, showToast } from '../../../utils/util.js'

Page({
  data: {
    songs: [],
    filterStatus: 'all', // all, 未开始, 练习中, 可录制, 已完成
    searchKeyword: '',
    isOwner: false  // 是否是主人
  },

  async onLoad() {
    const owner = await isOwner()
    this.setData({
      isOwner: owner
    })
    await this.loadSongs()
  },

  async onShow() {
    // 每次显示时刷新列表
    await this.loadSongs()
  },

  async loadSongs() {
    const songs = await getSongs()
    // 计算每首歌的进度
    const songsWithProgress = songs.map(song => {
      const progress = calculateProgress(song)
      return {
        ...song,
        progress_percentage: progress
      }
    })
    
    // 按更新时间排序（最新的在前）
    songsWithProgress.sort((a, b) => {
      return new Date(b.updated_at) - new Date(a.updated_at)
    })
    
    this.setData({
      songs: songsWithProgress
    })
    this.filterSongs()
  },

  filterSongs() {
    const { songs, filterStatus, searchKeyword } = this.data
    let filtered = songs
    
    // 按状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(song => song.status === filterStatus)
    }
    
    // 按关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(song => {
        return song.title.toLowerCase().includes(keyword) ||
               song.artist.toLowerCase().includes(keyword) ||
               (song.tags && song.tags.some(tag => tag.toLowerCase().includes(keyword)))
      })
    }
    
    this.setData({
      filteredSongs: filtered
    })
  },

  // 切换筛选状态
  onFilterChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      filterStatus: status
    })
    this.filterSongs()
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    // 实时搜索
    this.filterSongs()
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: ''
    })
    this.filterSongs()
  },

  // 添加歌曲
  addSong() {
    wx.navigateTo({
      url: '/pages/songs/song-edit/song-edit'
    })
  },

  // 跳转到歌曲详情
  goToDetail(e) {
    const songId = e.currentTarget.dataset.songId
    wx.navigateTo({
      url: `/pages/songs/song-detail/song-detail?id=${songId}`
    })
  },

  // 编辑歌曲
  editSong(e) {
    e.stopPropagation()
    const songId = e.currentTarget.dataset.songId
    wx.navigateTo({
      url: `/pages/songs/song-edit/song-edit?id=${songId}`
    })
  },

  // 删除歌曲
  async deleteSong(e) {
    e.stopPropagation()
    if (!this.data.isOwner) {
      showToast('只读模式，无法删除', 'none')
      return
    }
    const songId = e.currentTarget.dataset.songId
    const song = this.data.songs.find(s => s.song_id === songId)
    
    const confirmed = await showModal('确认删除', `确定要删除《${song.title}》吗？`)
    if (confirmed) {
      try {
        await deleteSong(songId)
        showToast('删除成功', 'success')
        await this.loadSongs()
      } catch (err) {
        showToast('删除失败', 'none')
      }
    }
  }
})

