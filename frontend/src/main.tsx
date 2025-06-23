import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { handleServerError } from '@/utils/handle-server-error'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import { AuthProvider } from './context/auth-context'
import { AuthErrorHandler } from './components/auth-error-handler'
import './index.css'
// Generated Routes
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: false, // 禁用窗口焦点时重新获取
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('会话已过期，请重新登录')
          // 清除所有本地存储的认证信息
          localStorage.clear()
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          // 重定向到登录页
          const currentPath = router.history.location.href
          router.navigate({ to: '/sign-in', search: { redirect: currentPath } })
        }
        if (error.response?.status === 500) {
          toast.error('服务器内部错误，请稍后重试')
          router.navigate({ to: '/500' })
        }
        if (error.response?.status === 403) {
          toast.error('权限不足，无法访问此资源')
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ({ error }) => {
    console.error('🔴 路由错误:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">页面加载出错</h1>
          <p className="text-gray-600 mb-4">请刷新页面重试</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
// 清空根元素确保干净的渲染环境
rootElement.innerHTML = ''
const root = ReactDOM.createRoot(rootElement)

// 添加全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 未处理的 Promise 拒绝:', event.reason);
  // 防止某些网络错误导致的白屏
  if (event.reason?.message?.includes('Failed to fetch') || 
      event.reason?.message?.includes('NetworkError')) {
    console.warn('🔶 检测到网络错误，建议检查网络连接');
  }
});

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <FontProvider>
          <AuthProvider>
            <AuthErrorHandler />
            <RouterProvider router={router} />
          </AuthProvider>
        </FontProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
