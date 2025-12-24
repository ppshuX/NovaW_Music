// pages/songs/song-edit/song-edit.js
import { getSongById, addSong, updateSong, calculateProgress } from '../../../utils/storage.js'
import { SongSchema } from '../../../types/index.js'
import { showToast } from '../../../utils/util.js'

Page({
  data: {
    songId: null,
    isEdit: false,
    formData: {
      title: '',
      artist: '',
      key: '',
      capo: 0,
      status: '未开始',
      proficiency: 1,
      difficulty: 1,
      tags: [],
      sections: {
        intro: false,
        verse: false,
        chorus: false,
        bridge: false
      },
      technical_points: [],
      notes: '',
      expected_release_date: '',
      is_private: false
    },
    tagInput: '',
    techPointInput: '',
    statusOptions: ['未开始', '练习中', '可录制', '已完成']
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.setData({
        songId: options.id,
        isEdit: true
      })
      this.loadSong(options.id)
    }
  },

  loadSong(songId) {
    const song = getSongById(songId)
    if (song) {
      this.setData({
        formData: {
          title: song.title || '',
          artist: song.artist || '',
          key: song.key || '',
          capo: song.capo || 0,
          status: song.status || '未开始',
          proficiency: song.proficiency || 1,
          difficulty: song.difficulty || 1,
          tags: song.tags || [],
          sections: song.sections || {
            intro: false,
            verse: false,
            chorus: false,
            bridge: false
          },
          technical_points: song.technical_points || [],
          notes: song.notes || '',
          expected_release_date: song.expected_release_date || '',
          is_private: song.is_private || false
        }
      })
    }
  },

  // 输入处理
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  onArtistInput(e) {
    this.setData({
      'formData.artist': e.detail.value
    })
  },

  onKeyInput(e) {
    this.setData({
      'formData.key': e.detail.value
    })
  },

  onCapoInput(e) {
    this.setData({
      'formData.capo': parseInt(e.detail.value) || 0
    })
  },

  onNotesInput(e) {
    this.setData({
      'formData.notes': e.detail.value
    })
  },

  onReleaseDateChange(e) {
    this.setData({
      'formData.expected_release_date': e.detail.value
    })
  },

  // 状态选择
  onStatusChange(e) {
    this.setData({
      'formData.status': this.data.statusOptions[e.detail.value]
    })
  },

  // 熟练度选择
  onProficiencyChange(e) {
    this.setData({
      'formData.proficiency': parseInt(e.detail.value) + 1
    })
  },

  // 难度选择
  onDifficultyChange(e) {
    this.setData({
      'formData.difficulty': parseInt(e.detail.value) + 1
    })
  },

  // 标签输入
  onTagInput(e) {
    this.setData({
      tagInput: e.detail.value
    })
  },

  // 添加标签
  addTag() {
    const tag = this.data.tagInput.trim()
    if (!tag) return
    
    const tags = [...this.data.formData.tags]
    if (!tags.includes(tag)) {
      tags.push(tag)
      this.setData({
        'formData.tags': tags,
        tagInput: ''
      })
    }
  },

  // 删除标签
  removeTag(e) {
    const index = e.currentTarget.dataset.index
    const tags = [...this.data.formData.tags]
    tags.splice(index, 1)
    this.setData({
      'formData.tags': tags
    })
  },

  // 技术要点输入
  onTechPointInput(e) {
    this.setData({
      techPointInput: e.detail.value
    })
  },

  // 添加技术要点
  addTechPoint() {
    const point = this.data.techPointInput.trim()
    if (!point) return
    
    const points = [...this.data.formData.technical_points]
    if (!points.includes(point)) {
      points.push(point)
      this.setData({
        'formData.technical_points': points,
        techPointInput: ''
      })
    }
  },

  // 删除技术要点
  removeTechPoint(e) {
    const index = e.currentTarget.dataset.index
    const points = [...this.data.formData.technical_points]
    points.splice(index, 1)
    this.setData({
      'formData.technical_points': points
    })
  },

  // 切换段落
  toggleSection(e) {
    const section = e.currentTarget.dataset.section
    const sections = { ...this.data.formData.sections }
    sections[section] = !sections[section]
    this.setData({
      'formData.sections': sections
    })
  },

  // 切换私密状态
  togglePrivate() {
    this.setData({
      'formData.is_private': !this.data.formData.is_private
    })
  },

  // 保存
  save() {
    const { formData, isEdit, songId } = this.data
    
    // 验证必填项
    if (!formData.title.trim()) {
      showToast('请输入歌曲名', 'none')
      return
    }
    
    if (!formData.artist.trim()) {
      showToast('请输入艺术家', 'none')
      return
    }

    // 计算进度
    const progress = calculateProgress(formData)

    if (isEdit) {
      // 更新
      const updated = updateSong(songId, {
        ...formData,
        progress_percentage: progress
      })
      if (updated) {
        showToast('保存成功', 'success')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast('保存失败', 'none')
      }
    } else {
      // 新增
      const newSong = addSong({
        ...formData,
        progress_percentage: progress
      })
      if (newSong) {
        showToast('添加成功', 'success')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast('添加失败', 'none')
      }
    }
  }
})

