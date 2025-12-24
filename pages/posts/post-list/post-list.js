// pages/posts/post-list/post-list.js
import { getPosts, deletePost } from '../../../utils/posts.js'
import { getSongs } from '../../../utils/storage.js'
import { formatDate, showToast, showModal } from '../../../utils/util.js'

Page({
  data: {
    posts: [],
    readonly: false  // 只读模式
  },

  onLoad(options) {
    const readonly = options.readonly === 'true' || options.readonly === true
    this.setData({
      readonly: readonly
    })
    this.loadPosts()
  },

  onShow() {
    this.loadPosts()
  },

  loadPosts() {
    const posts = getPosts()
    // 按创建时间倒序排列
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )
    this.setData({
      posts: sortedPosts
    })
  },

  // 发布动态
  createPost() {
    if (this.data.readonly) {
      showToast('只读模式，无法发布', 'none')
      return
    }
    wx.navigateTo({
      url: '/pages/posts/post-edit/post-edit'
    })
  },

  // 编辑动态
  editPost(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法编辑', 'none')
      return
    }
    const postId = e.currentTarget.dataset.postId
    wx.navigateTo({
      url: `/pages/posts/post-edit/post-edit?id=${postId}`
    })
  },

  // 删除动态
  async deletePost(e) {
    if (this.data.readonly) {
      showToast('只读模式，无法删除', 'none')
      return
    }
    const postId = e.currentTarget.dataset.postId
    const post = this.data.posts.find(p => p.post_id === postId)
    
    const confirmed = await showModal('确认删除', '确定要删除这条动态吗？')
    if (confirmed) {
      if (deletePost(postId)) {
        showToast('删除成功', 'success')
        this.loadPosts()
      } else {
        showToast('删除失败', 'none')
      }
    }
  },

  // 格式化动态类型
  getPostTypeText(type) {
    const typeMap = {
      'song_coming': '新歌预告',
      'song_released': '新歌发布',
      'show': '演出信息'
    }
    return typeMap[type] || '动态'
  },

  // 格式化日期显示
  formatPostDate(date) {
    if (!date) return ''
    const postDate = new Date(date)
    const now = new Date()
    const diff = postDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) {
      return formatDate(date, 'YYYY-MM-DD')
    } else if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '明天'
    } else if (days <= 7) {
      return `${days}天后`
    } else {
      return formatDate(date, 'YYYY-MM-DD')
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls || [url]
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 分享（注意：当前使用本地存储，分享后别人看到的是他们自己的数据）
  onShareAppMessage() {
    if (!this.data.readonly) {
      wx.showModal({
        title: '提示',
        content: '当前使用本地存储，分享后朋友看到的是他们自己的数据。如需分享你的数据，请先集成云开发。',
        showCancel: false
      })
    }
    return {
      title: '我的音乐动态',
      path: '/pages/posts/post-list/post-list?readonly=true'
    }
  }
})

