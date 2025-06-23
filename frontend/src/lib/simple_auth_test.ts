import { supabase } from './supabase';

// 简化的认证测试 - 只测试Supabase Auth，不涉及用户表
export const testSimpleSignUp = async (email: string, password: string) => {
  console.log('🧪 开始简化认证测试:', { email });
  
  try {
    // 只调用Supabase Auth，不创建用户记录
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 禁用邮箱确认（如果可能）
        emailRedirectTo: undefined,
      }
    });
    
    console.log('🧪 Supabase Auth 响应:', {
      hasData: !!data,
      hasError: !!error,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userConfirmed: data?.user?.email_confirmed_at,
      errorMessage: error?.message,
      errorCode: error?.status
    });
    
    if (error) {
      console.error('🧪 认证错误详情:', error);
      return { success: false, error };
    }
    
    if (data?.user) {
      console.log('🧪 认证成功，用户ID:', data.user.id);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: new Error('未知错误') };
    
  } catch (err) {
    console.error('🧪 测试异常:', err);
    return { success: false, error: err };
  }
};

// 测试不同的邮箱格式
export const testMultipleEmails = async () => {
  const testEmails = [
    'test1@example.com',
    'test2@gmail.com', 
    'test3@outlook.com'
  ];
  
  for (const email of testEmails) {
    console.log(`🧪 测试邮箱: ${email}`);
    const result = await testSimpleSignUp(email, 'testpassword123');
    console.log(`🧪 ${email} 结果:`, result.success ? '成功' : '失败');
    
    if (result.success) {
      // 如果成功，清理测试用户
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.log('清理会话失败:', e);
      }
    }
    
    // 等待一下避免频率限制
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}; 