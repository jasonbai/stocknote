import { supabase } from './supabase';
import { createUser } from './api';
import { debugSupabaseConfig } from './debug';

// 登录
export const signIn = async (email: string, password: string) => {
  console.log('🔒 开始调用 supabase.auth.signInWithPassword');
  
  // 检查环境变量配置
  if (!debugSupabaseConfig()) {
    throw new Error('Supabase 环境变量配置错误');
  }
  
  try {
    console.log('🔒 等待 Supabase 响应...');
    
    // 添加超时处理的登录请求
    const loginPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('登录请求超时，请检查网络连接')), 30000); // 30秒超时
    });
    
    const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;
    
    console.log('🔒 Supabase 响应完成:', { 
      hasData: !!data, 
      hasError: !!error,
      hasUser: !!data?.user,
      hasSession: !!data?.session 
    });
    
    if (error) {
      console.error('🔒 登录失败:', error);
      throw error;
    }
    
    if (!data || !data.user || !data.session) {
      throw new Error('登录响应不完整');
    }
    
    return data;
  } catch (err) {
    console.error('🔒 signIn 函数捕获到错误:', err);
    throw err;
  }
};

// 注册
export const signUp = async (email: string, password: string, name: string) => {
  console.log('📝 开始注册流程:', email);
  
  try {
    // 1. 创建认证账号
    console.log('📝 调用 Supabase Auth 注册...');
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (authError) {
      console.error('📝 Supabase Auth 注册失败:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('📝 注册响应中没有用户数据');
      throw new Error('注册失败: 未能创建用户');
    }
    
    console.log('📝 Supabase Auth 注册成功:', {
      userId: authData.user.id,
      email: authData.user.email,
      emailConfirmed: authData.user.email_confirmed_at,
      needsConfirmation: !authData.user.email_confirmed_at
    });

    // 2. 创建用户记录（失败也不 throw，并添加超时处理）
    let profileError = null;
    try {
      console.log('📝 创建用户资料记录...');
      
      // 添加超时处理，避免页面卡住
      const createUserPromise = createUser({
        auth_id: authData.user.id,
        name,
        email,
        role: 'user',
        tags: ['新用户'],
        avatar: '',
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('创建用户资料超时')), 5000); // 5秒超时
      });
      
      await Promise.race([createUserPromise, timeoutPromise]);
      console.log('📝 用户资料记录创建成功');
    } catch (error) {
      console.warn('📝 创建用户资料失败:', error);
      profileError = error;
    }
    
    console.log('📝 注册流程完成:', {
      authSuccess: true,
      profileSuccess: !profileError,
      needsEmailVerification: !authData.user.email_confirmed_at
    });
    
    return { authData, profileError };
  } catch (error) {
    console.error('📝 注册流程失败:', error);
    throw error;
  }
};

// 重置密码
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    console.error('重置密码失败:', error);
    throw error;
  }
};

// 更新密码
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    console.error('更新密码失败:', error);
    throw error;
  }
};

// 获取当前用户
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('获取当前用户失败:', error);
    throw error;
  }
  
  return user;
};

// 退出登录
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('退出登录失败:', error);
    throw error;
  }
}; 