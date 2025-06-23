import Cookies from 'js-cookie'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useAuth } from '@/context/auth-context'
import { getSession } from '@/lib/supabase'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    // 检查 Supabase session，使用重试逻辑
    try {
      const session = await getSession()
      if (!session) {
        throw redirect({
          to: '/sign-in',
        })
      }
    } catch (error) {
      console.error('🔑 认证检查失败:', error)
      // 如果检查失败，重定向到登录页
      throw redirect({
        to: '/sign-in',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user, isLoading, error, refreshAuth, isInitialized } = useAuth();
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  
  // 显示加载状态
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载用户信息...</p>
        </div>
      </div>
    );
  }
  
  // 如果有错误，显示错误页面并提供重试选项
  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">认证出错</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => refreshAuth()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重试
            </button>
            <button 
              onClick={() => window.location.href = '/sign-in'} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              重新登录
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 如果没有用户，重定向到登录页（这应该很少发生，因为beforeLoad已经检查过了）
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
