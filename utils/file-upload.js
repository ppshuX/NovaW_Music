/**
 * 文件上传工具
 * 支持视频和图片（乐谱）上传
 */

import { showToast, showLoading, hideLoading } from './util.js'

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

        // 保存到本地文件系统
        saveFileToLocal(filePath, 'video').then(savedPath => {
          const fileInfo = {
            url: savedPath,
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

        // 保存到本地文件系统
        saveFileToLocal(filePath, 'image').then(savedPath => {
          const fileInfo = {
            url: savedPath,
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
 * @param {String} filePath - 文件路径
 * @returns {Promise}
 */
export function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
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
  })
}

/**
 * 预览图片
 * @param {String} url - 图片路径
 * @param {Array} urls - 所有图片路径数组
 */
export function previewImage(url, urls = []) {
  wx.previewImage({
    current: url,
    urls: urls.length > 0 ? urls : [url]
  })
}

/**
 * 播放视频
 * @param {String} url - 视频路径
 */
export function playVideo(url) {
  // 跳转到视频播放页面
  wx.navigateTo({
    url: `/pages/media/video-player/video-player?url=${encodeURIComponent(url)}`
  })
}

