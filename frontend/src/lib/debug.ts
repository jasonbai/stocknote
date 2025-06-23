// 调试工具
export const debugSupabaseConfig = () => {
  const config = {
    url: import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  };
  
  console.log('🔧 Supabase 配置检查:', config);
  
  if (!config.url) {
    console.error('❌ VITE_SUPABASE_URL 未设置');
    return false;
  }
  
  if (!config.hasKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY 未设置');
    return false;
  }
  
  console.log('✅ Supabase 环境变量配置正确');
  return true;
};

export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 测试 Supabase 连接...');
    
    // 简单的连接测试
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ Supabase 连接正常');
      return true;
    } else {
      console.error('❌ Supabase 连接失败:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase 连接测试异常:', error);
    return false;
  }
}; 