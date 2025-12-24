/**
 * 动态管理工具
 */

/**
 * 获取所有动态
 */
export function getPosts() {
  try {
    return wx.getStorageSync('posts') || []
  } catch (e) {
    console.error('获取动态列表失败:', e)
    return []
  }
}

/**
 * 保存动态列表
 */
export function savePosts(posts) {
  try {
    wx.setStorageSync('posts', posts)
    return true
  } catch (e) {
    console.error('保存动态列表失败:', e)
    return false
  }
}

/**
 * 添加动态
 */
export function addPost(post) {
  const posts = getPosts()
  const newPost = {
    ...post,
    post_id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  posts.unshift(newPost) // 最新的在前面
  return savePosts(posts) ? newPost : null
}

/**
 * 删除动态
 */
export function deletePost(postId) {
  const posts = getPosts()
  const filtered = posts.filter(post => post.post_id !== postId)
  return savePosts(filtered)
}

/**
 * 更新动态
 */
export function updatePost(postId, updates) {
  const posts = getPosts()
  const index = posts.findIndex(post => post.post_id === postId)
  if (index === -1) return null
  
  posts[index] = {
    ...posts[index],
    ...updates,
    updated_at: new Date().toISOString()
  }
  return savePosts(posts) ? posts[index] : null
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

