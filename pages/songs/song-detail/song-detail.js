// pages/songs/song-detail/song-detail.js
import { getSongById, getPracticeLogs, updateSong, isOwner } from '../../../utils/unified-storage.js'
import { formatDate, formatDuration, getStatusColor, showToast, showLoading, hideLoading } from '../../../utils/util.js'
import { chooseAndUploadVideo, chooseAndUploadImage, deleteFile, previewImage, playVideo } from '../../../utils/file-upload.js'

Page({
  data: {
    song: null,
    practiceLogs: [],
    showEditMenu: false,
    readonly: false  // 只读模式（访客模式）
  },

  async onLoad(options) {
    const songId = options.id
    // 判断是否是主人（可以编辑）
    const isOwnerUser = await isOwner()
    const readonly = !isOwnerUser || (options.readonly === 'true' || options.readonly === true)
    
    if (songId) {
      this.setData({
        readonly: readonly
      })
      await this.loadSongDetail(songId)
    }
  },

  async onShow() {
    // 刷新数据
    if (this.data.song) {
      await this.loadSongDetail(this.data.song.song_id)
    }
  },

  async loadSongDetail(songId) {
    const song = await getSongById(songId)
    if (!song) {
      showToast('歌曲不存在', 'none')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    // 加载练习记录
    const allLogs = await getPracticeLogs(songId)
    const practiceLogs = allLogs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10) // 只显示最近10条

    this.setData({
      song,
      practiceLogs
    })
  },

  // 编辑歌曲（跳转到编辑页面）
  editSong() {
    const songId = this.data.song.song_id || this.data.song._id
    wx.navigateTo({
      url: `/pages/songs/song-edit/song-edit?id=${songId}`
    })
  },

  // 添加练习记录
  addPracticeLog() {
    wx.navigateTo({
      url: `/pages/practice/practice-log/practice-log?songId=${this.data.song.song_id}`
    })
  },

  // 切换段落掌握状态（实时保存）
  async toggleSection(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法修改', 'none')
      return
    }
    const section = e.currentTarget.dataset.section
    const song = this.data.song
    const sections = { ...song.sections }
    sections[section] = !sections[section]
    
    // 计算新进度
    const { calculateProgress } = require('../../../utils/unified-storage.js')
    const newSong = { ...song, sections }
    const progress = calculateProgress(newSong)
    
    // 实时保存
    try {
      await updateSong(song.song_id || song._id, { sections, progress_percentage: progress })
      // 更新本地数据，无需重新加载
      this.setData({
        'song.sections': sections,
        'song.progress_percentage': progress
      })
      showToast('已保存', 'success', 1000)
    } catch (err) {
      showToast('保存失败', 'none')
    }
  },

  // 修改熟练度（实时保存）
  async changeProficiency(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法修改', 'none')
      return
    }
    const proficiency = parseInt(e.currentTarget.dataset.rating)
    const song = this.data.song
    
    // 实时保存
    try {
      await updateSong(song.song_id || song._id, { proficiency })
      // 更新本地数据，无需重新加载
      this.setData({
        'song.proficiency': proficiency
      })
      showToast('已保存', 'success', 1000)
    } catch (err) {
      showToast('保存失败', 'none')
    }
  },

  // 修改状态（实时保存）
  async changeStatus(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法修改', 'none')
      return
    }
    const status = e.currentTarget.dataset.status
    const song = this.data.song
    
    // 实时保存
    try {
      await updateSong(song.song_id || song._id, { status })
      // 更新本地数据，无需重新加载
      this.setData({
        'song.status': status
      })
      showToast('已保存', 'success', 1000)
    } catch (err) {
      showToast('保存失败', 'none')
    }
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
      const videoInfo = await chooseAndUploadVideo({
        name: `${this.data.song.title}_演示视频`,
        songId: this.data.song.song_id || this.data.song._id
      })
      
      const song = this.data.song
      const videos = song.demo_videos || []
      videos.push(videoInfo)
      
      await updateSong(song.song_id || song._id, { demo_videos: videos })
      showToast('上传成功', 'success')
      await this.loadSongDetail(song.song_id || song._id)
    } catch (err) {
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
          await updateSong(song.song_id, { demo_videos: videos })
          showToast('删除成功', 'success')
          await this.loadSongDetail(song.song_id)
        }
      }
    })
  },

  // 播放视频
  async playVideo(e) {
    const url = e.currentTarget.dataset.url
    await playVideo(url)
  },

  // 上传乐谱
  async uploadSheetMusic() {
    if (this.data.readonly) {
      showToast('只读模式，无法上传', 'none')
      return
    }
    try {
      const imageInfo = await chooseAndUploadImage({
        name: `${this.data.song.title}_乐谱`,
        songId: this.data.song.song_id || this.data.song._id,
        type: 'sheets'
      })
      
      const song = this.data.song
      const sheets = song.sheet_music || []
      sheets.push(imageInfo)
      
      await updateSong(song.song_id || song._id, { sheet_music: sheets })
      showToast('上传成功', 'success')
      await this.loadSongDetail(song.song_id || song._id)
    } catch (err) {
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
          await updateSong(song.song_id, { sheet_music: sheets })
          showToast('删除成功', 'success')
          await this.loadSongDetail(song.song_id)
        }
      }
    })
  },

  // 预览乐谱
  async previewSheetMusic(e) {
    const index = e.currentTarget.dataset.index
    const song = this.data.song
    const sheets = song.sheet_music || []
    // 获取所有图片的URL（可能是云存储fileID或本地路径）
    const urls = sheets.map(s => s.fileID || s.url)
    const currentUrl = sheets[index].fileID || sheets[index].url
    await previewImage(currentUrl, urls)
  }
})

