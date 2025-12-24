// pages/posts/post-edit/post-edit.js
import { getPosts, addPost, updatePost, getSongs, isOwner } from '../../../utils/unified-storage.js'
import { showToast } from '../../../utils/util.js'
import { chooseAndUploadImage } from '../../../utils/file-upload.js'

Page({
  data: {
    postId: null,
    isEdit: false,
    postType: 'song_coming', // song_coming, song_released, show
    postTypeIndex: 0,
    selectedSongIndex: -1,
    formData: {
      title: '',
      content: '',
      song_id: '',
      song_title: '',
      date: '',
      location: '',
      images: []
    },
    songs: [],
    typeOptions: [
      { value: 'song_coming', label: '新歌预告' },
      { value: 'song_released', label: '新歌发布' },
      { value: 'show', label: '演出信息' }
    ],
    currentTypeLabel: '新歌预告'
  },

  async onLoad(options) {
    // 检查是否是主人
    const owner = await isOwner()
    if (!owner) {
      showToast('只读模式，无法编辑', 'none')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    if (options.id) {
      this.setData({
        postId: options.id,
        isEdit: true
      })
      await this.loadPost(options.id)
    }
    await this.loadSongs()
  },

  async loadSongs() {
    const songs = await getSongs()
    this.setData({
      songs
    })
    // 更新歌曲索引
    this.updateSongIndex()
  },

  // 更新歌曲索引
  updateSongIndex() {
    if (this.data.formData.song_id) {
      const songIndex = this.data.songs.findIndex(s => s.song_id === this.data.formData.song_id)
      this.setData({
        selectedSongIndex: songIndex >= 0 ? songIndex : -1
      })
    }
  },

  async loadPost(postId) {
    const posts = await getPosts()
    const post = posts.find(p => p.post_id === postId)
    if (post) {
      // 计算类型索引
      const typeIndex = this.data.typeOptions.findIndex(t => t.value === post.type)
      const typeLabel = this.data.typeOptions[typeIndex]?.label || '新歌预告'
      
      // 计算歌曲索引（稍后在loadSongs后更新）
      this.setData({
        postType: post.type,
        postTypeIndex: typeIndex >= 0 ? typeIndex : 0,
        currentTypeLabel: typeLabel,
        formData: {
          title: post.title || '',
          content: post.content || '',
          song_id: post.song_id || '',
          song_title: post.song_title || '',
          date: post.date || '',
          location: post.location || '',
          images: post.images || []
        }
      })
      
      // 加载歌曲后更新歌曲索引
      this.updateSongIndex()
    }
  },

  // 选择动态类型
  onTypeChange(e) {
    const index = parseInt(e.detail.value)
    const type = this.data.typeOptions[index].value
    const label = this.data.typeOptions[index].label
    this.setData({
      postType: type,
      postTypeIndex: index,
      currentTypeLabel: label
    })
  },

  // 输入处理
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  onContentInput(e) {
    this.setData({
      'formData.content': e.detail.value
    })
  },

  onLocationInput(e) {
    this.setData({
      'formData.location': e.detail.value
    })
  },

  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  // 选择歌曲
  onSongChange(e) {
    const index = parseInt(e.detail.value)
    const song = this.data.songs[index]
    if (song) {
      this.setData({
        'formData.song_id': song.song_id,
        'formData.song_title': song.title,
        selectedSongIndex: index
      })
    }
  },

  // 上传图片
  async uploadImage() {
    try {
      const imageInfo = await chooseAndUploadImage()
      const images = [...this.data.formData.images, imageInfo.url]
      this.setData({
        'formData.images': images
      })
      showToast('上传成功', 'success')
    } catch (err) {
      if (err.message !== '未选择图片') {
        showToast('上传失败', 'none')
      }
    }
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.formData.images]
    images.splice(index, 1)
    this.setData({
      'formData.images': images
    })
  },

  // 保存
  async save() {
    const { formData, postType, isEdit, postId } = this.data
    
    if (!formData.title.trim()) {
      showToast('请输入标题', 'none')
      return
    }

    const postData = {
      type: postType,
      title: formData.title,
      content: formData.content,
      song_id: formData.song_id,
      song_title: formData.song_title,
      date: formData.date,
      location: formData.location,
      images: formData.images
    }

    try {
      if (isEdit) {
        await updatePost(postId, postData)
        showToast('保存成功', 'success')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        await addPost(postData)
        showToast('发布成功', 'success')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (err) {
      showToast(isEdit ? '保存失败' : '发布失败', 'none')
    }
  }
})

