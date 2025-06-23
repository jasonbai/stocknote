-- 创建用户表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  avatar TEXT
);

-- 创建股票表
CREATE TABLE IF NOT EXISTS public.stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stock_code TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  current_price NUMERIC(10, 2) NOT NULL CHECK (current_price > 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, stock_code)
);

-- 创建交易记录表
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stocks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  fee NUMERIC(10, 2) NOT NULL CHECK (fee >= 0),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  parent_buy_id UUID REFERENCES public.transactions(id),
  remaining INTEGER,
  batch_id TEXT,
  buy_reason JSONB,
  sell_reason JSONB
);

-- 创建行级安全策略（RLS）

-- 启用行级安全
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 先创建辅助函数来避免递归
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    JOIN public.users ON auth.users.id = public.users.auth_id
    WHERE auth.users.id = auth.uid() AND public.users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 用户表的策略 - 修复版本
-- 管理员可以查看所有用户，用户可以查看自己
CREATE POLICY admin_select_users ON public.users
  FOR SELECT
  USING (
    auth_is_admin() OR auth_id = auth.uid()
  );

-- 允许新用户插入自己的记录（注册时）
CREATE POLICY user_insert_own_record ON public.users
  FOR INSERT
  WITH CHECK (auth_id = auth.uid());

-- 用户只能更新自己的信息
CREATE POLICY user_update_own_user ON public.users
  FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- 用户只能删除自己的记录
CREATE POLICY user_delete_own_user ON public.users
  FOR DELETE
  USING (auth_id = auth.uid());

-- 管理员可以对所有用户进行所有操作
CREATE POLICY admin_all_users ON public.users
  FOR ALL
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- 股票表的策略
-- 用户只能查看自己的股票
CREATE POLICY user_select_own_stocks ON public.stocks
  FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- 用户只能修改自己的股票
CREATE POLICY user_modify_own_stocks ON public.stocks
  FOR ALL
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- 交易记录表的策略
-- 用户只能查看自己的交易记录
CREATE POLICY user_select_own_transactions ON public.transactions
  FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- 用户只能修改自己的交易记录
CREATE POLICY user_modify_own_transactions ON public.transactions
  FOR ALL
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- 创建函数：检查用户是否可以创建新股票
CREATE OR REPLACE FUNCTION check_user_can_create_stock()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  stock_count INTEGER;
BEGIN
  -- 获取用户信息
  SELECT * INTO user_record FROM public.users WHERE id = NEW.user_id;
  
  -- 如果是管理员或者有"星球"标签，允许无限制添加
  IF user_record.role = 'admin' OR '星球' = ANY(user_record.tags) THEN
    RETURN NEW;
  END IF;
  
  -- 普通用户检查股票数量限制
  SELECT COUNT(*) INTO stock_count FROM public.stocks WHERE user_id = NEW.user_id;
  
  IF stock_count >= 5 THEN
    RAISE EXCEPTION '普通用户最多只能添加5条股票记录';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER check_stock_limit
BEFORE INSERT ON public.stocks
FOR EACH ROW
EXECUTE FUNCTION check_user_can_create_stock(); 