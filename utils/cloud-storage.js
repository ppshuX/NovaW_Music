/**
 * 云开发存储工具（可选）
 * 如果需要实现数据分享功能，可以使用此工具替换本地存储
 * 
 * 使用前需要：
 * 1. 在微信开发者工具中开通云开发
 * 2. 创建云数据库集合
 * 3. 在 app.js 中初始化云开发
 */

/**
 * 获取歌曲列表（云数据库版本）
 */
export function getSongsFromCloud() {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }

    wx.cloud.database().collection('songs')
      .where({
        _openid: '{openid}'
      })
      .orderBy('updated_at', 'desc')
      .get()
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

/**
 * 添加歌曲（云数据库版本）
 */
export function addSongToCloud(song) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }

    wx.cloud.database().collection('songs')
      .add({
        data: {
          ...song,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
      .then(res => {
        resolve(res._id)
      })
      .catch(reject)
  })
}

/**
 * 获取公开歌曲（供他人查看）
 * @param {String} userId - 用户ID（可选，如果不提供则获取当前用户）
 */
export function getPublicSongsFromCloud(userId = null) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }

    const db = wx.cloud.database()
    let query = db.collection('songs').where({
      is_private: false
    })

    // 如果指定了用户ID，只获取该用户的歌曲
    if (userId) {
      query = query.where({
        _openid: userId
      })
    }

    query
      .orderBy('updated_at', 'desc')
      .get()
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

/**
 * 上传文件到云存储
 */
export function uploadFileToCloud(filePath, cloudPath) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        resolve(res.fileID)
      },
      fail: reject
    })
  })
}

/**
 * 获取公开动态（供他人查看）
 * @param {String} userId - 用户ID
 */
export function getPublicPostsFromCloud(userId) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }

    wx.cloud.database().collection('posts')
      .where({
        _openid: userId
      })
      .orderBy('created_at', 'desc')
      .get()
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

