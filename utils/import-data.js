/**
 * 数据导入工具
 * 用于批量导入初始歌曲数据
 */

import { getSongs, saveSongs, calculateProgress } from './storage.js'

/**
 * 格式化日期 YYYYMMDD -> YYYY-MM-DD
 */
function formatDateString(dateStr) {
  if (!dateStr) return ''
  if (dateStr.length === 8) {
    // YYYYMMDD 格式
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
  }
  return dateStr
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 导入初始歌曲数据
 * @param {Array} songsData - 歌曲数据数组
 */
export function importSongs(songsData) {
  const existingSongs = getSongs()
  const existingTitles = new Set(existingSongs.map(song => song.title))
  
  const newSongs = []
  const skippedSongs = []
  
  songsData.forEach(songData => {
    // 检查是否已存在
    if (existingTitles.has(songData.title)) {
      skippedSongs.push(songData.title)
      return
    }
    
    // 格式化日期
    const formattedDate = formatDateString(songData.date)
    
    // 创建歌曲对象
    const song = {
      song_id: generateId(),
      title: songData.title || '',
      artist: songData.artist || '未知',
      key: songData.key || '',
      capo: songData.capo || 0,
      status: songData.status || '已完成',
      proficiency: songData.proficiency || 5,
      difficulty: songData.difficulty || 3,
      tags: songData.tags || ['弹唱', 'cover'],
      sections: {
        intro: songData.sections?.intro ?? true,
        verse: songData.sections?.verse ?? true,
        chorus: songData.sections?.chorus ?? true,
        bridge: songData.sections?.bridge ?? true
      },
      technical_points: songData.technical_points || [],
      notes: songData.notes || '',
      practice_history: [],
      progress_percentage: 100, // 已完成歌曲默认100%
      recording_links: songData.recording_links || [],
      demo_videos: songData.demo_videos || [],
      sheet_music: songData.sheet_music || [],
      expected_release_date: formattedDate,
      is_private: songData.is_private || false,
      created_at: formattedDate ? new Date(formattedDate).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // 计算进度（如果段落都已掌握，则为100%）
    song.progress_percentage = calculateProgress(song)
    
    newSongs.push(song)
  })
  
  // 合并到现有列表
  const allSongs = [...existingSongs, ...newSongs]
  
  // 保存
  const success = saveSongs(allSongs)
  
  return {
    success,
    imported: newSongs.length,
    skipped: skippedSongs.length,
    skippedTitles: skippedSongs,
    total: allSongs.length
  }
}

/**
 * 从JSON文件导入（需要在页面中调用）
 */
export function importFromJson(jsonData) {
  try {
    const songsData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    return importSongs(songsData)
  } catch (e) {
    console.error('导入数据失败:', e)
    return {
      success: false,
      error: e.message,
      imported: 0,
      skipped: 0,
      total: getSongs().length
    }
  }
}

