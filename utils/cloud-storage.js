/**
 * 云开发存储工具
 * 用于将数据存储到云端，实现数据共享
 */

/**
 * 初始化云开发（在app.js中调用）
 */
export function initCloud() {
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    return false
  }
  
  wx.cloud.init({
    // env: 'your-env-id', // 云开发环境ID，需要在微信开发者工具中获取
    traceUser: true,
  })
  
  return true
}

/**
 * 获取当前用户OpenID
 */
export function getCurrentUserOpenId() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        resolve(res.result.openid)
      },
      fail: err => {
        console.error('获取OpenID失败:', err)
        // 如果云函数不存在，使用本地存储的openid
        const openid = wx.getStorageSync('openid')
        if (openid) {
          resolve(openid)
        } else {
          reject(err)
        }
      }
    })
  })
}

/**
 * 获取歌曲列表（从云数据库）
 */
export function getSongsFromCloud() {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      const songs = wx.getStorageSync('songs') || []
      resolve(songs)
      return
    }

    wx.cloud.database().collection('songs')
      .get()
      .then(res => {
        resolve(res.data || [])
      })
      .catch(err => {
        console.error('从云数据库获取歌曲失败:', err)
        // 降级到本地存储
        const songs = wx.getStorageSync('songs') || []
        resolve(songs)
      })
  })
}

/**
 * 保存歌曲到云数据库
 */
export function saveSongsToCloud(songs) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      wx.setStorageSync('songs', songs)
      resolve(true)
      return
    }

    // 批量更新（先删除所有，再添加）
    const db = wx.cloud.database()
    db.collection('songs')
      .get()
      .then(res => {
        // 删除所有现有数据
        const deletePromises = res.data.map(item => 
          db.collection('songs').doc(item._id).remove()
        )
        return Promise.all(deletePromises)
      })
      .then(() => {
        // 添加新数据
        if (songs.length === 0) {
          resolve(true)
          return
        }
        return db.collection('songs').add({
          data: songs
        })
      })
      .then(() => {
        resolve(true)
      })
      .catch(err => {
        console.error('保存到云数据库失败:', err)
        // 降级到本地存储
        wx.setStorageSync('songs', songs)
        resolve(true)
      })
  })
}

/**
 * 添加歌曲到云数据库
 */
export function addSongToCloud(song) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      const songs = wx.getStorageSync('songs') || []
      const newSong = {
        ...song,
        song_id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      songs.push(newSong)
      wx.setStorageSync('songs', songs)
      resolve(newSong)
      return
    }

    const db = wx.cloud.database()
    db.collection('songs').add({
      data: {
        ...song,
        song_id: song.song_id || generateId(),
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    .then(res => {
      resolve({ ...song, _id: res._id })
    })
    .catch(err => {
      console.error('添加到云数据库失败:', err)
      reject(err)
    })
  })
}

/**
 * 更新歌曲（云数据库）
 */
export function updateSongInCloud(songId, updates) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      const songs = wx.getStorageSync('songs') || []
      const index = songs.findIndex(s => s.song_id === songId)
      if (index !== -1) {
        songs[index] = { ...songs[index], ...updates, updated_at: new Date().toISOString() }
        wx.setStorageSync('songs', songs)
        resolve(songs[index])
      } else {
        reject(new Error('歌曲不存在'))
      }
      return
    }

    const db = wx.cloud.database()
    db.collection('songs')
      .where({ song_id: songId })
      .get()
      .then(res => {
        if (res.data.length === 0) {
          reject(new Error('歌曲不存在'))
          return
        }
        return db.collection('songs').doc(res.data[0]._id).update({
          data: {
            ...updates,
            updated_at: new Date()
          }
        })
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}

/**
 * 删除歌曲（云数据库）
 */
export function deleteSongFromCloud(songId) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      const songs = wx.getStorageSync('songs') || []
      const filtered = songs.filter(s => s.song_id !== songId)
      wx.setStorageSync('songs', filtered)
      resolve(true)
      return
    }

    const db = wx.cloud.database()
    db.collection('songs')
      .where({ song_id: songId })
      .get()
      .then(res => {
        if (res.data.length === 0) {
          reject(new Error('歌曲不存在'))
          return
        }
        return db.collection('songs').doc(res.data[0]._id).remove()
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}

/**
 * 获取练习记录（云数据库）
 */
export function getPracticeLogsFromCloud(songId = null) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      const logs = wx.getStorageSync('practice_logs') || []
      const filtered = songId ? logs.filter(log => log.song_id === songId) : logs
      resolve(filtered)
      return
    }

    const db = wx.cloud.database()
    let query = db.collection('practice_logs')
    
    if (songId) {
      query = query.where({ song_id: songId })
    }
    
    query.get()
      .then(res => {
        resolve(res.data || [])
      })
      .catch(err => {
        console.error('从云数据库获取练习记录失败:', err)
        const logs = wx.getStorageSync('practice_logs') || []
        resolve(songId ? logs.filter(log => log.song_id === songId) : logs)
      })
  })
}

/**
 * 添加练习记录（云数据库）
 */
export function addPracticeLogToCloud(log) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      const logs = wx.getStorageSync('practice_logs') || []
      const newLog = { ...log, log_id: generateId(), created_at: new Date().toISOString() }
      logs.push(newLog)
      wx.setStorageSync('practice_logs', logs)
      resolve(newLog)
      return
    }

    const db = wx.cloud.database()
    db.collection('practice_logs').add({
      data: {
        ...log,
        log_id: log.log_id || generateId(),
        created_at: new Date()
      }
    })
    .then(res => {
      resolve({ ...log, _id: res._id })
    })
    .catch(reject)
  })
}

/**
 * 获取动态（云数据库）
 */
export function getPostsFromCloud() {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      const posts = wx.getStorageSync('posts') || []
      resolve(posts)
      return
    }

    wx.cloud.database().collection('posts')
      .orderBy('created_at', 'desc')
      .get()
      .then(res => {
        resolve(res.data || [])
      })
      .catch(err => {
        console.error('从云数据库获取动态失败:', err)
        const posts = wx.getStorageSync('posts') || []
        resolve(posts)
      })
  })
}

/**
 * 添加动态（云数据库）
 */
export function addPostToCloud(post) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      const posts = wx.getStorageSync('posts') || []
      const newPost = { ...post, post_id: generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      posts.unshift(newPost)
      wx.setStorageSync('posts', posts)
      resolve(newPost)
      return
    }

    const db = wx.cloud.database()
    db.collection('posts').add({
      data: {
        ...post,
        post_id: post.post_id || generateId(),
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    .then(res => {
      resolve({ ...post, _id: res._id })
    })
    .catch(reject)
  })
}

/**
 * 更新动态（云数据库）
 */
export function updatePostInCloud(postId, updates) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      const posts = wx.getStorageSync('posts') || []
      const index = posts.findIndex(p => p.post_id === postId)
      if (index !== -1) {
        posts[index] = { ...posts[index], ...updates, updated_at: new Date().toISOString() }
        wx.setStorageSync('posts', posts)
        resolve(posts[index])
      } else {
        reject(new Error('动态不存在'))
      }
      return
    }

    const db = wx.cloud.database()
    db.collection('posts')
      .where({ post_id: postId })
      .get()
      .then(res => {
        if (res.data.length === 0) {
          reject(new Error('动态不存在'))
          return
        }
        return db.collection('posts').doc(res.data[0]._id).update({
          data: {
            ...updates,
            updated_at: new Date()
          }
        })
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}

/**
 * 删除动态（云数据库）
 */
export function deletePostFromCloud(postId) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      const posts = wx.getStorageSync('posts') || []
      const filtered = posts.filter(p => p.post_id !== postId)
      wx.setStorageSync('posts', filtered)
      resolve(true)
      return
    }

    const db = wx.cloud.database()
    db.collection('posts')
      .where({ post_id: postId })
      .get()
      .then(res => {
        if (res.data.length === 0) {
          reject(new Error('动态不存在'))
          return
        }
        return db.collection('posts').doc(res.data[0]._id).remove()
      })
      .then(() => {
        resolve(true)
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
      // 降级到本地存储
      resolve(filePath)
      return
    }

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        resolve(res.fileID)
      },
      fail: err => {
        console.error('上传到云存储失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 删除云存储文件
 */
export function deleteFileFromCloud(fileID) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      resolve(true)
      return
    }

    wx.cloud.deleteFile({
      fileList: [fileID],
      success: () => {
        resolve(true)
      },
      fail: err => {
        console.error('删除云存储文件失败:', err)
        resolve(true) // 即使失败也resolve，因为可能是本地文件
      }
    })
  })
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
