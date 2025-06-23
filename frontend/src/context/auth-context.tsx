import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '../lib/supabase';
import { signIn, signOut as authSignOut } from '../lib/auth';
import { fetchUserById } from '../lib/api';

// 扩展用户类型
interface User {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  tags: string[];
  created_at: string;
  updated_at: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isAdmin = user?.role === 'admin';

  // 处理用户会话的公共函数
  const handleUserSession = useCallback(async (authUser: any, isMounted = true) => {
    if (!isMounted) return;
    
    try {
      console.log('🔑 处理用户会话，auth_id:', authUser.id);
      
      // 先从cookie获取用户ID，提高效率
      const userId = Cookies.get('userId');
      
      if (userId) {
        console.log('🔑 从cookie中获取到userId，直接查询');
        try {
          const dbUser = await fetchUserById(userId);
          if (dbUser && isMounted) {
            console.log('🔑 成功获取用户信息');
            setUser(dbUser as User);
            setError(null);
            
            // 用户信息获取成功，清除登录超时
            if ((window as any).loginTimeoutId) {
              console.log('🔑 从cookie获取用户信息成功，清除登录超时定时器');
              clearTimeout((window as any).loginTimeoutId);
              (window as any).loginTimeoutId = null;
            }
            return;
          } else {
            console.log('🔑 cookie中的userId无效，清除cookie');
            Cookies.remove('userId');
          }
        } catch (err) {
          console.log('🔑 通过userId查询失败，尝试auth_id查询');
          Cookies.remove('userId');
        }
      }
      
      // 如果没有有效的cookie，通过auth_id查询用户
      console.log('🔑 通过auth_id查询用户信息');
      
      // 直接进行数据库查询，移除超时限制
      try {
        const { data: users, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single();
        
        console.log('🔑 数据库查询完成:', { 
          hasUsers: !!users, 
          hasDbError: !!dbError,
          errorMessage: dbError?.message,
          errorCode: dbError?.code 
        });
        
        if (dbError) {
          console.error('🔑 数据库查询失败:', dbError);
          if (isMounted) {
            if (dbError.code === 'PGRST116') {
              setError('未找到用户记录，请联系管理员');
            } else {
              setError(`数据库查询失败: ${dbError.message}`);
            }
            setUser(null);
            Cookies.remove('userId');
          }
          return;
        }
        
        if (users && isMounted) {
          console.log('🔑 成功获取用户信息:', { 
            userId: users.id, 
            userName: users.name,
            userEmail: users.email 
          });
          setUser(users as User);
          Cookies.set('userId', users.id, { expires: 7 });
          setError(null);
          
          // 用户信息获取成功，清除登录超时
          if ((window as any).loginTimeoutId) {
            console.log('🔑 用户信息获取成功，清除登录超时定时器');
            clearTimeout((window as any).loginTimeoutId);
            (window as any).loginTimeoutId = null;
          }
        } else if (isMounted) {
          console.error('🔑 查询结果为空，未找到用户记录');
          setError('未找到用户信息');
          setUser(null);
          Cookies.remove('userId');
        }
              } catch (queryError) {
          console.error('🔑 数据库查询失败:', queryError);
          if (isMounted) {
            setError('数据库查询失败，请稍后重试');
            setUser(null);
            Cookies.remove('userId');
          }
        }
    } catch (err) {
      console.error('🔑 处理用户会话失败:', err);
      if (isMounted) {
        setError(`获取用户信息失败: ${err instanceof Error ? err.message : '未知错误'}`);
        setUser(null);
        Cookies.remove('userId');
      }
    }
  }, []);

  // 初始化时检查是否已登录
  useEffect(() => {
    let isMounted = true;
    let initializationStarted = false;
    
    const checkUser = async () => {
      if (!isMounted || initializationStarted) return;
      initializationStarted = true;
      
      try {
        console.log('🔑 开始检查用户认证状态');
        
        // 直接使用 getSession，不设置超时，让 Supabase 自己处理
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('🔑 获取会话时出错:', error);
          if (isMounted) {
            setUser(null);
            Cookies.remove('userId');
          }
          return;
        }
        
        console.log('🔑 会话检查结果:', { hasSession: !!session });
        
        if (session && session.user) {
          console.log('🔑 检测到有效的 Supabase session');
          await handleUserSession(session.user, isMounted);
        } else {
          console.log('🔑 没有有效的 Supabase session');
          if (isMounted) {
            setUser(null);
            Cookies.remove('userId');
          }
        }
      } catch (err) {
        console.error('🔑 会话检查失败:', err);
        if (isMounted) {
          setUser(null);
          Cookies.remove('userId');
          setError('认证状态检查失败，请刷新页面重试');
        }
      } finally {
        if (isMounted) {
          console.log('🔑 认证状态检查完成');
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };
    
    checkUser();
    
    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔑 认证状态变化:', event, '当前初始化状态:', isInitialized);
        
        // 避免在初始化期间重复处理 INITIAL_SESSION
        if (event === 'INITIAL_SESSION' && !isInitialized) {
          console.log('🔑 初始会话事件，跳过处理（已在 checkUser 中处理）');
          return;
        }
        
        if (event === 'SIGNED_IN' && session?.user && isInitialized) {
          console.log('🔑 用户已登录，session存在:', !!session);
          
          // 立即清除登录超时
          if ((window as any).loginTimeoutId) {
            console.log('🔑 清除登录超时定时器');
            clearTimeout((window as any).loginTimeoutId);
            (window as any).loginTimeoutId = null;
          }
          
          await handleUserSession(session.user, isMounted);
          
          if (isMounted) {
            setIsLoading(false);
            console.log('🔑 用户登录流程完成');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔑 用户已登出');
          if (isMounted) {
            setUser(null);
            Cookies.remove('userId');
            setError(null);
            setIsLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔑 Token 已刷新');
          // Token 刷新成功，清除任何相关错误
          if (isMounted) {
            setError(null);
          }
        }
      }
    );
    
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [handleUserSession, isInitialized]);

  // 登录函数
  const login = async (email: string, password: string) => {
    console.log('🔑 auth-context login 开始');
    
    // 清理之前的超时定时器
    if ((window as any).loginTimeoutId) {
      clearTimeout((window as any).loginTimeoutId);
      (window as any).loginTimeoutId = null;
    }
    
    // 清理所有状态
    setUser(null);
    setError(null);
    Cookies.remove('userId');
    setIsLoading(true);
    
    try {
      // 清除之前用户的数据
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_stocks_') || key.startsWith('stock_transactions_')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('🔑 调用 signIn');
      const authResponse = await signIn(email, password);
      console.log('🔑 signIn 完成:', !!authResponse?.user);
      
      if (!authResponse || !authResponse.user) {
        throw new Error('登录失败');
      }
      
      console.log('🔑 登录认证成功，等待 onAuthStateChange 处理用户信息');
      
      // 设置超时保护，增加超时时间到15秒
      const timeoutId = setTimeout(() => {
        // 使用回调来获取最新的状态
        setUser(currentUser => {
          setError(currentError => {
            // 只有在用户仍然为null且没有错误时才显示超时错误
            if (!currentUser && !currentError) {
              console.warn('🔑 登录流程超时，可能在获取用户信息时出现问题');
              setError('登录过程超时，请重试');
              setIsLoading(false);
            } else {
              console.log('🔑 超时检查：用户已存在或已有错误，跳过超时处理', { hasUser: !!currentUser, hasError: !!currentError });
            }
            return currentError;
          });
          return currentUser;
        });
      }, 15000);
      
      // 存储超时ID，以便在成功时清除
      (window as any).loginTimeoutId = timeoutId;
      
    } catch (err: any) {
      console.error('🔑 登录失败:', err);
      
      let errorMessage = '登录失败，请稍后再试';
      
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = '邮箱或密码错误';
      } else if (err.message.includes('User not found')) {
        errorMessage = '用户不存在';
      } else if (err.message.includes('获取用户信息失败')) {
        errorMessage = '获取用户信息失败';
      } else if (err.message.includes('网络')) {
        errorMessage = '网络连接问题，请检查网络后重试';
      } else if (err.message.includes('环境变量')) {
        errorMessage = 'Supabase 配置错误，请联系管理员';
      } else if (err.message.includes('fetch')) {
        errorMessage = '网络请求失败，请检查网络连接';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络后重试';
      }
      
      setError(errorMessage);
      setUser(null);
      Cookies.remove('userId');
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = async () => {
    console.log('🔑 开始登出流程');
    try {
      // 清除超时
      if ((window as any).loginTimeoutId) {
        clearTimeout((window as any).loginTimeoutId);
        (window as any).loginTimeoutId = null;
      }
      
      // Supabase 登出
      await authSignOut();
      
      // 清理状态
      setUser(null);
      setError(null);
      setIsLoading(false);
      Cookies.remove('userId');
      
      // 清除所有用户相关的 localStorage 数据
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_stocks_') || key.startsWith('stock_transactions_')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('🔑 登出流程完成');
    } catch (err) {
      console.error('🔑 登出失败:', err);
      // 即使登出失败，也要清理本地状态
      setUser(null);
      setError(null);
      setIsLoading(false);
      Cookies.remove('userId');
    }
  };

  // 清除错误状态
  const clearError = () => {
    setError(null);
  };

  // 刷新认证状态
  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session?.user) {
        await handleUserSession(session.user, true);
      } else {
        setUser(null);
        Cookies.remove('userId');
        setError('会话已过期，请重新登录');
      }
    } catch (err) {
      console.error('🔑 刷新认证状态失败:', err);
      setError('刷新认证状态失败，请重新登录');
      setUser(null);
      Cookies.remove('userId');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAdmin,
    clearError,
    refreshAuth,
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 