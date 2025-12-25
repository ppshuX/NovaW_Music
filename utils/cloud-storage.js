/**
 * 云开发存储工具
 * 用于将数据存储到云端，实现数据共享
 */

/**
 * 初始化云开发（在app.js中调用）
 */
export function initCloud(envId = null) {
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    return false
  }
  
  const config = {}
  if (envId) {
    config.env = envId
  }
  config.traceUser = true
  
  wx.cloud.init(config)
  
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
 * 注意：云数据库权限设置为所有人可读，所以所有访问者都能看到数据
 */
export function getSongsFromCloud() {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      const songs = wx.getStorageSync('songs') || []
      resolve(songs)
      return
    }

    const db = wx.cloud.database()
    db.collection('songs')
      .orderBy('updated_at', 'desc')
      .get()
      .then(res => {
        // 转换数据格式（云数据库的_id转换为song_id）
        const songs = (res.data || []).map(item => {
          const { _id, _openid, ...songData } = item
          return {
            ...songData,
            song_id: songData.song_id || _id,  // 优先使用song_id，否则使用_id
            _id: _id,
            _openid: _openid
          }
        })
        resolve(songs)
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
 * 添加歌曲到云数据库（单个）
 */
export function addSongToCloud(song) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      const songs = wx.getStorageSync('songs') || []
      const newSong = {
        ...song,
        song_id: song.song_id || generateId(),
        created_at: new Date(),
        updated_at: new Date()
      }
      songs.push(newSong)
      wx.setStorageSync('songs', songs)
      resolve(newSong)
      return
    }

    const db = wx.cloud.database()
    const songData = {
      ...song,
      song_id: song.song_id || generateId(),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    // 移除_id字段（云数据库会自动生成）
    delete songData._id
    
    db.collection('songs').add({
      data: songData
    })
    .then(res => {
      resolve({ ...songData, _id: res._id })
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
      const index = songs.findIndex(s => s.song_id === songId || s._id === songId)
      if (index !== -1) {
        songs[index] = { ...songs[index], ...updates, updated_at: new Date() }
        wx.setStorageSync('songs', songs)
        resolve(songs[index])
      } else {
        reject(new Error('歌曲不存在'))
      }
      return
    }

    const db = wx.cloud.database()
    // 先尝试用song_id查找，如果找不到，尝试用_id
    db.collection('songs')
      .where({ song_id: songId })
      .get()
      .then(res => {
        if (res.data.length === 0) {
          // 尝试用_id查找
          return db.collection('songs').doc(songId).get()
        }
        return Promise.resolve(res)
      })
      .then(res => {
        const docId = res.data && res.data[0] ? res.data[0]._id : (res._id || songId)
        return db.collection('songs').doc(docId).update({
          data: {
            ...updates,
            updated_at: new Date()
          }
        }).then(() => {
          // 返回更新后的文档
          return db.collection('songs').doc(docId).get()
        })
      })
      .then(res => {
        if (res.data) {
          const { _id, _openid, ...songData } = res.data
          resolve({
            ...songData,
            song_id: songData.song_id || _id,
            _id: _id
          })
        } else {
          resolve(true)
        }
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
      const filtered = songs.filter(s => s.song_id !== songId && s._id !== songId)
      wx.setStorageSync('songs', filtered)
      resolve(true)
      return
    }

    const db = wx.cloud.database()
    // 先尝试用song_id查找，如果找不到，尝试用_id
    db.collection('songs')
      .where({ song_id: songId })
      .get()
      .then(res => {
        if (res.data.length === 0) {
          // 尝试用_id删除
          return db.collection('songs').doc(songId).remove()
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
 * @param {String} filePath - 本地文件路径
 * @param {String} cloudPath - 云存储路径（如：music/songs/demo_123.mp4）
 * @returns {Promise<String>} 返回云存储文件ID（fileID）
 */
export function uploadFileToCloud(filePath, cloudPath) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 降级到本地存储
      console.warn('云开发未初始化，使用本地路径')
      resolve(filePath)
      return
    }

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        console.log('上传成功，fileID:', res.fileID)
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
 * 上传视频到云存储（带缩略图）
 * @param {String} videoPath - 视频文件路径
 * @param {String} songId - 歌曲ID
 * @param {String} name - 视频名称
 * @returns {Promise<Object>} 返回 {fileID, thumbnail, name, duration}
 */
export function uploadVideoToCloud(videoPath, songId, name = 'demo') {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }

    const timestamp = Date.now()
    const videoExt = videoPath.split('.').pop() || 'mp4'
    const cloudPath = `music/songs/${songId}/demos/video_${timestamp}.${videoExt}`
    
    // 先上传视频
    uploadFileToCloud(videoPath, cloudPath)
      .then(fileID => {
        // 获取视频信息（包括缩略图）
        wx.getVideoInfo({
          src: videoPath,
          success: (res) => {
            resolve({
              fileID: fileID,
              name: name,
              duration: res.duration || 0,
              thumbnail: res.thumbTempFilePath || '',  // 缩略图路径（需要单独上传）
              uploaded_at: new Date().toISOString()
            })
          },
          fail: () => {
            // 如果获取视频信息失败，仍然返回基本数据
            resolve({
              fileID: fileID,
              name: name,
              duration: 0,
              thumbnail: '',
              uploaded_at: new Date().toISOString()
            })
          }
        })
      })
      .catch(reject)
  })
}

/**
 * 上传图片到云存储
 * @param {String} imagePath - 图片文件路径
 * @param {String} songId - 歌曲ID（或postId）
 * @param {String} type - 类型（sheets/demos/images）
 * @param {String} name - 文件名称
 * @returns {Promise<String>} 返回云存储文件ID
 */
export function uploadImageToCloud(imagePath, songId, type = 'images', name = 'image') {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }

    const timestamp = Date.now()
    const imageExt = imagePath.split('.').pop() || 'jpg'
    const cloudPath = `music/songs/${songId}/${type}/${name}_${timestamp}.${imageExt}`
    
    uploadFileToCloud(imagePath, cloudPath)
      .then(resolve)
      .catch(reject)
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

/**
 * 获取云存储文件的临时URL（用于显示）
 * @param {String} fileID - 云存储文件ID
 * @returns {Promise<String>} 返回临时URL
 */
export function getCloudFileTempURL(fileID) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      // 如果不是云存储文件，直接返回
      resolve(fileID)
      return
    }

    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        if (res.fileList && res.fileList.length > 0) {
          resolve(res.fileList[0].tempFileURL)
        } else {
          resolve(fileID)
        }
      },
      fail: err => {
        console.error('获取临时URL失败:', err)
        resolve(fileID)  // 失败时返回原fileID
      }
    })
  })
}

/**
 * 批量获取云存储文件的临时URL
 * @param {Array<String>} fileIDs - 云存储文件ID数组
 * @returns {Promise<Array<String>>} 返回临时URL数组
 */
export function getCloudFilesTempURL(fileIDs) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud || !fileIDs || fileIDs.length === 0) {
      resolve(fileIDs || [])
      return
    }

    wx.cloud.getTempFileURL({
      fileList: fileIDs,
      success: res => {
        const urls = res.fileList.map(item => item.tempFileURL || item.fileID)
        resolve(urls)
      },
      fail: err => {
        console.error('获取临时URL失败:', err)
        resolve(fileIDs)  // 失败时返回原fileIDs
      }
    })
  })
}

