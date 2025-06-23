// 在浏览器控制台中运行这个脚本来检查环境变量
console.log('=== Supabase 环境变量检查 ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY 存在:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_SUPABASE_ANON_KEY 前20字符:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// 测试Supabase连接
import { supabase } from './supabase.js';

// 测试基本连接
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase连接测试失败:', error);
    } else {
      console.log('✅ Supabase连接正常，用户表记录数:', count);
    }
  });

// 测试认证状态
supabase.auth.getUser().then(({ data, error }) => {
  if (error) {
    console.error('❌ 获取认证用户失败:', error);
  } else {
    console.log('🔑 当前认证状态:', data.user ? '已登录' : '未登录');
    if (data.user) {
      console.log('🔑 用户ID:', data.user.id);
      console.log('🔑 用户邮箱:', data.user.email);
    }
  }
}); 