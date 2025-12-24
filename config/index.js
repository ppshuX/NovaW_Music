/**
 * 应用配置
 */

// 是否使用云开发（true: 使用云开发, false: 使用本地存储）
export const USE_CLOUD = false

// 云开发环境ID（如果使用云开发，需要填写）
export const CLOUD_ENV_ID = 'your-env-id'

// 主人OpenID（只有这个OpenID可以编辑数据，其他人只能查看）
// 如果不设置，则所有人都可以编辑（不推荐）
// 获取方式：在云开发控制台查看，或通过云函数获取
export const OWNER_OPENID = null // 例如: 'oXxxxxx...'

// 是否允许访客查看（如果为false，则只有主人可以查看）
export const ALLOW_GUEST_VIEW = true

