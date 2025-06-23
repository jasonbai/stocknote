import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  IconTrendingUp, 
  IconChartLine, 
  IconBrain,
  IconArrowRight,
  IconDatabase,
  IconMail,
  IconClock,
  IconFilter,
  IconRobot,
  IconChartBar,
  IconCode,
  IconSparkles
} from '@tabler/icons-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <IconTrendingUp className="h-6 w-6 text-white" />
            </div>
                             <span className="text-2xl font-bold text-gray-900">StockVision</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/sign-in">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">登录</Button>
            </Link>
            <Link to="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                注册
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-6">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
            <IconSparkles className="w-4 h-4 mr-2" />
            系统目前处于测试阶段，开放免费邮箱测试报告
          </Badge>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          智能股票与ETF
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
            分析系统
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
          自动化数据采集、AI分析与策略生成，助您把握市场脉搏。<br />
          全面覆盖从数据采集到策略生成的全流程，为您提供专业的量化分析工具
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/sign-up">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              立即体验
              <IconArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/sign-in">
            <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
              登录
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              核心功能
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              全面覆盖从数据采集到策略生成的全流程，为您提供专业的量化分析工具
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 数据采集与存储 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconDatabase className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">数据采集与存储</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  自动从Tushare API获取股票、ETF和指数的实时和历史数据，支持MySQL数据库和本地CSV双存储模式，确保数据安全可靠。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 智能分析系统 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconBrain className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">智能分析系统</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  结合规则引擎和AI技术，进行技术指标分析、市场宽度计算、趋势预测和财经新闻分析，生成专业的投资建议。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 回测与策略 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconChartBar className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">回测与策略</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  提供完整的策略回测功能，支持多种数据源，帮助您验证投资策略的有效性，优化投资决策。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 自动化调度 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconClock className="h-7 w-7 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">自动化调度</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  定时任务调度系统自动执行数据采集和分析任务，解放您的双手，让系统24小时为您工作。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 智能通知 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconMail className="h-7 w-7 text-red-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">智能通知</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  通过邮件系统将分析结果和投资建议自动发送给您，随时随地掌握市场动态。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 高级筛选 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconFilter className="h-7 w-7 text-indigo-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">高级筛选</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  灵活的股票和ETF筛选功能，支持自定义技术指标和复杂条件表达式，快速找到符合您策略的投资标的。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 交易记录管理 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconChartLine className="h-7 w-7 text-teal-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">交易记录管理</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  完整的个人股票交易记录管理系统，支持买入卖出记录、盈亏计算、浮盈分析和交易理由标记，让您清晰掌握每笔投资。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 投资分析报告 */}
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconTrendingUp className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">投资分析报告</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  基于交易记录生成详细的投资分析报告，包括收益率统计、风险评估、持仓分析和投资建议，助您优化投资策略。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              技术架构
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              基于现代技术栈构建，确保系统稳定、高效、可扩展
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconCode className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Python</h3>
              <p className="text-gray-600">核心开发语言</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconCode className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">React</h3>
              <p className="text-gray-600">前端框架</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconDatabase className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">MySQL</h3>
              <p className="text-gray-600">数据存储</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconDatabase className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supabase</h3>
              <p className="text-gray-600">后端即服务</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconChartLine className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tushare</h3>
              <p className="text-gray-600">金融数据API</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconRobot className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DeepSeek AI</h3>
              <p className="text-gray-600">AI分析引擎</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              快速开始
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              只需简单几步，即可体验强大的量化分析功能
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">安装系统</h3>
              <p className="text-gray-600">克隆项目代码并安装依赖包，快速搭建运行环境</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">配置系统</h3>
              <p className="text-gray-600">修改配置文件，设置Tushare token、数据库连接和邮件通知等参数</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">启动系统</h3>
              <p className="text-gray-600">运行调度器，系统将自动执行数据采集、分析和通知任务</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">查看结果</h3>
              <p className="text-gray-600">系统将通过邮件发送分析结果，您也可以在本地查看生成的报告和数据</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-16">
            受到专业投资者信赖
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600 text-lg">活跃用户</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600 text-lg">预测准确率</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600 text-lg">系统监控</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            立即体验智能量化分析
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            获取专业的股票和ETF分析工具，提升您的投资决策能力。
            系统目前处于测试阶段，开放免费邮箱测试报告
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                注册
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                登录
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <IconTrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">StockVision</span>
              </div>
              <p className="text-gray-600 max-w-md">
                智能股票与ETF分析系统，为专业投资者提供全面的量化分析工具和数据支持。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">功能特性</h3>
              <ul className="space-y-2 text-gray-600">
                <li>数据采集</li>
                <li>智能分析</li>
                <li>策略回测</li>
                <li>自动调度</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">联系我们</h3>
              <ul className="space-y-2 text-gray-600">
                <li>小红书：尾灯白</li>
                <li>微信公众号：理性派的旅行</li>
                <li>知识星球：尾灯的量化视界</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
                             © 2025 StockVision. 保留所有权利.
            </div>
            <div className="text-sm text-gray-500">
              智能股票量化系统 - 尾灯的量化视界
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 