import { format } from 'date-fns';

// 用户数据
export interface User {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  tags: string[];
  created_at: string;
  updated_at: string;
  avatar: string;
}

// 股票数据
export interface Stock {
  id: string;
  user_id: string;
  stock_code: string;
  stock_name: string;
  current_price: number;
  updated_at: string;
}

// 交易记录数据
export interface Transaction {
  id: string;
  user_id: string;
  stock_id: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  timestamp: string;
  parent_buy_id?: string; // 仅卖出时有值
  remaining?: number; // 仅买入时有值
  batch_id?: string;
  buy_reason?: {
    tags: string[];
    note: string;
  };
  sell_reason?: {
    tags: string[];
    note: string;
  };
}

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

// 理由标签统计
export interface TagStats {
  tag: string;
  count: number;
  avgHoldingDays: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  winTrades: number;
} 