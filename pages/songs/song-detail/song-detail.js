// pages/songs/song-detail/song-detail.js
import { getSongById, getPracticeLogs, updateSong } from '../../../utils/storage.js'
import { formatDate, formatDuration, getStatusColor, showToast, showLoading, hideLoading } from '../../../utils/util.js'
import { chooseAndUploadVideo, chooseAndUploadImage, deleteFile, previewImage, playVideo } from '../../../utils/file-upload.js'

Page({
  data: {
    song: null,
    practiceLogs: [],
    showEditMenu: false,
    readonly: false  // 只读模式
  },

  onLoad(options) {
    const songId = options.id
    const readonly = options.readonly === 'true' || options.readonly === true
    if (songId) {
      this.setData({
        readonly: readonly
      })
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
    if (this.data.readonly) {
      showToast('只读模式，无法修改', 'none')
      return
    }
    const section = e.currentTarget.dataset.section
    const song = this.data.song
    const sections = { ...song.sections }
    sections[section] = !sections[section]
    
    updateSong(song.song_id, { sections })
    this.loadSongDetail(song.song_id)
  },

  // 修改熟练度
  changeProficiency(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法修改', 'none')
      return
    }
    const proficiency = parseInt(e.currentTarget.dataset.rating)
    const song = this.data.song
    
    updateSong(song.song_id, { proficiency })
    this.loadSongDetail(song.song_id)
  },

  // 修改状态
  changeStatus(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法修改', 'none')
      return
    }
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
  },

  // 上传演示视频
  async uploadVideo() {
    if (this.data.readonly) {
      showToast('只读模式，无法上传', 'none')
      return
    }
    try {
      showLoading('上传中...')
      const videoInfo = await chooseAndUploadVideo({
        name: `${this.data.song.title}_演示视频`
      })
      
      const song = this.data.song
      const videos = song.demo_videos || []
      videos.push(videoInfo)
      
      updateSong(song.song_id, { demo_videos: videos })
      hideLoading()
      showToast('上传成功', 'success')
      this.loadSongDetail(song.song_id)
    } catch (err) {
      hideLoading()
      if (err.message !== '未选择视频') {
        showToast('上传失败：' + err.message, 'none')
      }
    }
  },

  // 删除演示视频
  async deleteVideo(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法删除', 'none')
      return
    }
    const index = e.currentTarget.dataset.index
    const song = this.data.song
    const videos = [...(song.demo_videos || [])]
    const video = videos[index]
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个演示视频吗？',
      success: async (res) => {
        if (res.confirm) {
          // 删除文件
          await deleteFile(video.url)
          
          // 从列表中移除
          videos.splice(index, 1)
          updateSong(song.song_id, { demo_videos: videos })
          showToast('删除成功', 'success')
          this.loadSongDetail(song.song_id)
        }
      }
    })
  },

  // 播放视频
  playVideo(e) {
    const url = e.currentTarget.dataset.url
    playVideo(url)
  },

  // 上传乐谱
  async uploadSheetMusic() {
    if (this.data.readonly) {
      showToast('只读模式，无法上传', 'none')
      return
    }
    try {
      showLoading('上传中...')
      const imageInfo = await chooseAndUploadImage({
        name: `${this.data.song.title}_乐谱`
      })
      
      const song = this.data.song
      const sheets = song.sheet_music || []
      sheets.push(imageInfo)
      
      updateSong(song.song_id, { sheet_music: sheets })
      hideLoading()
      showToast('上传成功', 'success')
      this.loadSongDetail(song.song_id)
    } catch (err) {
      hideLoading()
      if (err.message !== '未选择图片') {
        showToast('上传失败：' + err.message, 'none')
      }
    }
  },

  // 删除乐谱
  async deleteSheetMusic(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法删除', 'none')
      return
    }
    const index = e.currentTarget.dataset.index
    const song = this.data.song
    const sheets = [...(song.sheet_music || [])]
    const sheet = sheets[index]
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个乐谱吗？',
      success: async (res) => {
        if (res.confirm) {
          // 删除文件
          await deleteFile(sheet.url)
          
          // 从列表中移除
          sheets.splice(index, 1)
          updateSong(song.song_id, { sheet_music: sheets })
          showToast('删除成功', 'success')
          this.loadSongDetail(song.song_id)
        }
      }
    })
  },

  // 预览乐谱
  previewSheetMusic(e) {
    const index = e.currentTarget.dataset.index
    const song = this.data.song
    const sheets = song.sheet_music || []
    const urls = sheets.map(s => s.url)
    previewImage(sheets[index].url, urls)
  }
})

