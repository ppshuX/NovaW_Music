/**
 * 文件上传工具
 * 支持视频和图片（乐谱）上传
 * 自动选择云存储或本地存储
 */

import { showToast, showLoading, hideLoading } from './util.js'
import { USE_CLOUD } from '../config/index.js'
import { uploadVideoToCloud, uploadImageToCloud, getCloudFileTempURL } from './cloud-storage.js'

/**
 * 选择并上传视频
 * @param {Object} options - 配置选项
 * @returns {Promise} 返回文件信息
 */
export function chooseAndUploadVideo(options = {}) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: options.count || 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: options.maxDuration || 60, // 默认60秒
      camera: 'back',
      success: (res) => {
        const tempFiles = res.tempFiles
        if (tempFiles.length === 0) {
          reject(new Error('未选择视频'))
          return
        }

        // 处理视频文件
        const videoFile = tempFiles[0]
        const filePath = videoFile.tempFilePath
        const fileSize = videoFile.size
        const duration = videoFile.duration

        // 检查文件大小（限制100MB）
        const maxSize = 100 * 1024 * 1024
        if (fileSize > maxSize) {
          showToast('视频文件过大，请选择小于100MB的视频', 'none')
          reject(new Error('文件过大'))
          return
        }

        // 根据配置选择上传方式
        if (USE_CLOUD && wx.cloud) {
          // 使用云存储
          const songId = options.songId || 'default'
          const name = options.name || `视频_${Date.now()}`
          
          showLoading('上传中...')
          uploadVideoToCloud(filePath, songId, name)
            .then(videoInfo => {
              hideLoading()
              // 获取临时URL用于显示
              if (videoInfo.thumbnail) {
                // 如果有缩略图，也上传到云存储
                uploadImageToCloud(videoInfo.thumbnail, songId, 'demos', 'thumbnail')
                  .then(thumbnailID => {
                    videoInfo.thumbnail = thumbnailID
                    resolve(videoInfo)
                  })
                  .catch(() => {
                    resolve(videoInfo)
                  })
              } else {
                resolve(videoInfo)
              }
            })
            .catch(err => {
              hideLoading()
              console.error('上传到云存储失败:', err)
              // 降级到本地存储
              saveFileToLocal(filePath, 'video').then(savedPath => {
                resolve({
                  url: savedPath,
                  fileID: savedPath,  // 本地文件时，url和fileID相同
                  name: name,
                  date: new Date().toISOString().split('T')[0],
                  type: 'video',
                  size: fileSize,
                  duration: duration,
                  originalPath: filePath
                })
              }).catch(reject)
            })
        } else {
          // 使用本地存储
          saveFileToLocal(filePath, 'video').then(savedPath => {
            const fileInfo = {
              url: savedPath,
              fileID: savedPath,  // 本地文件时，url和fileID相同
              name: options.name || `视频_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'video',
              size: fileSize,
              duration: duration,
              originalPath: filePath
            }
            resolve(fileInfo)
          }).catch(err => {
            reject(err)
          })
        }
      },
      fail: (err) => {
        console.error('选择视频失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 选择并上传图片（乐谱）
 * @param {Object} options - 配置选项
 * @returns {Promise} 返回文件信息
 */
export function chooseAndUploadImage(options = {}) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: options.count || 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: (res) => {
        const tempFiles = res.tempFiles
        if (tempFiles.length === 0) {
          reject(new Error('未选择图片'))
          return
        }

        // 处理图片文件
        const imageFile = tempFiles[0]
        const filePath = imageFile.tempFilePath
        const fileSize = imageFile.size

        // 检查文件大小（限制10MB）
        const maxSize = 10 * 1024 * 1024
        if (fileSize > maxSize) {
          showToast('图片文件过大，请选择小于10MB的图片', 'none')
          reject(new Error('文件过大'))
          return
        }

        // 根据配置选择上传方式
        if (USE_CLOUD && wx.cloud) {
          // 使用云存储
          const songId = options.songId || options.postId || 'default'
          const type = options.type || 'sheets'  // sheets/images
          const name = options.name || `图片_${Date.now()}`
          
          showLoading('上传中...')
          uploadImageToCloud(filePath, songId, type, name)
            .then(fileID => {
              hideLoading()
              // 获取临时URL用于显示
              getCloudFileTempURL(fileID).then(tempURL => {
                resolve({
                  url: tempURL,  // 临时URL用于显示
                  fileID: fileID,  // 云存储文件ID用于存储
                  name: name,
                  date: new Date().toISOString().split('T')[0],
                  type: 'image',
                  size: fileSize,
                  originalPath: filePath
                })
              }).catch(() => {
                resolve({
                  url: fileID,
                  fileID: fileID,
                  name: name,
                  date: new Date().toISOString().split('T')[0],
                  type: 'image',
                  size: fileSize,
                  originalPath: filePath
                })
              })
            })
            .catch(err => {
              hideLoading()
              console.error('上传到云存储失败:', err)
              // 降级到本地存储
              saveFileToLocal(filePath, 'image').then(savedPath => {
                resolve({
                  url: savedPath,
                  fileID: savedPath,
                  name: name,
                  date: new Date().toISOString().split('T')[0],
                  type: 'image',
                  size: fileSize,
                  originalPath: filePath
                })
              }).catch(reject)
            })
        } else {
          // 使用本地存储
          saveFileToLocal(filePath, 'image').then(savedPath => {
            const fileInfo = {
              url: savedPath,
              fileID: savedPath,
              name: options.name || `乐谱_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'image',
              size: fileSize,
              originalPath: filePath
            }
            resolve(fileInfo)
          }).catch(err => {
            reject(err)
          })
        }
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 保存文件到本地
 * @param {String} tempFilePath - 临时文件路径
 * @param {String} type - 文件类型 (video/image)
 * @returns {Promise} 返回保存后的文件路径
 */
function saveFileToLocal(tempFilePath, type) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager()
    const fileName = `${type}_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`
    
    // 使用用户文件目录
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`

    // 保存文件
    fs.saveFile({
      tempFilePath: tempFilePath,
      success: (res) => {
        // 保存成功，返回保存后的路径
        resolve(res.savedFilePath)
      },
      fail: (err) => {
        console.error('保存文件失败:', err)
        // 如果保存失败，使用临时路径（临时文件可能在一段时间后失效）
        // 建议后续升级到云存储
        console.warn('使用临时文件路径，建议升级到云存储')
        resolve(tempFilePath)
      }
    })
  })
}

/**
 * 删除文件
 * @param {String} filePath - 文件路径或云存储fileID
 * @returns {Promise}
 */
export function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    // 判断是否是云存储文件ID
    if (USE_CLOUD && wx.cloud && filePath.startsWith('cloud://')) {
      // 删除云存储文件
      wx.cloud.deleteFile({
        fileList: [filePath],
        success: () => {
          resolve()
        },
        fail: (err) => {
          console.error('删除云存储文件失败:', err)
          resolve()  // 即使失败也resolve
        }
      })
    } else {
      // 删除本地文件
      const fs = wx.getFileSystemManager()
      fs.unlink({
        filePath: filePath,
        success: () => {
          resolve()
        },
        fail: (err) => {
          console.error('删除文件失败:', err)
          // 即使删除失败也resolve，因为可能是临时文件
          resolve()
        }
      })
    }
  })
}

/**
 * 预览图片
 * @param {String} url - 图片路径或云存储fileID
 * @param {Array} urls - 所有图片路径数组
 */
export async function previewImage(url, urls = []) {
  // 如果是云存储文件，需要获取临时URL
  if (USE_CLOUD && wx.cloud && url.startsWith('cloud://')) {
    try {
      const tempURL = await getCloudFileTempURL(url)
      const tempURLs = urls.length > 0 ? await Promise.all(
        urls.map(u => u.startsWith('cloud://') ? getCloudFileTempURL(u) : u)
      ) : [tempURL]
      
      wx.previewImage({
        current: tempURL,
        urls: tempURLs
      })
    } catch (err) {
      console.error('获取临时URL失败:', err)
      wx.previewImage({
        current: url,
        urls: urls.length > 0 ? urls : [url]
      })
    }
  } else {
    wx.previewImage({
      current: url,
      urls: urls.length > 0 ? urls : [url]
    })
  }
}

/**
 * 播放视频
 * @param {String} url - 视频路径或云存储fileID
 */
export async function playVideo(url) {
  // 如果是云存储文件，需要获取临时URL
  if (USE_CLOUD && wx.cloud && url.startsWith('cloud://')) {
    try {
      const tempURL = await getCloudFileTempURL(url)
      wx.navigateTo({
        url: `/pages/media/video-player/video-player?url=${encodeURIComponent(tempURL)}`
      })
    } catch (err) {
      console.error('获取临时URL失败:', err)
      wx.navigateTo({
        url: `/pages/media/video-player/video-player?url=${encodeURIComponent(url)}`
      })
    }
  } else {
    wx.navigateTo({
      url: `/pages/media/video-player/video-player?url=${encodeURIComponent(url)}`
    })
  }
}

