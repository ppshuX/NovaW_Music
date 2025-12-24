// pages/posts/post-list/post-list.js
import { getPosts, deletePost, isOwner } from '../../../utils/unified-storage.js'
import { formatDate, showToast, showModal } from '../../../utils/util.js'

Page({
  data: {
    posts: [],
    practicingPosts: [],  // 练习中
    showPosts: [],        // 小演出
    plannedPosts: [],     // 计划中
    readonly: false,      // 只读模式（访客模式）
    isOwner: false        // 是否是主人
  },

  async onLoad(options) {
    // 判断是否是主人
    const owner = await isOwner()
    const readonly = !owner || (options.readonly === 'true' || options.readonly === true)
    this.setData({
      readonly: readonly,
      isOwner: owner
    })
    await this.loadPosts()
  },

  async onShow() {
    await this.loadPosts()
  },

  async loadPosts() {
    const posts = await getPosts()
    
    // 分类动态
    const now = new Date()
    const practicingPosts = []  // 练习中
    const showPosts = []        // 小演出
    const plannedPosts = []     // 计划中
    
    posts.forEach(post => {
      const postDate = post.date ? new Date(post.date) : null
      const isFuture = postDate && postDate > now
      
      // 根据类型和日期分类
      if (post.type === 'show') {
        // 演出信息 -> 小演出
        showPosts.push(post)
      } else if (isFuture) {
        // 未来日期的 -> 计划中
        plannedPosts.push(post)
      } else {
        // 歌曲相关（song_coming, song_released）且不是未来 -> 练习中
        practicingPosts.push(post)
      }
    })
    
    // 每个分类按时间倒序排列
    const sortByDate = (a, b) => new Date(b.created_at) - new Date(a.created_at)
    practicingPosts.sort(sortByDate)
    showPosts.sort(sortByDate)
    plannedPosts.sort(sortByDate)
    
    this.setData({
      posts: posts,  // 保留全部用于其他功能
      practicingPosts: practicingPosts,
      showPosts: showPosts,
      plannedPosts: plannedPosts
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
    if (this.data.readonly || !this.data.isOwner) {
      showToast('只读模式，无法删除', 'none')
      return
    }
    const postId = e.currentTarget.dataset.postId
    const post = this.data.posts.find(p => p.post_id === postId)
    
    const confirmed = await showModal('确认删除', '确定要删除这条动态吗？')
    if (confirmed) {
      try {
        await deletePost(postId)
        showToast('删除成功', 'success')
        await this.loadPosts()
      } catch (err) {
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

  // 分享
  onShareAppMessage() {
    return {
      title: '我的音乐动态',
      path: '/pages/posts/post-list/post-list?readonly=true'
    }
  }
})

