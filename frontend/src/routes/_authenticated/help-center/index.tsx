import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { TopNav } from '@/components/layout/top-nav'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { 
  IconChartLine, 
  IconCoin, 
  IconSettings, 
  IconUsers, 
  IconHelp,
  IconBook,
  IconBulb,
  IconShield,
  IconMail,
  IconExternalLink
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/help-center/')({
  component: HelpCenterPage,
})

function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // 定义导航链接
  const navLinks = [
    {
      title: '首页',
      href: '/',
      isActive: false,
    },
    {
      title: '股票清单',
      href: '/stocks',
      isActive: false,
    },
    {
      title: '复盘分析',
      href: '/analysis',
      isActive: false,
    },
    {
      title: '关于我',
      href: 'http://www.jasonbai.com',
      isActive: false,
      isExternal: true,
    },
  ]

  const features = [
    {
      icon: <IconCoin className="h-8 w-8 text-blue-500" />,
      title: '股票清单管理',
      description: '添加、编辑股票信息，实时跟踪价格变化和盈亏情况',
      path: '/stocks',
      features: [
        '添加股票到投资组合',
        '实时更新股票价格',
        '计算盈亏和收益率',
        '按不同维度排序查看'
      ]
    },
    {
      icon: <IconChartLine className="h-8 w-8 text-green-500" />,
      title: '复盘分析',
      description: '深度分析交易数据，提供多维度的投资复盘报告',
      path: '/analysis',
      features: [
        '标签统计分析',
        '月度/周度交易趋势',
        '盈亏图表展示',
        '胜率和持仓分析'
      ]
    },
    {
      icon: <IconSettings className="h-8 w-8 text-purple-500" />,
      title: '个人设置',
      description: '自定义系统设置，个性化您的使用体验',
      path: '/settings',
      features: [
        '账户信息管理',
        '主题外观设置',
        '显示偏好配置',
        '通知设置管理'
      ]
    },
    {
      icon: <IconUsers className="h-8 w-8 text-orange-500" />,
      title: '用户管理',
      description: '管理员功能，用于系统用户的管理和维护',
      path: '/admin',
      features: [
        '用户账户管理',
        '权限控制',
        '系统监控',
        '数据维护'
      ]
    }
  ]

  const faqs = [
    {
      question: '如何添加新的股票到我的投资组合？',
      answer: '在股票清单页面，点击"添加股票"按钮，输入股票代码、名称和当前价格即可。系统会自动保存并开始跟踪该股票的表现。'
    },
    {
      question: '如何查看我的投资收益情况？',
      answer: '您可以在股票清单页面查看每只股票的实时盈亏情况，也可以在复盘分析页面查看更详细的收益分析报告和图表。'
    },
    {
      question: '复盘分析功能包含哪些内容？',
      answer: '复盘分析提供标签统计、月度和周度交易趋势、盈亏图表、胜率分析等多个维度的数据分析，帮助您更好地了解投资表现。'
    },
    {
      question: '如何更新股票的当前价格？',
      answer: '在股票清单中，点击任意股票行的编辑按钮，选择"更新价格"选项，输入最新价格即可更新。'
    },
    {
      question: '系统支持哪些排序方式？',
      answer: '股票清单支持按股票名称、盈利情况、持仓价值等多种方式排序，您可以根据需要选择升序或降序排列。'
    },
    {
      question: '如何切换系统主题？',
      answer: '点击页面右上角的主题切换按钮，可以在明亮模式和暗黑模式之间切换，系统会记住您的偏好设置。'
    }
  ]

  const quickActions = [
    { title: '添加第一只股票', description: '开始您的投资记录之旅', path: '/stocks', icon: <IconCoin className="h-5 w-5" /> },
    { title: '查看分析报告', description: '了解您的投资表现', path: '/analysis', icon: <IconChartLine className="h-5 w-5" /> },
    { title: '个性化设置', description: '自定义您的使用体验', path: '/settings', icon: <IconSettings className="h-5 w-5" /> }
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 */}
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" to="/">
              <IconHelp className="h-6 w-6" />
              <span>帮助中心</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Button
                variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
                className="justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <IconBook className="mr-2 h-4 w-4" />
                功能概览
              </Button>
              <Button
                variant={activeTab === 'guide' ? 'secondary' : 'ghost'}
                className="justify-start"
                onClick={() => setActiveTab('guide')}
              >
                <IconBulb className="mr-2 h-4 w-4" />
                使用指南
              </Button>
              <Button
                variant={activeTab === 'faq' ? 'secondary' : 'ghost'}
                className="justify-start"
                onClick={() => setActiveTab('faq')}
              >
                <IconHelp className="mr-2 h-4 w-4" />
                常见问题
              </Button>
              <Button
                variant={activeTab === 'contact' ? 'secondary' : 'ghost'}
                className="justify-start"
                onClick={() => setActiveTab('contact')}
              >
                <IconMail className="mr-2 h-4 w-4" />
                联系支持
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header>
          <TopNav links={navLinks} />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <ThemeSwitch />
          </div>
        </Header>

        <Main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">帮助中心</h1>
              <p className="text-muted-foreground mt-2">
                欢迎使用 StockVison 系统，这里有您需要的所有帮助信息
              </p>
            </div>

            {/* 功能概览 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconBook className="h-5 w-5" />
                      系统功能概览
                    </CardTitle>
                    <CardDescription>
                      StockVision 是知识星球 “尾灯的量化视界” 附加服务，目标打造一个专业的股票投资记录与量化分析系统，帮助您更好地管理和分析投资组合，系统开发开始于2025年初，现在还在不断开发中，欢迎您提出建议和需求。
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  {features.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {feature.icon}
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-4">
                          {feature.features.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <Link to={feature.path}>
                          <Button variant="outline" size="sm" className="w-full">
                            立即使用
                            <IconExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 使用指南 */}
            {activeTab === 'guide' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconBulb className="h-5 w-5" />
                      快速开始
                    </CardTitle>
                    <CardDescription>
                      按照以下步骤快速上手使用系统
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {quickActions.map((action, index) => (
                        <Link key={index} to={action.path}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                {action.icon}
                                <div>
                                  <h3 className="font-medium">{action.title}</h3>
                                  <p className="text-sm text-muted-foreground">{action.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>详细使用指南</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">股票清单管理</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p>股票清单是系统的核心功能，您可以：</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>点击"添加股票"按钮添加新股票</li>
                              <li>输入股票代码、名称和当前价格</li>
                              <li>系统会自动计算盈亏和收益率</li>
                              <li>使用排序功能按不同维度查看数据</li>
                              <li>点击编辑按钮更新股票信息或价格</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">复盘分析功能</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p>复盘分析帮助您深入了解投资表现：</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>查看标签统计，了解不同类型股票的表现</li>
                              <li>分析月度和周度交易趋势</li>
                              <li>通过图表直观查看盈亏情况</li>
                              <li>计算胜率和平均持仓天数</li>
                              <li>使用筛选功能查看特定时间段的数据</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">个人设置配置</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p>在设置页面您可以：</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>更新账户基本信息</li>
                              <li>切换明亮/暗黑主题</li>
                              <li>调整显示偏好设置</li>
                              <li>配置通知提醒选项</li>
                              <li>管理安全设置</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 常见问题 */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconHelp className="h-5 w-5" />
                      常见问题解答
                    </CardTitle>
                    <CardDescription>
                      以下是用户最常遇到的问题和解答
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {faq.question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {faq.answer}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 联系支持 */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconMail className="h-5 w-5" />
                      联系技术支持
                    </CardTitle>
                    <CardDescription>
                      如果您遇到问题或有建议，欢迎联系我们
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <IconMail className="h-5 w-5 text-blue-500" />
                            <div>
                              <h3 className="font-medium">星球支持</h3>
                              <p className="text-sm text-muted-foreground">
                                发送消息获取技术支持
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <IconExternalLink className="h-5 w-5 text-green-500" />
                            <div>
                              <h3 className="font-medium">在线文档</h3>
                              <p className="text-sm text-muted-foreground">
                                查看详细的使用文档
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        <IconShield className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">数据安全保障</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                          数据存储在supabase的服务器上，因项目还在开发中，不能保证数据稳定性，请您定期备份数据。
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </Main>
      </div>
    </div>
  )
}
