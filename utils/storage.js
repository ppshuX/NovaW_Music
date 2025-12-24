/**
 * 本地存储工具类
 */

/**
 * 获取歌曲列表
 */
export function getSongs() {
  try {
    return wx.getStorageSync('songs') || []
  } catch (e) {
    console.error('获取歌曲列表失败:', e)
    return []
  }
}

/**
 * 保存歌曲列表
 */
export function saveSongs(songs) {
  try {
    wx.setStorageSync('songs', songs)
    return true
  } catch (e) {
    console.error('保存歌曲列表失败:', e)
    return false
  }
}

/**
 * 获取单个歌曲
 */
export function getSongById(songId) {
  const songs = getSongs()
  return songs.find(song => song.song_id === songId) || null
}

/**
 * 添加歌曲
 */
export function addSong(song) {
  const songs = getSongs()
  const newSong = {
    ...song,
    song_id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  songs.push(newSong)
  return saveSongs(songs) ? newSong : null
}

/**
 * 更新歌曲
 */
export function updateSong(songId, updates) {
  const songs = getSongs()
  const index = songs.findIndex(song => song.song_id === songId)
  if (index === -1) return null
  
  songs[index] = {
    ...songs[index],
    ...updates,
    updated_at: new Date().toISOString()
  }
  return saveSongs(songs) ? songs[index] : null
}

/**
 * 删除歌曲
 */
export function deleteSong(songId) {
  const songs = getSongs()
  const filtered = songs.filter(song => song.song_id !== songId)
  return saveSongs(filtered)
}

/**
 * 获取练习记录
 */
export function getPracticeLogs(songId = null) {
  try {
    const logs = wx.getStorageSync('practice_logs') || []
    if (songId) {
      return logs.filter(log => log.song_id === songId)
    }
    return logs
  } catch (e) {
    console.error('获取练习记录失败:', e)
    return []
  }
}

/**
 * 添加练习记录
 */
export function addPracticeLog(log) {
  try {
    const logs = getPracticeLogs()
    const newLog = {
      ...log,
      log_id: generateId(),
      created_at: new Date().toISOString()
    }
    logs.push(newLog)
    wx.setStorageSync('practice_logs', logs)
    
    // 更新歌曲的练习历史
    const song = getSongById(log.song_id)
    if (song) {
      const practiceHistory = song.practice_history || []
      practiceHistory.push({
        date: log.date,
        duration_minute: log.duration_minute,
        notes: log.notes
      })
      updateSong(log.song_id, { practice_history: practiceHistory })
    }
    
    return newLog
  } catch (e) {
    console.error('添加练习记录失败:', e)
    return null
  }
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 计算歌曲进度百分比
 */
export function calculateProgress(song) {
  const sections = song.sections || {}
  const totalSections = Object.keys(sections).length
  const completedSections = Object.values(sections).filter(Boolean).length
  
  if (totalSections === 0) return 0
  return Math.round((completedSections / totalSections) * 100)
}

/**
 * 获取今日练习统计
 */
export function getTodayPracticeStats() {
  const today = new Date().toISOString().split('T')[0]
  const logs = getPracticeLogs()
  const todayLogs = logs.filter(log => log.date === today)
  
  const totalMinutes = todayLogs.reduce((sum, log) => sum + (log.duration_minute || 0), 0)
  const songCount = new Set(todayLogs.map(log => log.song_id)).size
  
  return {
    totalMinutes,
    songCount,
    logCount: todayLogs.length
  }
}

/**
 * 获取本周练习统计
 */
export function getWeekPracticeStats() {
  const logs = getPracticeLogs()
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  weekStart.setHours(0, 0, 0, 0)
  
  const weekLogs = logs.filter(log => {
    const logDate = new Date(log.date)
    return logDate >= weekStart
  })
  
  const totalMinutes = weekLogs.reduce((sum, log) => sum + (log.duration_minute || 0), 0)
  const songCount = new Set(weekLogs.map(log => log.song_id)).size
  
  return {
    totalMinutes,
    songCount,
    logCount: weekLogs.length
  }
}

/**
 * 获取正在练习的歌曲（Top N）
 */
export function getPracticingSongs(limit = 3) {
  const songs = getSongs()
  return songs
    .filter(song => song.status === '练习中')
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, limit)
}

