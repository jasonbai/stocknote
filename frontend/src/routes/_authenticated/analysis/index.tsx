import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { TopNav } from '@/components/layout/top-nav';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,

  Cell,
} from 'recharts';
import { getTagStats, fetchMonthlyTransactions, fetchWeeklyTransactions, fetchStocks } from '@/lib/api';
import { formatDate, formatAmount, formatPercentage } from '@/lib/utils';
import type { TagStats, Database } from '@/lib/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Stock = Database['public']['Tables']['stocks']['Row'];

export const Route = createFileRoute('/_authenticated/analysis/')({
  component: AnalysisPage,
});

function AnalysisPage() {
  const { user } = useAuth();
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [sortBy, setSortBy] = useState<keyof TagStats>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  
  // 月度和周度交易数据
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([]);
  const [weeklyTransactions, setWeeklyTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(true);
  const [isWeeklyLoading, setIsWeeklyLoading] = useState(true);

  // 定义导航链接
  const navLinks = [
    {
      title: '首页',
      href: '/',
      isActive: false,
    },
    {
      title: '股票清单',
      href: '/stocks',
      isActive: false,
    },
    {
      title: '复盘分析',
      href: '/analysis',
      isActive: true,
    },
    {
      title: '关于我',
      href: 'http://www.jasonbai.com',
      isActive: false,
      isExternal: true,
    },
  ];

  // 从Supabase加载数据
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setIsLoading(true);
          setIsMonthlyLoading(true);
          setIsWeeklyLoading(true);
          
          // 并行加载所有数据
          const [stats, monthly, weekly, stockList] = await Promise.all([
            getTagStats(user.id),
            fetchMonthlyTransactions(user.id),
            fetchWeeklyTransactions(user.id),
            fetchStocks(user.id)
          ]);
          

          
          setTagStats(stats as TagStats[]);
          setMonthlyTransactions(monthly);
          setWeeklyTransactions(weekly);
          setStocks(stockList);
        } catch (error) {
          console.error('获取数据失败:', error);
        } finally {
          setIsLoading(false);
          setIsMonthlyLoading(false);
          setIsWeeklyLoading(false);
        }
      }
    };
    
    loadData();
  }, [user]);

  // 计算总盈亏和平均胜率
  const { totalProfit, avgWinRate } = useMemo(() => {
    const total = tagStats.reduce((sum, stat) => sum + stat.totalProfit, 0);
    const avg = tagStats.length > 0 
      ? tagStats.reduce((sum, stat) => sum + stat.winRate, 0) / tagStats.length
      : 0;
    return { totalProfit: total, avgWinRate: avg };
  }, [tagStats]);

  // 排序标签统计数据
  const sortedTagStats = [...tagStats].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  // 切换排序方式
  const toggleSort = (field: keyof TagStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // 图表数据
  const chartData = sortedTagStats.map((stat) => ({
    name: stat.tag,
    盈利: Number(stat.totalProfit) > 0 ? Number(stat.totalProfit) : 0,
    亏损: Number(stat.totalProfit) < 0 ? -Number(stat.totalProfit) : 0,
    胜率: Number(stat.winRate) * 100,
    平均持仓天数: Number(stat.avgHoldingDays),
  }));

  // 分析交易数据的辅助函数
  const analyzeTransactions = (transactions: Transaction[], dateRange?: { start: Date; end: Date }) => {
    // 如果提供了日期范围，只分析范围内的交易用于统计，但买入交易可以来自范围外
    let transactionsToAnalyze = transactions;
    if (dateRange) {
      // 只统计时间范围内的交易次数
      transactionsToAnalyze = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return txDate >= dateRange.start && txDate <= dateRange.end;
      });
    }
    
    const buyTransactions = transactions.filter(t => t.type === 'buy'); // 所有买入交易（包括范围外的）
    const sellTransactions = transactionsToAnalyze.filter(t => t.type === 'sell'); // 只分析范围内的卖出交易
    const buyTransactionsInRange = transactionsToAnalyze.filter(t => t.type === 'buy'); // 范围内的买入交易
    

    
    let totalProfit = 0;
    let totalTrades = 0;
    let winTrades = 0;
    let totalInvestment = 0;
    let totalFees = 0;
    const stockMap = new Map<string, { stock: Stock | null, transactions: Transaction[] }>();
    
    // 按股票分组交易（只统计时间范围内的交易）
    transactionsToAnalyze.forEach(transaction => {
      const stock = stocks.find(s => s.id === transaction.stock_id) || null;
      if (!stockMap.has(transaction.stock_id)) {
        stockMap.set(transaction.stock_id, { stock, transactions: [] });
      }
      stockMap.get(transaction.stock_id)!.transactions.push(transaction);
    });
    
    // 计算已完成交易的盈亏
    sellTransactions.forEach(sellTransaction => {
      const buyTransaction = buyTransactions.find(t => t.id === sellTransaction.parent_buy_id);
      
      if (buyTransaction) {
        const buyValue = buyTransaction.price * sellTransaction.quantity;
        const sellValue = sellTransaction.price * sellTransaction.quantity;
        const buyFee = buyTransaction.fee * (sellTransaction.quantity / buyTransaction.quantity);
        const sellFee = sellTransaction.fee;
        const profit = sellValue - buyValue - buyFee - sellFee;
        
        totalProfit += profit;
        totalTrades++;
        if (profit > 0) winTrades++;
      }
    });
    
    // 计算总投资额和手续费（只计算时间范围内的）
    buyTransactionsInRange.forEach(transaction => {
      totalInvestment += transaction.price * transaction.quantity;
      totalFees += transaction.fee;
    });
    sellTransactions.forEach(transaction => {
      totalFees += transaction.fee;
    });
    
    const winRate = totalTrades > 0 ? winTrades / totalTrades : 0;
    const profitRate = totalInvestment > 0 ? totalProfit / totalInvestment : 0;
    
    return {
      totalTransactions: transactionsToAnalyze.length,
      buyCount: buyTransactionsInRange.length,
      sellCount: sellTransactions.length,
      totalProfit,
      totalTrades,
      winTrades,
      winRate,
      totalInvestment,
      totalFees,
      profitRate,
      stockCount: stockMap.size,
      stockMap
    };
  };
  
  // 获取标签分析数据
  const getTagAnalysis = (transactions: Transaction[], dateRange?: { start: Date; end: Date }) => {
    const tagStats = new Map<string, { count: number; profit: number; trades: number; wins: number }>();
    
    // 如果提供了日期范围，只分析范围内的卖出交易
    let transactionsToAnalyze = transactions;
    if (dateRange) {
      transactionsToAnalyze = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return txDate >= dateRange.start && txDate <= dateRange.end;
      });
    }
    
    const sellTransactions = transactionsToAnalyze.filter(t => t.type === 'sell');
    const buyTransactions = transactions.filter(t => t.type === 'buy'); // 所有买入交易
    
    sellTransactions.forEach(sellTransaction => {
      const buyTransaction = buyTransactions.find(t => t.id === sellTransaction.parent_buy_id);
      if (buyTransaction) {
        const buyValue = buyTransaction.price * sellTransaction.quantity;
        const sellValue = sellTransaction.price * sellTransaction.quantity;
        const buyFee = buyTransaction.fee * (sellTransaction.quantity / buyTransaction.quantity);
        const sellFee = sellTransaction.fee;
        const profit = sellValue - buyValue - buyFee - sellFee;
        
        // 处理买入标签
        const buyTags = buyTransaction.buy_reason?.tags || [];
        buyTags.forEach(tag => {
          if (!tagStats.has(tag)) {
            tagStats.set(tag, { count: 0, profit: 0, trades: 0, wins: 0 });
          }
          const stats = tagStats.get(tag)!;
          stats.count++;
          stats.profit += profit;
          stats.trades++;
          if (profit > 0) stats.wins++;
        });
        
        // 处理卖出标签
        const sellTags = sellTransaction.sell_reason?.tags || [];
        sellTags.forEach(tag => {
          if (!tagStats.has(tag)) {
            tagStats.set(tag, { count: 0, profit: 0, trades: 0, wins: 0 });
          }
          const stats = tagStats.get(tag)!;
          stats.count++;
          stats.profit += profit;
          stats.trades++;
          if (profit > 0) stats.wins++;
        });
      }
    });
    
    return Array.from(tagStats.entries()).map(([tag, stats]) => ({
      tag,
      count: stats.count,
      profit: stats.profit,
      winRate: stats.trades > 0 ? stats.wins / stats.trades : 0
    }));
  };

  // 月度和周度分析数据
  const monthlyAnalysis = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return analyzeTransactions(monthlyTransactions, { start: startOfMonth, end: endOfMonth });
  }, [monthlyTransactions, stocks]);
  
  const weeklyAnalysis = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return analyzeTransactions(weeklyTransactions, { start: startOfWeek, end: endOfWeek });
  }, [weeklyTransactions, stocks]);
  
  const monthlyTagAnalysis = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return getTagAnalysis(monthlyTransactions, { start: startOfMonth, end: endOfMonth });
  }, [monthlyTransactions]);
  
  const weeklyTagAnalysis = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return getTagAnalysis(weeklyTransactions, { start: startOfWeek, end: endOfWeek });
  }, [weeklyTransactions]);

  return (
    <>
      <Header fixed>
        <TopNav links={navLinks} className="mr-auto" />
        <div className="flex items-center gap-2 ml-auto">
          <Search className="w-[100px] md:w-[120px]" />
          <ThemeSwitch />
        </div>
      </Header>
      <Main>
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">复盘分析</h1>
            <p className="text-muted-foreground">
              分析您的交易记录，提高投资决策质量
            </p>
          </div>
        </div>

        <Tabs defaultValue="tags" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tags">汇总分析</TabsTrigger>
            <TabsTrigger value="monthly">本月交易分析</TabsTrigger>
            <TabsTrigger value="weekly">本周交易分析</TabsTrigger>
          </TabsList>
          <TabsContent value="tags" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    标签总数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tagStats.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    交易总次数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tagStats.reduce((sum, stat) => sum + stat.count, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总盈亏
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalProfit > 0 ? 'text-red-600' : totalProfit < 0 ? 'text-green-600' : ''}`}>
                    {formatAmount(Number(totalProfit))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    平均胜率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(Number(avgWinRate))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>标签盈亏分析</CardTitle>
                <CardDescription>
                  按标签统计的盈亏情况，点击列标题可排序
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-muted-foreground">加载中...</p>
                  </div>
                ) : tagStats.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    暂无交易记录或标签数据
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer"
                              onClick={() => toggleSort('tag')}
                            >
                              标签
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer text-right"
                              onClick={() => toggleSort('count')}
                            >
                              使用次数
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer text-right"
                              onClick={() => toggleSort('avgHoldingDays')}
                            >
                              平均持仓天数
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer text-right"
                              onClick={() => toggleSort('totalProfit')}
                            >
                              总盈亏
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer text-right"
                              onClick={() => toggleSort('winRate')}
                            >
                              胜率
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedTagStats.map((stat) => (
                            <TableRow key={stat.tag}>
                              <TableCell>
                                <Badge variant="outline">{stat.tag}</Badge>
                              </TableCell>
                              <TableCell className="text-right">{stat.count}</TableCell>
                              <TableCell className="text-right">{stat.avgHoldingDays.toFixed(1)}天</TableCell>
                              <TableCell className={`text-right ${stat.totalProfit > 0 ? 'text-red-600' : stat.totalProfit < 0 ? 'text-green-600' : ''}`}>
                                {formatAmount(stat.totalProfit)}
                              </TableCell>
                              <TableCell className="text-right">{formatPercentage(stat.winRate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">标签盈亏对比图</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => `¥${value}`} />
                          <Legend />
                          <Bar dataKey="盈利" fill="#ef4444" />
                          <Bar dataKey="亏损" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    本月交易次数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyAnalysis.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    买入 {monthlyAnalysis.buyCount} | 卖出 {monthlyAnalysis.sellCount}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    本月盈亏
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${monthlyAnalysis.totalProfit > 0 ? 'text-red-600' : monthlyAnalysis.totalProfit < 0 ? 'text-green-600' : ''}`}>
                    {formatAmount(monthlyAnalysis.totalProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    收益率: {formatPercentage(monthlyAnalysis.profitRate * 100)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    本月胜率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(monthlyAnalysis.winRate * 100)}</div>
                  <p className="text-xs text-muted-foreground">
                    {monthlyAnalysis.winTrades}/{monthlyAnalysis.totalTrades} 笔盈利
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    涉及股票
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyAnalysis.stockCount}</div>
                  <p className="text-xs text-muted-foreground">
                    手续费: {formatAmount(monthlyAnalysis.totalFees)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {isMonthlyLoading ? (
              <Card>
                <CardContent className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">加载中...</p>
                </CardContent>
              </Card>
            ) : monthlyTransactions.length === 0 ? (
              <Card>
                <CardContent className="text-center p-6 text-muted-foreground">
                  本月暂无交易记录
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>本月标签表现</CardTitle>
                    <CardDescription>
                      按标签分析本月交易表现
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monthlyTagAnalysis.length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">
                        暂无完成的交易记录
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={monthlyTagAnalysis.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tag" />
                            <YAxis />
                            <Tooltip formatter={(value: any, name: string) => 
                              name === '盈亏' ? `¥${Number(value).toFixed(2)}` : `${(Number(value) * 100).toFixed(1)}%`
                            } />
                            <Legend />
                            <Bar dataKey="profit" name="盈亏">
                              {monthlyTagAnalysis.slice(0, 10).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#ef4444' : '#22c55e'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>标签</TableHead>
                                <TableHead className="text-right">使用次数</TableHead>
                                <TableHead className="text-right">盈亏</TableHead>
                                <TableHead className="text-right">胜率</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {monthlyTagAnalysis.slice(0, 10).map((item) => (
                                <TableRow key={item.tag}>
                                  <TableCell>
                                    <Badge variant="outline">{item.tag}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{item.count}</TableCell>
                                  <TableCell className={`text-right ${item.profit > 0 ? 'text-red-600' : item.profit < 0 ? 'text-green-600' : ''}`}>
                                    {formatAmount(item.profit)}
                                  </TableCell>
                                  <TableCell className="text-right">{formatPercentage(item.winRate * 100)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>本月股票交易明细</CardTitle>
                    <CardDescription>
                      按股票查看本月交易情况
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from(monthlyAnalysis.stockMap.entries()).map(([stockId, stockData]) => (
                        <div key={stockId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <h4 className="font-medium">
                                {stockData.stock ? `${stockData.stock.stock_name} (${stockData.stock.stock_code})` : `股票ID: ${stockId}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                交易次数: {stockData.transactions.length}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {stockData.transactions.map((transaction) => (
                              <div key={transaction.id} className="flex justify-between items-center text-sm border-l-2 border-gray-200 pl-3">
                                <div>
                                  <span className={`font-medium ${transaction.type === 'buy' ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {transaction.type === 'buy' ? '买入' : '卖出'}
                                  </span>
                                  <span className="ml-2">{formatDate(transaction.timestamp)}</span>
                                </div>
                                <div className="text-right">
                                  <div>{transaction.quantity} 股 @ {transaction.price.toFixed(3)}</div>
                                  <div className="text-xs text-muted-foreground">手续费: {formatAmount(transaction.fee)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    本周交易次数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyAnalysis.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    买入 {weeklyAnalysis.buyCount} | 卖出 {weeklyAnalysis.sellCount}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    本周盈亏
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${weeklyAnalysis.totalProfit > 0 ? 'text-red-600' : weeklyAnalysis.totalProfit < 0 ? 'text-green-600' : ''}`}>
                    {formatAmount(weeklyAnalysis.totalProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    收益率: {formatPercentage(weeklyAnalysis.profitRate * 100)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    本周胜率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(weeklyAnalysis.winRate * 100)}</div>
                  <p className="text-xs text-muted-foreground">
                    {weeklyAnalysis.winTrades}/{weeklyAnalysis.totalTrades} 笔盈利
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    涉及股票
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyAnalysis.stockCount}</div>
                  <p className="text-xs text-muted-foreground">
                    手续费: {formatAmount(weeklyAnalysis.totalFees)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {isWeeklyLoading ? (
              <Card>
                <CardContent className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">加载中...</p>
                </CardContent>
              </Card>
            ) : weeklyTransactions.length === 0 ? (
              <Card>
                <CardContent className="text-center p-6 text-muted-foreground">
                  本周暂无交易记录
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>本周标签表现</CardTitle>
                    <CardDescription>
                      按标签分析本周交易表现
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weeklyTagAnalysis.length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">
                        暂无完成的交易记录
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={weeklyTagAnalysis.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tag" />
                            <YAxis />
                            <Tooltip formatter={(value: any, name: string) => 
                              name === '盈亏' ? `¥${Number(value).toFixed(2)}` : `${(Number(value) * 100).toFixed(1)}%`
                            } />
                            <Legend />
                            <Bar dataKey="profit" name="盈亏">
                              {weeklyTagAnalysis.slice(0, 10).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#ef4444' : '#22c55e'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>标签</TableHead>
                                <TableHead className="text-right">使用次数</TableHead>
                                <TableHead className="text-right">盈亏</TableHead>
                                <TableHead className="text-right">胜率</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {weeklyTagAnalysis.slice(0, 10).map((item) => (
                                <TableRow key={item.tag}>
                                  <TableCell>
                                    <Badge variant="outline">{item.tag}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{item.count}</TableCell>
                                  <TableCell className={`text-right ${item.profit > 0 ? 'text-red-600' : item.profit < 0 ? 'text-green-600' : ''}`}>
                                    {formatAmount(item.profit)}
                                  </TableCell>
                                                                      <TableCell className="text-right">{formatPercentage(item.winRate * 100)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>本周股票交易明细</CardTitle>
                    <CardDescription>
                      按股票查看本周交易情况
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from(weeklyAnalysis.stockMap.entries()).map(([stockId, stockData]) => (
                        <div key={stockId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <h4 className="font-medium">
                                {stockData.stock ? `${stockData.stock.stock_name} (${stockData.stock.stock_code})` : `股票ID: ${stockId}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                交易次数: {stockData.transactions.length}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {stockData.transactions.map((transaction) => (
                              <div key={transaction.id} className="flex justify-between items-center text-sm border-l-2 border-gray-200 pl-3">
                                <div>
                                  <span className={`font-medium ${transaction.type === 'buy' ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {transaction.type === 'buy' ? '买入' : '卖出'}
                                  </span>
                                  <span className="ml-2">{formatDate(transaction.timestamp)}</span>
                                </div>
                                <div className="text-right">
                                  <div>{transaction.quantity} 股 @ {transaction.price.toFixed(3)}</div>
                                  <div className="text-xs text-muted-foreground">手续费: {formatAmount(transaction.fee)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
} 