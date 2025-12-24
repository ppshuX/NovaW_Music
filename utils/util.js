/**
 * 通用工具函数
 */

/**
 * 格式化日期
 */
export function formatDate(dateString, format = 'YYYY-MM-DD') {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
}

/**
 * 格式化时长（分钟转小时分钟）
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

/**
 * 显示提示信息
 */
export function showToast(title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  })
}

/**
 * 显示加载中
 */
export function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载
 */
export function hideLoading() {
  wx.hideLoading()
}

/**
 * 显示确认对话框
 */
export function showModal(title, content) {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status) {
  const colorMap = {
    '未开始': '#8b8b8b',
    '练习中': '#0f3460',
    '可录制': '#533483',
    '已完成': '#00d4aa'
  }
  return colorMap[status] || '#8b8b8b'
}

/**
 * 渲染星级
 */
export function renderStars(rating) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating)
  }
  return stars
}

