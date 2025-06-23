import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/context/auth-context';
import { TopNav } from '@/components/layout/top-nav';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { 
  fetchStocks, 
  createStock, 
  updateStock, 
  deleteStock,
  calculateStockProfit,
  getStockHoldingQuantity,
  // fetchTransactionsByUserId,
  fetchTransactions
} from '@/lib/api';
import { IconArrowUp, IconArrowDown, IconEdit, IconPencil, IconTrash, IconDownload } from '@tabler/icons-react';
import { canAddMoreStocks, getStockLimit, formatDate, formatPrice } from '@/lib/utils';
import type { Database } from '@/lib/database.types';

type Stock = Database['public']['Tables']['stocks']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export const Route = createFileRoute('/_authenticated/stocks/')({
  component: StocksPage,
});

function StocksPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [, setIsLoading] = useState(true);
  const [isUpdatePriceDialogOpen, setIsUpdatePriceDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isEditStockDialogOpen, setIsEditStockDialogOpen] = useState(false);
  const [isDeleteStockDialogOpen, setIsDeleteStockDialogOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState<Stock | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newStockCode, setNewStockCode] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [newStockPrice, setNewStockPrice] = useState('');
  const [editStockCode, setEditStockCode] = useState('');
  const [editStockName, setEditStockName] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'profit' | 'position'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stocksData, setStocksData] = useState<{
    [key: string]: {
      profit: number;
      profitPercentage: number;
      holdingQuantity: number;
      positionValue: number;
    }
  }>({});
  const [isExporting, setIsExporting] = useState(false);

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
      isActive: true,
    },
    {
      title: '复盘分析',
      href: '/analysis',
      isActive: false,
    },
    {
      title: '关于我',
      href: 'http://www.jasonbai.com',
      isActive: false,
      isExternal: true,
    },
  ];

  // 从Supabase加载股票数据
  useEffect(() => {
    const loadStocks = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const stocksData = await fetchStocks(user.id);
          setStocks(stocksData);
          
          // 加载每只股票的计算数据
          const stocksCalculations: {
            [key: string]: {
              profit: number;
              profitPercentage: number;
              holdingQuantity: number;
              positionValue: number;
            }
          } = {};
          
          for (const stock of stocksData) {
            try {
              const [profitData, holdingQuantity] = await Promise.all([
                calculateStockProfit(stock.id),
                getStockHoldingQuantity(stock.id)
              ]);
              
              stocksCalculations[stock.id] = {
                profit: profitData.profit,
                profitPercentage: profitData.profitPercentage,
                holdingQuantity,
                positionValue: holdingQuantity * stock.current_price
              };
            } catch (err) {
              console.error(`计算股票 ${stock.stock_name} 数据失败:`, err);
            }
          }
          
          setStocksData(stocksCalculations);
        } catch (error) {
          console.error('获取股票数据失败:', error);
          toast({
            title: '获取数据失败',
            description: '无法加载股票数据，请稍后再试',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadStocks();
  }, [user, toast]);

  // 如果用户未登录，显示空白页
  if (!user) {
    return <div>请先登录</div>;
  }

  // 排序股票列表
  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.stock_name.localeCompare(b.stock_name)
        : b.stock_name.localeCompare(a.stock_name);
    } else if (sortBy === 'profit') {
      const profitA = stocksData[a.id]?.profitPercentage || 0;
      const profitB = stocksData[b.id]?.profitPercentage || 0;
      return sortOrder === 'asc' ? profitA - profitB : profitB - profitA;
    } else {
      const positionA = stocksData[a.id]?.positionValue || 0;
      const positionB = stocksData[b.id]?.positionValue || 0;
      return sortOrder === 'asc' ? positionA - positionB : positionB - positionA;
    }
  });

  // 更新股票价格
  const handleUpdatePrice = async () => {
    if (!currentStock || !newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) {
      toast({
        title: '错误',
        description: '请输入有效的价格',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedStock = await updateStock(currentStock.id, {
        current_price: parseFloat(newPrice),
      });

      setStocks(prevStocks =>
        prevStocks.map(stock =>
          stock.id === currentStock.id ? updatedStock : stock
        )
      );

      setIsUpdatePriceDialogOpen(false);
      setNewPrice('');
      setCurrentStock(null);

      toast({
        title: '价格已更新',
        description: `${currentStock.stock_name}的价格已更新为${newPrice}元`,
      });
      
      // 更新计算数据
      if (updatedStock) {
        const [profitData, holdingQuantity] = await Promise.all([
          calculateStockProfit(updatedStock.id),
          getStockHoldingQuantity(updatedStock.id)
        ]);
        
        setStocksData(prev => ({
          ...prev,
          [updatedStock.id]: {
            profit: profitData.profit,
            profitPercentage: profitData.profitPercentage,
            holdingQuantity,
            positionValue: holdingQuantity * updatedStock.current_price
          }
        }));
      }
    } catch (error) {
      console.error('更新股票价格失败:', error);
      toast({
        title: '更新失败',
        description: '无法更新股票价格，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  // 获取用户的股票限制信息
  const stockLimit = getStockLimit(user.role, user.tags);
  const stockLimitText = stockLimit === -1 
    ? "无限制" 
    : `${stocks.length}/${stockLimit}`;

  // 添加新股票
  const handleAddStock = async () => {
    if (!newStockCode || !newStockName || !newStockPrice) {
      toast({
        title: '错误',
        description: '请填写完整的股票信息',
        variant: 'destructive',
      });
      return;
    }

    const stockPrice = parseFloat(newStockPrice);
    if (isNaN(stockPrice) || stockPrice <= 0) {
      toast({
        title: '错误',
        description: '股票价格必须是大于0的数字',
        variant: 'destructive',
      });
      return;
    }

    // 检查股票代码是否已存在
    const stockExists = stocks.some((stock) => stock.stock_code === newStockCode);
    if (stockExists) {
      toast({
        title: '错误',
        description: '该股票代码已存在',
        variant: 'destructive',
      });
      return;
    }
    
    // 检查用户是否可以添加更多股票
    if (!canAddMoreStocks(user.role, user.tags, stocks.length)) {
      toast({
        title: '错误',
        description: '您已达到最大股票添加限制',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newStock = await createStock({
        user_id: user.id,
        stock_code: newStockCode,
        stock_name: newStockName,
        current_price: stockPrice,
      });

      setStocks((prevStocks) => [...prevStocks, newStock]);
      
      // 初始化新股票的计算数据
      setStocksData(prev => ({
        ...prev,
        [newStock.id]: {
          profit: 0,
          profitPercentage: 0,
          holdingQuantity: 0,
          positionValue: 0
        }
      }));

      setIsAddStockDialogOpen(false);
      setNewStockCode('');
      setNewStockName('');
      setNewStockPrice('');

      toast({
        title: '股票已添加',
        description: `${newStockName}(${newStockCode})已添加到您的股票列表`,
      });
    } catch (error) {
      console.error('添加股票失败:', error);
      toast({
        title: '添加失败',
        description: '无法添加股票，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  // 打开编辑股票对话框
  const openEditStockDialog = (stock: Stock) => {
    setCurrentStock(stock);
    setEditStockCode(stock.stock_code);
    setEditStockName(stock.stock_name);
    setIsEditStockDialogOpen(true);
  };

  // 编辑股票信息
  const handleEditStock = async () => {
    if (!currentStock || !editStockCode || !editStockName) {
      toast({
        title: '错误',
        description: '请填写完整的股票信息',
        variant: 'destructive',
      });
      return;
    }

    // 检查股票代码是否已存在（排除当前编辑的股票）
    const stockExists = stocks.some(
      (stock) => stock.stock_code === editStockCode && stock.id !== currentStock.id
    );
    if (stockExists) {
      toast({
        title: '错误',
        description: '该股票代码已存在',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedStock = await updateStock(currentStock.id, {
        stock_code: editStockCode,
        stock_name: editStockName,
      });

      setStocks((prevStocks) =>
        prevStocks.map((stock) => (stock.id === currentStock.id ? updatedStock : stock))
      );

      setIsEditStockDialogOpen(false);
      setCurrentStock(null);
      setEditStockCode('');
      setEditStockName('');

      toast({
        title: '股票已更新',
        description: `股票信息已更新为${editStockName}(${editStockCode})`,
      });
    } catch (error) {
      console.error('更新股票信息失败:', error);
      toast({
        title: '更新失败',
        description: '无法更新股票信息，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  // 打开删除股票对话框
  const openDeleteStockDialog = (stock: Stock) => {
    setCurrentStock(stock);
    setIsDeleteStockDialogOpen(true);
  };

  // 删除股票
  const handleDeleteStock = async () => {
    if (!currentStock) return;

    try {
      await deleteStock(currentStock.id);

      setStocks((prevStocks) => prevStocks.filter((stock) => stock.id !== currentStock.id));
      
      // 移除该股票的计算数据
      const newStocksData = { ...stocksData };
      delete newStocksData[currentStock.id];
      setStocksData(newStocksData);

      setIsDeleteStockDialogOpen(false);
      setCurrentStock(null);

      toast({
        title: '股票已删除',
        description: `${currentStock.stock_name}(${currentStock.stock_code})已从您的股票列表中删除`,
      });
    } catch (error) {
      console.error('删除股票失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除股票，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  // 切换排序方式
  const toggleSort = (field: 'name' | 'profit' | 'position') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 添加股票对话框内容
  const renderAddStockDialog = () => (
    <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加新股票</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock-code" className="text-right">
              股票代码
            </Label>
            <Input
              id="stock-code"
              value={newStockCode}
              onChange={(e) => setNewStockCode(e.target.value)}
              className="col-span-3"
              placeholder="例如: 600000"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock-name" className="text-right">
              股票名称
            </Label>
            <Input
              id="stock-name"
              value={newStockName}
              onChange={(e) => setNewStockName(e.target.value)}
              className="col-span-3"
              placeholder="例如: 浦发银行"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock-price" className="text-right">
              当前价格
            </Label>
            <Input
              id="stock-price"
              value={newStockPrice}
              onChange={(e) => setNewStockPrice(e.target.value)}
              className="col-span-3"
              placeholder="例如: 10.250"
              type="number"
              step="0.001"
              min="0.001"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>
            取消
          </Button>
          <Button onClick={handleAddStock}>添加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // CSV导出功能
  const handleExportCSV = async () => {
    if (!user) return;

    setIsExporting(true);
    
    try {
      // 获取所有股票的交易记录
      const allTransactions: (Transaction & { stock_name: string; stock_code: string })[] = [];
      
      for (const stock of stocks) {
        const transactions = await fetchTransactions(stock.id);
        const transactionsWithStock = transactions.map(t => ({
          ...t,
          stock_name: stock.stock_name,
          stock_code: stock.stock_code
        }));
        allTransactions.push(...transactionsWithStock);
      }

      // 按时间排序（最新的在前）
      allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // 生成CSV内容
      const headers = [
        '股票代码',
        '股票名称', 
        '交易类型',
        '数量',
        '价格',
        '手续费',
        '交易时间',
        '买入理由标签',
        '买入理由备注',
        '卖出理由标签',
        '卖出理由备注',
        '剩余数量'
      ];

      const csvRows = [headers];

              allTransactions.forEach(transaction => {
          const row = [
            transaction.stock_code,
            transaction.stock_name,
            transaction.type === 'buy' ? '买入' : '卖出',
            transaction.quantity.toString(),
            transaction.price.toString(),
            transaction.fee.toString(),
            formatDate(transaction.timestamp),
            transaction.buy_reason?.tags?.join(';') || '',
            transaction.buy_reason?.note || '',
            transaction.sell_reason?.tags?.join(';') || '',
            transaction.sell_reason?.note || '',
            transaction.remaining?.toString() || ''
          ];
          csvRows.push(row);
        });

      // 转换为CSV字符串
      const csvContent = csvRows.map(row => 
        row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // 添加BOM以确保中文正确显示
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      
      // 生成文件名
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      link.download = `股票交易记录_${dateStr}.csv`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '导出成功',
        description: `已导出 ${allTransactions.length} 条交易记录`,
      });
    } catch (error) {
      console.error('导出CSV失败:', error);
      toast({
        title: '导出失败',
        description: '无法导出数据，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">股票管理</h1>
            <p className="text-muted-foreground">
              管理您的股票投资组合
              {stockLimit !== -1 && (
                <span className="ml-2 text-sm font-medium">
                  (股票记录：{stockLimitText})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={handleExportCSV}
              disabled={isExporting || stocks.length === 0}
            >
              <IconDownload size={16} className="mr-1" />
              {isExporting ? '导出中...' : '导出CSV'}
            </Button>
            <Button 
              onClick={() => {
                // 检查用户是否可以添加更多股票
                if (!canAddMoreStocks(user.role, user.tags, stocks.length)) {
                  toast({
                    title: '错误',
                    description: '您已达到最大股票添加限制',
                    variant: 'destructive',
                  });
                  return;
                }
                setIsAddStockDialogOpen(true);
              }}
            >
              添加股票
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsContent value="list" className="space-y-4">
            {stocks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground mb-4">您还没有添加任何股票</p>
                  <Button 
                    onClick={() => {
                      // 检查用户是否可以添加更多股票
                      if (!canAddMoreStocks(user.role, user.tags, stocks.length)) {
                        toast({
                          title: '错误',
                          description: '您已达到最大股票添加限制',
                          variant: 'destructive',
                        });
                        return;
                      }
                      setIsAddStockDialogOpen(true);
                    }}
                  >
                    添加第一只股票
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>股票列表</CardTitle>
                  <CardDescription>
                    共 {stocks.length} 只股票，点击股票名称查看交易明细
                    {stockLimit !== -1 && (
                      <span className="ml-2">
                        (限制：{stockLimitText})
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px] cursor-pointer" onClick={() => toggleSort('name')}>
                            股票名称 {sortBy === 'name' && (sortOrder === 'asc' ? <IconArrowUp size={16} className="inline" /> : <IconArrowDown size={16} className="inline" />)}
                          </TableHead>
                          <TableHead>代码</TableHead>
                          <TableHead>当前价格</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => toggleSort('profit')}>
                            浮动盈亏 {sortBy === 'profit' && (sortOrder === 'asc' ? <IconArrowUp size={16} className="inline" /> : <IconArrowDown size={16} className="inline" />)}
                          </TableHead>
                          <TableHead>持仓数量</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => toggleSort('position')}>
                            持仓金额 {sortBy === 'position' && (sortOrder === 'asc' ? <IconArrowUp size={16} className="inline" /> : <IconArrowDown size={16} className="inline" />)}
                          </TableHead>
                          <TableHead>最后更新时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedStocks.map((stock) => {
                          // 使用缓存的计算结果，而不是直接调用异步函数
                          const profit = stocksData[stock.id]?.profit || 0;
                          const profitPercentage = stocksData[stock.id]?.profitPercentage || 0;
                          const holdingQuantity = stocksData[stock.id]?.holdingQuantity || 0;
                          const positionValue = stocksData[stock.id]?.positionValue || 0;


                          return (
                            <TableRow key={stock.id}>
                              <TableCell className="font-medium">
                                <Link to="/stocks/$stockId" params={{ stockId: stock.id }}>
                                  {stock.stock_name}
                                </Link>
                              </TableCell>
                              <TableCell>{stock.stock_code}</TableCell>
                              <TableCell>{formatPrice(stock.current_price)}</TableCell>
                              <TableCell>
                                <span className={profit > 0 ? 'text-red-600' : profit < 0 ? 'text-green-600' : ''}>
                                  {formatPrice(profit)} ({formatPrice(profitPercentage)}%)
                                </span>
                              </TableCell>
                              <TableCell>{holdingQuantity}</TableCell>
                              <TableCell>{formatPrice(positionValue)}</TableCell>
                              <TableCell>{formatDate(stock.updated_at)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditStockDialog(stock)}
                                  >
                                    <IconPencil size={16} className="mr-1" />
                                    编辑
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCurrentStock(stock);
                                      setNewPrice(stock.current_price.toString());
                                      setIsUpdatePriceDialogOpen(true);
                                    }}
                                  >
                                    <IconEdit size={16} className="mr-1" />
                                    更新价格
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteStockDialog(stock)}
                                  >
                                    <IconTrash size={16} className="mr-1" />
                                    删除
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 更新价格对话框 */}
        <Dialog open={isUpdatePriceDialogOpen} onOpenChange={setIsUpdatePriceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>更新股票价格</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock-name" className="text-right">
                  股票名称
                </Label>
                <div className="col-span-3">
                  <Input
                    id="stock-name"
                    value={currentStock?.stock_name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-price" className="text-right">
                  当前价格
                </Label>
                <div className="col-span-3">
                  <Input
                    id="current-price"
                    value={currentStock ? formatPrice(currentStock.current_price) : ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-price" className="text-right">
                  新价格
                </Label>
                <div className="col-span-3">
                  <Input
                    id="new-price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    type="number"
                    step="0.001"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdatePriceDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdatePrice}>更新</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {renderAddStockDialog()}

        {/* 编辑股票对话框 */}
        <Dialog open={isEditStockDialogOpen} onOpenChange={setIsEditStockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑股票信息</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock-code" className="text-right">
                  股票代码
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-stock-code"
                    value={editStockCode}
                    onChange={(e) => setEditStockCode(e.target.value)}
                    placeholder="如：600000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock-name" className="text-right">
                  股票名称
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-stock-name"
                    value={editStockName}
                    onChange={(e) => setEditStockName(e.target.value)}
                    placeholder="如：浦发银行"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditStockDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleEditStock}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除股票确认对话框 */}
        <Dialog open={isDeleteStockDialogOpen} onOpenChange={setIsDeleteStockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除股票</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>您确定要删除 {currentStock?.stock_name} ({currentStock?.stock_code}) 吗？</p>
              <p className="text-red-500 mt-2">此操作将同时删除该股票的所有交易记录，且无法恢复。</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteStockDialogOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDeleteStock}>
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  );
} 