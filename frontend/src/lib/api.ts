import { supabase } from './supabase';
import type { User, Stock, Transaction, TagStats } from './mock-data';

// 用户相关API
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
  
  return data;
};

export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
  
  return data;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('更新用户失败:', error);
    throw error;
  }
  
  return data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) {
    console.error('删除用户失败:', error);
    throw error;
  }
};

// 股票相关API
export const fetchStocks = async (userId: string): Promise<Stock[]> => {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('获取股票失败:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchStockById = async (stockId: string): Promise<Stock | null> => {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('id', stockId)
    .single();
  
  if (error) {
    console.error('获取股票失败:', error);
    throw error;
  }
  
  return data;
};

export const createStock = async (stock: Omit<Stock, 'id' | 'updated_at'>): Promise<Stock> => {
  const { data, error } = await supabase
    .from('stocks')
    .insert([{
      ...stock,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('创建股票失败:', error);
    throw error;
  }
  
  return data;
};

export const updateStock = async (stockId: string, updates: Partial<Stock>): Promise<Stock> => {
  const { data, error } = await supabase
    .from('stocks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', stockId)
    .select()
    .single();
  
  if (error) {
    console.error('更新股票失败:', error);
    throw error;
  }
  
  return data;
};

export const deleteStock = async (stockId: string): Promise<void> => {
  const { error } = await supabase
    .from('stocks')
    .delete()
    .eq('id', stockId);
  
  if (error) {
    console.error('删除股票失败:', error);
    throw error;
  }
};

// 交易记录相关API
export const fetchTransactions = async (stockId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('stock_id', stockId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('获取交易记录失败:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('获取交易记录失败:', error);
    throw error;
  }
  
  return data || [];
};

// 获取指定时间范围内的交易记录
export const fetchTransactionsByDateRange = async (
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Transaction[]> => {

  
  // 首先获取时间范围内的所有交易
  const { data: rangeTransactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('获取交易记录失败:', error);
    throw error;
  }
  
  if (!rangeTransactions || rangeTransactions.length === 0) {
    return [];
  }
  
  // 找出时间范围内的卖出交易，获取它们关联的买入交易ID
  const sellTransactions = rangeTransactions.filter(t => t.type === 'sell');
  const parentBuyIds = sellTransactions
    .map(t => t.parent_buy_id)
    .filter(id => id != null);
  
  // 如果没有卖出交易，直接返回时间范围内的交易
  if (parentBuyIds.length === 0) {
    return rangeTransactions;
  }
  
  // 获取关联的买入交易（可能在时间范围外）
  const { data: relatedBuyTransactions, error: buyError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .in('id', parentBuyIds);
  
  if (buyError) {
    console.error('获取关联买入交易失败:', buyError);
    throw buyError;
  }
  
  // 合并交易记录，去重
  const allTransactions = [...rangeTransactions];
  const existingIds = new Set(rangeTransactions.map(t => t.id));
  
  if (relatedBuyTransactions) {
    relatedBuyTransactions.forEach(buyTx => {
      if (!existingIds.has(buyTx.id)) {
        allTransactions.push(buyTx);
      }
    });
  }
  
  return allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// 获取本月交易记录
export const fetchMonthlyTransactions = async (userId: string): Promise<Transaction[]> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return fetchTransactionsByDateRange(userId, startOfMonth, endOfMonth);
};

// 获取本周交易记录
export const fetchWeeklyTransactions = async (userId: string): Promise<Transaction[]> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 周一为一周开始
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return fetchTransactionsByDateRange(userId, startOfWeek, endOfWeek);
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transaction,
      timestamp: transaction.timestamp || new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('创建交易记录失败:', error);
    throw error;
  }
  
  // 如果是卖出交易，需要更新对应买入记录的剩余数量
  if (transaction.type === 'sell' && transaction.parent_buy_id) {
    const { data: buyTransaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction.parent_buy_id)
      .single();
    
    if (buyTransaction) {
      const newRemaining = (buyTransaction.remaining || buyTransaction.quantity) - transaction.quantity;
      
      await supabase
        .from('transactions')
        .update({ remaining: newRemaining })
        .eq('id', transaction.parent_buy_id);
    }
  }
  
  return data;
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();
  
  if (error) {
    console.error('更新交易记录失败:', error);
    throw error;
  }
  
  return data;
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  // 首先获取要删除的交易记录信息
  const { data: transactionToDelete, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();
  
  if (fetchError) {
    console.error('获取交易记录失败:', fetchError);
    throw fetchError;
  }
  
  // 如果是卖出交易，需要恢复对应买入记录的剩余数量
  if (transactionToDelete && transactionToDelete.type === 'sell' && transactionToDelete.parent_buy_id) {
    const { data: buyTransaction, error: buyError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionToDelete.parent_buy_id)
      .single();
    
    if (buyError) {
      console.error('获取买入记录失败:', buyError);
      throw buyError;
    }
    
    if (buyTransaction) {
      // 恢复买入记录的剩余数量
      const newRemaining = (buyTransaction.remaining || 0) + transactionToDelete.quantity;
      
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ remaining: newRemaining })
        .eq('id', transactionToDelete.parent_buy_id);
      
      if (updateError) {
        console.error('更新买入记录剩余数量失败:', updateError);
        throw updateError;
      }
    }
  }
  
  // 删除交易记录
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);
  
  if (error) {
    console.error('删除交易记录失败:', error);
    throw error;
  }
};

// 计算股票的浮动盈亏
export const calculateStockProfit = async (stockId: string): Promise<{ profit: number; profitPercentage: number }> => {
  // 获取该股票所有未全部卖出的买入记录
  const { data: buyTransactions, error: buyError } = await supabase
    .from('transactions')
    .select('*')
    .eq('stock_id', stockId)
    .eq('type', 'buy')
    .gt('remaining', 0);
  
  if (buyError) {
    console.error('获取买入记录失败:', buyError);
    throw buyError;
  }
  
  // 获取股票信息
  const { data: stock, error: stockError } = await supabase
    .from('stocks')
    .select('*')
    .eq('id', stockId)
    .single();
  
  if (stockError) {
    console.error('获取股票信息失败:', stockError);
    throw stockError;
  }
  
  if (!stock || !buyTransactions || buyTransactions.length === 0) {
    return { profit: 0, profitPercentage: 0 };
  }
  
  // 计算总持仓数量和总成本
  let totalQuantity = 0;
  let totalCost = 0;
  
  buyTransactions.forEach((transaction) => {
    const remainingShares = transaction.remaining || 0;
    if (remainingShares > 0) {
      totalQuantity += remainingShares;
      totalCost += (transaction.price * remainingShares + transaction.fee);
    }
  });
  
  // 计算当前市值
  const currentMarketValue = totalQuantity * stock.current_price;
  
  // 计算浮动盈亏
  const profit = currentMarketValue - totalCost;
  
  // 计算盈亏百分比
  const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  
  return { profit, profitPercentage };
};

// 获取股票的持仓笔数
export const getStockPositionCount = async (stockId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('stock_id', stockId)
    .eq('type', 'buy')
    .gt('remaining', 0);
  
  if (error) {
    console.error('获取持仓笔数失败:', error);
    throw error;
  }
  
  return count || 0;
};

// 获取股票的实际持仓数量
export const getStockHoldingQuantity = async (stockId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('remaining')
    .eq('stock_id', stockId)
    .eq('type', 'buy')
    .gt('remaining', 0);
  
  if (error) {
    console.error('获取持仓数量失败:', error);
    throw error;
  }
  
  return data.reduce((total, transaction) => total + (transaction.remaining || 0), 0);
};

// 理由标签统计
export const getTagStats = async (userId: string): Promise<TagStats[]> => {
  // 获取用户所有交易记录
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('获取交易记录失败:', error);
    throw error;
  }
  
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  // 计算标签统计
  const tagStatsMap = new Map<string, TagStats>();
  
  // 处理买入记录
  const buyTransactions = transactions.filter(t => t.type === 'buy');
  const sellTransactions = transactions.filter(t => t.type === 'sell');
  
  buyTransactions.forEach(buyTransaction => {
    const buyTags = buyTransaction.buy_reason?.tags || [];
    const relatedSells = sellTransactions.filter(
      t => t.parent_buy_id === buyTransaction.id
    );
    
    // 处理买入标签
    buyTags.forEach((tag: string) => {
      const stats = tagStatsMap.get(tag) || {
        tag,
        count: 0,
        avgHoldingDays: 0,
        totalProfit: 0,
        winRate: 0,
        totalTrades: 0,
        winTrades: 0,
      };
      
      // 如果有关联的卖出交易，计算已完成交易的盈亏
      if (relatedSells.length > 0) {
        relatedSells.forEach(sell => {
          const buyDate = new Date(buyTransaction.timestamp);
          const sellDate = new Date(sell.timestamp);
          const holdingDays = Math.ceil(
            (sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // 计算这笔交易的盈亏
          const buyValue = buyTransaction.price * sell.quantity;
          const sellValue = sell.price * sell.quantity;
          const buyFee = buyTransaction.fee * (sell.quantity / buyTransaction.quantity);
          const sellFee = sell.fee;
          const profit = sellValue - buyValue - buyFee - sellFee;
          
          stats.count++;
          stats.avgHoldingDays = 
            (stats.avgHoldingDays * (stats.count - 1) + holdingDays) / stats.count;
          stats.totalProfit += profit;
          stats.totalTrades++;
          if (profit > 0) stats.winTrades++;
        });
      } else {
        // 如果没有关联的卖出交易，仍然计算使用次数
        stats.count++;
      }
      
      if (stats.totalTrades > 0) {
        stats.winRate = stats.winTrades / stats.totalTrades;
      }
      
      tagStatsMap.set(tag, stats);
    });
    
    // 处理卖出记录中的标签
    relatedSells.forEach(sell => {
      const sellTags = sell.sell_reason?.tags || [];
      
      sellTags.forEach((tag: string) => {
        if (!tagStatsMap.has(tag)) {
          tagStatsMap.set(tag, {
            tag,
            count: 0,
            avgHoldingDays: 0,
            totalProfit: 0,
            winRate: 0,
            totalTrades: 0,
            winTrades: 0,
          });
        }
        
        const stats = tagStatsMap.get(tag)!;
        
        const buyDate = new Date(buyTransaction.timestamp);
        const sellDate = new Date(sell.timestamp);
        const holdingDays = Math.ceil(
          (sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // 计算这笔交易的盈亏
        const buyValue = buyTransaction.price * sell.quantity;
        const sellValue = sell.price * sell.quantity;
        const buyFee = buyTransaction.fee * (sell.quantity / buyTransaction.quantity);
        const sellFee = sell.fee;
        const profit = sellValue - buyValue - buyFee - sellFee;
        
        stats.count++;
        stats.avgHoldingDays = 
          (stats.avgHoldingDays * (stats.count - 1) + holdingDays) / stats.count;
        stats.totalProfit += profit;
        stats.totalTrades++;
        if (profit > 0) stats.winTrades++;
        
        if (stats.totalTrades > 0) {
          stats.winRate = stats.winTrades / stats.totalTrades;
        }
        
        tagStatsMap.set(tag, stats);
      });
    });
  });
  
  return Array.from(tagStatsMap.values());
}; 