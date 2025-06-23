import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChartBar,
  IconError404,
  IconHelp,
  IconLock,
  IconLockAccess,
  IconNotification,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUser,
  IconUserCog,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '管理员',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '股票交易记录',
      logo: Command,
      plan: '管理平台',
    },
  ],
  navGroups: [
    {
      title: '交易管理',
      items: [
        {
          title: '股票清单',
          url: '/stocks',
          icon: IconChartBar,
        },
        {
          title: '复盘分析',
          url: '/analysis',
          icon: IconTool,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '设置',
          icon: IconSettings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: '账户',
              url: '/settings/account',
              icon: IconUser,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: '通知',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: '显示',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
  // 管理员导航组，将根据用户角色决定是否添加到导航中
  adminNavGroup: {
    title: '管理员功能',
    items: [
      {
        title: '用户管理',
        url: '/admin/users',
        icon: IconUsers,
      },
      {
        title: '认证',
        icon: IconLockAccess,
        items: [
          {
            title: '登录',
            url: '/sign-in',
          },
          {
            title: '注册',
            url: '/sign-up',
          },
        ],
      },
      {
        title: '错误页面',
        icon: IconBug,
        items: [
          {
            title: '未授权',
            url: '/401',
            icon: IconLock,
          },
          {
            title: '禁止访问',
            url: '/403',
            icon: IconUserOff,
          },
          {
            title: '未找到',
            url: '/404',
            icon: IconError404,
          },
          {
            title: '服务器错误',
            url: '/500',
            icon: IconServerOff,
          },
          {
            title: '维护中',
            url: '/503',
            icon: IconBarrierBlock,
          },
        ],
      },
    ],
  },
}
