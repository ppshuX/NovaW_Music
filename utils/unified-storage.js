/**
 * 统一存储接口
 * 自动选择使用云开发或本地存储
 */

import { USE_CLOUD, CLOUD_ENV_ID, OWNER_OPENID } from '../config/index.js'
import * as cloudStorage from './cloud-storage.js'
import * as localStorage from './storage.js'

// 当前用户OpenID（用于判断是否是主人）
let currentOpenId = null

/**
 * 初始化存储
 */
export async function initStorage() {
  if (USE_CLOUD) {
    // 初始化云开发
    cloudStorage.initCloud(CLOUD_ENV_ID)
    
    // 获取当前用户OpenID
    try {
      currentOpenId = await cloudStorage.getCurrentUserOpenId()
      wx.setStorageSync('current_openid', currentOpenId)
    } catch (err) {
      console.error('获取OpenID失败:', err)
      currentOpenId = wx.getStorageSync('current_openid')
    }
  }
}

/**
 * 判断当前用户是否是主人（可以编辑）
 */
export async function isOwner() {
  if (!USE_CLOUD) {
    // 本地存储模式下，默认所有人都是主人
    return Promise.resolve(true)
  }
  
  // 如果还没有获取OpenID，尝试获取
  if (!currentOpenId) {
    try {
      currentOpenId = await cloudStorage.getCurrentUserOpenId()
      wx.setStorageSync('current_openid', currentOpenId)
    } catch (err) {
      console.error('获取OpenID失败:', err)
      currentOpenId = wx.getStorageSync('current_openid')
    }
  }
  
  if (!OWNER_OPENID) {
    // 如果没有设置主人OpenID，则所有人都可以编辑（开发模式）
    return Promise.resolve(true)
  }
  
  return Promise.resolve(currentOpenId === OWNER_OPENID)
}

/**
 * 获取歌曲列表
 */
export async function getSongs() {
  if (USE_CLOUD) {
    return await cloudStorage.getSongsFromCloud()
  } else {
    return localStorage.getSongs()
  }
}

/**
 * 保存歌曲列表
 */
export async function saveSongs(songs) {
  if (USE_CLOUD) {
    return await cloudStorage.saveSongsToCloud(songs)
  } else {
    return localStorage.saveSongs(songs)
  }
}

/**
 * 获取单个歌曲
 */
export async function getSongById(songId) {
  const songs = await getSongs()
  return songs.find(song => song.song_id === songId) || null
}

/**
 * 添加歌曲
 */
export async function addSong(song) {
  if (USE_CLOUD) {
    return await cloudStorage.addSongToCloud(song)
  } else {
    return localStorage.addSong(song)
  }
}

/**
 * 更新歌曲
 */
export async function updateSong(songId, updates) {
  if (USE_CLOUD) {
    return await cloudStorage.updateSongInCloud(songId, updates)
  } else {
    return localStorage.updateSong(songId, updates)
  }
}

/**
 * 删除歌曲
 */
export async function deleteSong(songId) {
  if (USE_CLOUD) {
    return await cloudStorage.deleteSongFromCloud(songId)
  } else {
    return localStorage.deleteSong(songId)
  }
}

/**
 * 获取练习记录
 */
export async function getPracticeLogs(songId = null) {
  if (USE_CLOUD) {
    return await cloudStorage.getPracticeLogsFromCloud(songId)
  } else {
    return localStorage.getPracticeLogs(songId)
  }
}

/**
 * 添加练习记录
 */
export async function addPracticeLog(log) {
  if (USE_CLOUD) {
    return await cloudStorage.addPracticeLogToCloud(log)
  } else {
    return localStorage.addPracticeLog(log)
  }
}

/**
 * 获取动态
 */
export async function getPosts() {
  if (USE_CLOUD) {
    return await cloudStorage.getPostsFromCloud()
  } else {
    const { getPosts } = require('./posts.js')
    return getPosts()
  }
}

/**
 * 添加动态
 */
export async function addPost(post) {
  if (USE_CLOUD) {
    return await cloudStorage.addPostToCloud(post)
  } else {
    const { addPost } = require('./posts.js')
    return addPost(post)
  }
}

/**
 * 更新动态
 */
export async function updatePost(postId, updates) {
  if (USE_CLOUD) {
    return await cloudStorage.updatePostInCloud(postId, updates)
  } else {
    const { updatePost } = require('./posts.js')
    return updatePost(postId, updates)
  }
}

/**
 * 删除动态
 */
export async function deletePost(postId) {
  if (USE_CLOUD) {
    return await cloudStorage.deletePostFromCloud(postId)
  } else {
    const { deletePost } = require('./posts.js')
    return deletePost(postId)
  }
}

/**
 * 上传文件
 */
export async function uploadFile(filePath, cloudPath) {
  if (USE_CLOUD) {
    return await cloudStorage.uploadFileToCloud(filePath, cloudPath)
  } else {
    // 本地存储，返回本地路径
    return filePath
  }
}

/**
 * 删除文件
 */
export async function deleteFile(fileID) {
  if (USE_CLOUD) {
    return await cloudStorage.deleteFileFromCloud(fileID)
  } else {
    // 本地文件删除
    const { deleteFile } = require('./file-upload.js')
    return await deleteFile(fileID)
  }
}

// 导出工具函数
export { calculateProgress, getTodayPracticeStats, getWeekPracticeStats, getPracticingSongs } from './storage.js'

