// pages/settings/data-import/data-import.js
import { importFromJson } from '../../../utils/import-data.js'
import { showToast, showModal } from '../../../utils/util.js'

// 初始歌曲数据
const INITIAL_SONGS = [
  {
    "title": "陪你去流浪",
    "artist": "薛之谦",
    "date": "2025-12-22",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "小孩与我",
    "artist": "薛之谦",
    "date": "2025-12-15",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "深深爱过你",
    "artist": "薛之谦",
    "date": "2025-12-03",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "需要人陪",
    "artist": "王力宏",
    "date": "2025-12-01",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "像风一样",
    "artist": "薛之谦",
    "date": "2025-12-01",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "世界上不存在的歌",
    "artist": "赵英俊",
    "date": "2025-08-12",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "送你一朵小红花",
    "artist": "赵英俊",
    "date": "2025-07-30",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "守候",
    "artist": "赵英俊",
    "date": "2025-07-28",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "这么久没见",
    "artist": "薛之谦",
    "date": "2025-07-23",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "绅士",
    "artist": "薛之谦",
    "date": "2025-07-15",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "安和桥",
    "artist": "宋冬野",
    "date": "2025-04-03",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "其实",
    "artist": "薛之谦",
    "date": "2025-03-07",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "你还要我怎样",
    "artist": "薛之谦",
    "date": "2025-03-06",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "成都",
    "artist": "赵雷",
    "date": "2024-10-30",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  },
  {
    "title": "Nothing",
    "artist": "Bruno Major",
    "date": "2024-09-14",
    "status": "已完成",
    "proficiency": 5,
    "difficulty": 3,
    "tags": ["弹唱", "cover"]
  }
]

Page({
  data: {
    songsToImport: INITIAL_SONGS,
    importResult: null
  },

  onLoad() {
    this.setData({
      songsCount: INITIAL_SONGS.length
    })
  },

  // 导入数据
  async importData() {
    const confirmed = await showModal(
      '确认导入',
      `即将导入 ${INITIAL_SONGS.length} 首歌曲，已存在的歌曲将被跳过。是否继续？`
    )
    
    if (!confirmed) return

    wx.showLoading({
      title: '导入中...',
      mask: true
    })

    try {
      const result = importFromJson(INITIAL_SONGS)
      
      wx.hideLoading()
      
      if (result.success) {
        let message = `成功导入 ${result.imported} 首歌曲`
        if (result.skipped > 0) {
          message += `，跳过 ${result.skipped} 首已存在的歌曲`
        }
        message += `\n当前共有 ${result.total} 首歌曲`
        
        showToast(message, 'success')
        
        this.setData({
          importResult: result
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      } else {
        showToast('导入失败：' + (result.error || '未知错误'), 'none')
      }
    } catch (e) {
      wx.hideLoading()
      showToast('导入失败：' + e.message, 'none')
    }
  },

  // 预览要导入的歌曲
  previewSongs() {
    const songsList = INITIAL_SONGS.map((song, index) => 
      `${index + 1}. ${song.title} - ${song.artist} (${song.date})`
    ).join('\n')
    
    wx.showModal({
      title: '要导入的歌曲',
      content: songsList,
      showCancel: false
    })
  }
})

