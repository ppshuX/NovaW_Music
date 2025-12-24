// pages/posts/post-edit/post-edit.js
import { getPosts, addPost, updatePost } from '../../../utils/posts.js'
import { getSongs } from '../../../utils/storage.js'
import { showToast } from '../../../utils/util.js'
import { chooseAndUploadImage } from '../../../utils/file-upload.js'

Page({
  data: {
    postId: null,
    isEdit: false,
    postType: 'song_coming', // song_coming, song_released, show
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
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        postId: options.id,
        isEdit: true
      })
      this.loadPost(options.id)
    }
    this.loadSongs()
  },

  loadSongs() {
    const songs = getSongs()
    this.setData({
      songs
    })
  },

  loadPost(postId) {
    const posts = getPosts()
    const post = posts.find(p => p.post_id === postId)
    if (post) {
      this.setData({
        postType: post.type,
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
    }
  },

  // 选择动态类型
  onTypeChange(e) {
    const index = e.detail.value
    const type = this.data.typeOptions[index].value
    this.setData({
      postType: type
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
    const index = e.detail.value
    const song = this.data.songs[index]
    if (song) {
      this.setData({
        'formData.song_id': song.song_id,
        'formData.song_title': song.title
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
  save() {
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

    if (isEdit) {
      const updated = updatePost(postId, postData)
      if (updated) {
        showToast('保存成功', 'success')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast('保存失败', 'none')
      }
    } else {
      const newPost = addPost(postData)
      if (newPost) {
        showToast('发布成功', 'success')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast('发布失败', 'none')
      }
    }
  }
})

