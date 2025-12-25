// pages/dashboard/dashboard.js
import { getPracticingSongs, getSongs, isOwner } from '../../utils/unified-storage.js'
import { formatDate } from '../../utils/util.js'

Page({
    data: {
        totalSongs: 0,
        practicingCount: 0,
        completedCount: 0,
        practicingSongs: [],
        upcomingReleases: [],
        isOwner: false
    },

    async onLoad() {
        const owner = await isOwner()
        this.setData({
            isOwner: owner
        })
        await this.loadDashboardData()
    },

    async onShow() {
        // 每次显示时刷新数据
        await this.loadDashboardData()
    },

    async loadDashboardData() {
        // 获取所有歌曲用于统计
        const allSongs = await getSongs()
        const practicingCount = allSongs.filter(s => s.status === '练习中').length
        const completedCount = allSongs.filter(s => s.status === '已完成' || s.status === '可录制').length

        // 加载正在练习的歌曲
        const practicingSongs = await getPracticingSongs(3)

        // 加载即将发布的作品
        const upcomingReleases = await this.getUpcomingReleases()

        this.setData({
            totalSongs: allSongs.length,
            practicingCount,
            completedCount,
            practicingSongs,
            upcomingReleases
        })
    },

    async getUpcomingReleases() {
        // 获取状态为"可录制"或"已完成"且有预期发布日期的歌曲
        const songs = await getSongs()
        const now = new Date()
        const upcoming = songs
            .filter(song => {
                if (!song.expected_release_date) return false
                const releaseDate = new Date(song.expected_release_date)
                return releaseDate >= now && (song.status === '可录制' || song.status === '已完成')
            })
            .sort((a, b) => new Date(a.expected_release_date) - new Date(b.expected_release_date))
            .slice(0, 3)

        return upcoming.map(song => ({
            ...song,
            releaseDateFormatted: formatDate(song.expected_release_date)
        }))
    },

    // 跳转到歌曲详情
    goToSongDetail(e) {
        const songId = e.currentTarget.dataset.songId
        wx.navigateTo({
            url: `/pages/songs/song-detail/song-detail?id=${songId}`
        })
    },

    // 跳转到歌曲列表
    goToSongList() {
        wx.switchTab({
            url: '/pages/songs/song-list/song-list'
        })
    },

    // 导入歌曲
    importSongs() {
        wx.navigateTo({
            url: '/pages/settings/data-import/data-import'
        })
    }
})

