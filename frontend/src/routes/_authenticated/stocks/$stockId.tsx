import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  fetchStockById,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/api';
import type { Database } from '@/lib/database.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { IconArrowBack, IconPlus, IconTrash, IconPencil } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDate } from '@/lib/utils';

type Stock = Database['public']['Tables']['stocks']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export const Route = createFileRoute('/_authenticated/stocks/$stockId')({
  component: StockDetailPage,
});

function StockDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stockId } = Route.useParams();
  
  // 股票状态
  const [stock, setStock] = useState<Stock | null>(null);
  const [, setIsLoading] = useState(true);
  
  // 交易记录状态
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // 卖出对话框状态
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [currentBuyTransaction, setCurrentBuyTransaction] = useState<Transaction | null>(null);
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellFee, setSellFee] = useState('0');
  const [sellReason, setSellReason] = useState('');
  const [sellTags, setSellTags] = useState<string[]>([]);
  const [sellDate, setSellDate] = useState<Date | undefined>(new Date());
  
  // 买入对话框状态
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyFee, setBuyFee] = useState('0');
  const [buyReason, setBuyReason] = useState('');
  const [buyTags, setBuyTags] = useState<string[]>([]);
  const [buyDate, setBuyDate] = useState<Date | undefined>(new Date());
  
  // 编辑对话框状态
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editFee, setEditFee] = useState('0');
  const [editReason, setEditReason] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDate, setEditDate] = useState<Date | undefined>(new Date());
  
  // 常用标签
  const commonTags = ['止盈', '止损', '大跌抄底', '看空', '资金需求', '高估', '反弹降风险', '低估值', '技术面看好'];

  // 计算手续费
  const calculateFee = (price: number, quantity: number) => {
    const transactionAmount = price * quantity;
    const feeByRate = transactionAmount * 0.0003;
    
    // 手续费低于5元时，按5元收取
    return Math.max(feeByRate, 5);
  };

  // 从Supabase加载数据
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setIsLoading(true);
          
          // 获取股票信息
          const stockData = await fetchStockById(stockId);
          setStock(stockData);
          
          if (stockData) {
            // 获取交易记录
            const transactionsData = await fetchTransactions(stockId);
            setTransactions(transactionsData);
          }
        } catch (error) {
          console.error('获取数据失败:', error);
          toast({
            title: '获取数据失败',
            description: '无法加载股票和交易数据，请稍后再试',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user, stockId, toast]);

  // 自动计算买入手续费
  useEffect(() => {
    const price = parseFloat(buyPrice);
    const quantity = parseInt(buyQuantity);
    
    if (!isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
      const fee = calculateFee(price, quantity);
      setBuyFee(fee.toFixed(2));
    } else {
      setBuyFee('0.00');
    }
  }, [buyPrice, buyQuantity]);

  // 自动计算卖出手续费
  useEffect(() => {
    const price = parseFloat(sellPrice);
    const quantity = parseInt(sellQuantity);
    
    if (!isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
      const fee = calculateFee(price, quantity);
      setSellFee(fee.toFixed(2));
    } else {
      setSellFee('0.00');
    }
  }, [sellPrice, sellQuantity]);

  // 自动计算编辑手续费
  useEffect(() => {
    const price = parseFloat(editPrice);
    const quantity = parseInt(editQuantity);
    
    if (!isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
      const fee = calculateFee(price, quantity);
      setEditFee(fee.toFixed(2));
    } else {
      setEditFee('0.00');
    }
  }, [editPrice, editQuantity]);

  // 如果股票不存在或不属于当前用户
  if (!stock || (user && stock.user_id !== user.id)) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to="/stocks" className="mr-2">
            <Button variant="outline" size="sm">
              <IconArrowBack size={16} className="mr-1" />
              返回
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">股票不存在或无权访问</h1>
        </div>
      </div>
    );
  }

  // 处理卖出操作
  const handleSell = async () => {
    if (!currentBuyTransaction || !sellDate || !user) return;
    
    const sellQty = parseInt(sellQuantity);
    const sellPriceValue = parseFloat(sellPrice);
    const sellFeeValue = parseFloat(sellFee);
    
    // 验证输入
    if (isNaN(sellQty) || sellQty <= 0 || sellQty > (currentBuyTransaction.remaining || currentBuyTransaction.quantity)) {
      toast({
        title: '错误',
        description: '请输入有效的卖出数量',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(sellPriceValue) || sellPriceValue <= 0) {
      toast({
        title: '错误',
        description: '请输入有效的卖出价格',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // 创建卖出记录
      await createTransaction({
        user_id: user.id,
        stock_id: stock.id,
        type: 'sell',
        quantity: sellQty,
        price: sellPriceValue,
        fee: sellFeeValue,
        timestamp: sellDate.toISOString(),
        parent_buy_id: currentBuyTransaction.id,
        sell_reason: {
          tags: sellTags,
          note: sellReason,
        },
      });
      
      // 更新交易记录列表
      const updatedTransactions = await fetchTransactions(stockId);
      setTransactions(updatedTransactions);
      
      // 关闭对话框并重置表单
      setIsSellDialogOpen(false);
      setCurrentBuyTransaction(null);
      setSellQuantity('');
      setSellPrice('');
      setSellFee('0');
      setSellReason('');
      setSellTags([]);
      setSellDate(new Date());
      
      toast({
        title: '卖出成功',
        description: `已成功记录卖出交易`,
      });
    } catch (error) {
      console.error('卖出交易记录失败:', error);
      toast({
        title: '卖出失败',
        description: '无法记录卖出交易，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  // 切换卖出标签
  const toggleSellTag = (tag: string) => {
    setSellTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  // 切换买入标签
  const toggleBuyTag = (tag: string) => {
    setBuyTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  // 处理买入操作
  const handleBuy = async () => {
    if (!buyDate || !user) return;
    
    const buyQty = parseInt(buyQuantity);
    const buyPriceValue = parseFloat(buyPrice);
    const buyFeeValue = parseFloat(buyFee);
    
    // 验证输入
    if (isNaN(buyQty) || buyQty <= 0) {
      toast({
        title: '错误',
        description: '请输入有效的买入数量',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(buyPriceValue) || buyPriceValue <= 0) {
      toast({
        title: '错误',
        description: '请输入有效的买入价格',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // 创建买入记录
      await createTransaction({
        user_id: user.id,
        stock_id: stock.id,
        type: 'buy',
        quantity: buyQty,
        price: buyPriceValue,
        fee: buyFeeValue,
        timestamp: buyDate.toISOString(),
        remaining: buyQty, // 初始剩余数量等于买入数量
        buy_reason: {
          tags: buyTags,
          note: buyReason,
        },
      });
      
      // 更新交易记录列表
      const updatedTransactions = await fetchTransactions(stockId);
      setTransactions(updatedTransactions);
      
      // 关闭对话框并重置表单
      setIsBuyDialogOpen(false);
      setBuyQuantity('');
      setBuyPrice('');
      setBuyFee('0');
      setBuyReason('');
      setBuyTags([]);
      setBuyDate(new Date());
      
      toast({
        title: '买入成功',
        description: `已成功记录买入交易`,
      });
    } catch (error) {
      console.error('买入交易记录失败:', error);
      toast({
        title: '买入失败',
        description: '无法记录买入交易，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  // 获取交易状态
  const getTransactionStatus = (transaction: Transaction) => {
    if (transaction.type === 'buy') {
      const remaining = transaction.remaining ?? transaction.quantity;
      if (remaining === 0) return 'sold';
      if (remaining < transaction.quantity) return 'partial';
      return 'open';
    }
    return '';
  };

  // 获取关联的卖出交易
  const getRelatedSellTransactions = (buyId: string) => {
    return transactions.filter(
      (t) => t.type === 'sell' && t.parent_buy_id === buyId
    );
  };

  // 计算交易盈亏
  const calculateProfit = (buyTransaction: Transaction, sellTransaction: Transaction) => {
    if (!buyTransaction || !sellTransaction) return { profit: 0, profitPercentage: 0 };
    
    const buyValue = buyTransaction.price * sellTransaction.quantity;
    const sellValue = sellTransaction.price * sellTransaction.quantity;
    const profit = sellValue - buyValue - buyTransaction.fee * (sellTransaction.quantity / buyTransaction.quantity) - sellTransaction.fee;
    const profitPercentage = (profit / buyValue) * 100;
    
    return {
      profit,
      profitPercentage,
    };
  };

  // 计算本笔浮盈（买入记录的未卖出部分）
  const calculateFloatingProfit = (buyTransaction: Transaction) => {
    if (!buyTransaction || !stock) return { floatingProfit: 0, floatingProfitPercentage: 0 };
    
    const remainingQuantity = buyTransaction.remaining || 0;
    if (remainingQuantity <= 0) return { floatingProfit: 0, floatingProfitPercentage: 0 };
    
    const buyValue = buyTransaction.price * remainingQuantity;
    const currentValue = stock.current_price * remainingQuantity;
    const buyFeeForRemaining = buyTransaction.fee * (remainingQuantity / buyTransaction.quantity);
    const floatingProfit = currentValue - buyValue - buyFeeForRemaining;
    const floatingProfitPercentage = buyValue > 0 ? (floatingProfit / buyValue) * 100 : 0;
    
    return {
      floatingProfit,
      floatingProfitPercentage,
    };
  };

  // 处理编辑按钮点击
  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditQuantity(transaction.quantity.toString());
    setEditPrice(transaction.price.toString());
    setEditFee(transaction.fee.toString());
    
    if (transaction.type === 'buy' && transaction.buy_reason) {
      setEditReason(transaction.buy_reason.note || '');
      setEditTags(transaction.buy_reason.tags || []);
    } else if (transaction.type === 'sell' && transaction.sell_reason) {
      setEditReason(transaction.sell_reason.note || '');
      setEditTags(transaction.sell_reason.tags || []);
    } else {
      setEditReason('');
      setEditTags([]);
    }
    
    setEditDate(transaction.timestamp ? new Date(transaction.timestamp) : new Date());
    setIsEditDialogOpen(true);
  };

  // 处理编辑保存
  const handleEditSave = async () => {
    if (!editingTransaction || !editDate || !user) return;
    
    const editQty = parseInt(editQuantity);
    const editPriceValue = parseFloat(editPrice);
    const editFeeValue = parseFloat(editFee);
    
    // 验证输入
    if (isNaN(editQty) || editQty <= 0) {
      toast({
        title: '错误',
        description: '请输入有效的数量',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNaN(editPriceValue) || editPriceValue <= 0) {
      toast({
        title: '错误',
        description: '请输入有效的价格',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // 准备更新数据
      const updates: Partial<Transaction> = {
        quantity: editQty,
        price: editPriceValue,
        fee: editFeeValue,
        timestamp: editDate.toISOString(),
      };
      
      // 根据交易类型设置原因
      if (editingTransaction.type === 'buy') {
        updates.buy_reason = {
          tags: editTags,
          note: editReason,
        };
        
        // 如果是买入交易，需要检查剩余数量
        if (editingTransaction.remaining !== undefined) {
          // 如果编辑后的数量小于已卖出数量，则不允许保存
          const soldQuantity = editingTransaction.quantity - (editingTransaction.remaining || 0);
          if (editQty < soldQuantity) {
            toast({
              title: '错误',
              description: '买入数量不能小于已卖出数量',
              variant: 'destructive',
            });
            return;
          }
          
          // 更新剩余数量
          updates.remaining = editQty - soldQuantity;
        } else {
          updates.remaining = editQty;
        }
      } else if (editingTransaction.type === 'sell') {
        updates.sell_reason = {
          tags: editTags,
          note: editReason,
        };
        
        // 如果是卖出交易，需要检查关联的买入交易
        if (editingTransaction.parent_buy_id) {
          const parentBuy = transactions.find(t => t.id === editingTransaction.parent_buy_id);
          if (parentBuy) {
            const currentSellQty = editingTransaction.quantity;
            const parentRemaining = (parentBuy.remaining || 0) + currentSellQty;
            
            // 检查新的卖出数量是否超过可卖出数量
            if (editQty > parentRemaining) {
              toast({
                title: '错误',
                description: '卖出数量不能超过可卖出数量',
                variant: 'destructive',
              });
              return;
            }
          }
        }
      }
      
      // 更新交易记录
      await updateTransaction(editingTransaction.id, updates);
      
      // 重新获取交易记录
      const updatedTransactions = await fetchTransactions(stockId);
      setTransactions(updatedTransactions);
      
      // 关闭对话框并重置表单
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      setEditQuantity('');
      setEditPrice('');
      setEditFee('0');
      setEditReason('');
      setEditTags([]);
      setEditDate(new Date());
      
      toast({
        title: '编辑成功',
        description: '交易记录已更新',
      });
    } catch (error) {
      console.error('更新交易记录失败:', error);
      toast({
        title: '更新失败',
        description: '无法更新交易记录，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  // 切换编辑标签
  const toggleEditTag = (tag: string) => {
    setEditTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  // 处理删除交易
  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!user) return;
    
    // 如果是买入记录，检查是否有关联的卖出记录
    if (transaction.type === 'buy') {
      const relatedSells = getRelatedSellTransactions(transaction.id);
      if (relatedSells.length > 0) {
        toast({
          title: '无法删除',
          description: '该买入记录存在关联的卖出记录，请先删除相关的卖出记录',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // 确认删除
    if (!confirm(`确定要删除这条${transaction.type === 'buy' ? '买入' : '卖出'}记录吗？`)) {
      return;
    }
    
    try {
      await deleteTransaction(transaction.id);
      
      // 重新获取交易记录
      const updatedTransactions = await fetchTransactions(stockId);
      setTransactions(updatedTransactions);
      
      toast({
        title: '删除成功',
        description: '交易记录已删除',
      });
    } catch (error) {
      console.error('删除交易记录失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除交易记录，请稍后再试',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link to="/stocks" className="mr-2">
          <Button variant="outline" size="sm">
            <IconArrowBack size={16} className="mr-1" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{stock.stock_name} ({stock.stock_code})</h1>
        <Badge variant="outline" className="ml-2">
          当前价格: {stock.current_price.toFixed(3)}
        </Badge>
        <div className="ml-auto">
          <Button onClick={() => setIsBuyDialogOpen(true)}>
            <IconPlus size={16} className="mr-1" />
            买入
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>交易记录</CardTitle>
          <CardDescription>
            点击未卖出或部分卖出的记录可进行卖出操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {transactions.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                暂无交易记录
              </div>
            ) : (
              transactions
                .filter(transaction => transaction.type === 'buy')
                .map((buyTransaction) => {
                  const status = getTransactionStatus(buyTransaction);
                  const relatedSells = getRelatedSellTransactions(buyTransaction.id);
                  
                  return (
                    <div key={buyTransaction.id} className="border rounded-lg p-4">
                      {/* 买入记录 */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">买入</span>
                            <span className="mx-2">|</span>
                            <span>{formatDate(buyTransaction.timestamp)}</span>
                            {status && (
                              <Badge variant="secondary" className={`ml-2 ${
                                status === 'sold' 
                                  ? 'text-green-600 bg-green-100' 
                                  : status === 'open'
                                  ? 'text-blue-600 bg-blue-100'
                                  : 'text-orange-500 bg-orange-100'
                              }`}>
                                {status === 'sold' ? '已卖出' : status === 'open' ? '未卖出' : '部分卖出'}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1">
                            <span className="mr-4">数量: {buyTransaction.quantity}</span>
                            <span className="mr-4">价格: {buyTransaction.price.toFixed(3)}</span>
                            {buyTransaction.remaining !== undefined && buyTransaction.remaining > 0 && (
                              <span className="mr-4">剩余: {buyTransaction.remaining}</span>
                            )}
                            <span className="mr-4">手续费: {buyTransaction.fee}</span>
                            {buyTransaction.remaining !== undefined && buyTransaction.remaining > 0 && (() => {
                              const floatingProfit = calculateFloatingProfit(buyTransaction);
                              const isFloatingProfitable = floatingProfit.floatingProfit > 0;
                              return (
                                <span className={`font-medium ${isFloatingProfitable ? 'text-red-600' : 'text-green-600'}`}>
                                  本笔浮盈: {isFloatingProfitable ? '+' : ''}{floatingProfit.floatingProfit.toFixed(2)} ({isFloatingProfitable ? '+' : ''}{floatingProfit.floatingProfitPercentage.toFixed(2)}%)
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(buyTransaction)}
                          >
                            <IconPencil size={16} className="mr-1" />
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTransaction(buyTransaction)}
                          >
                            <IconTrash size={16} className="mr-1" />
                            删除
                          </Button>
                          {buyTransaction.remaining !== undefined && buyTransaction.remaining > 0 && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentBuyTransaction(buyTransaction);
                                setSellQuantity(buyTransaction.remaining?.toString() || '');
                                setSellPrice(stock.current_price.toFixed(3));
                                setIsSellDialogOpen(true);
                              }}
                            >
                              卖出
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* 买入理由 */}
                      {buyTransaction.buy_reason && (
                        <div className="mt-2 text-sm">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {buyTransaction.buy_reason.tags.map((tag) => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                          {buyTransaction.buy_reason.note && (
                            <p className="text-muted-foreground">{buyTransaction.buy_reason.note}</p>
                          )}
                        </div>
                      )}
                      
                      {/* 卖出记录 */}
                      {relatedSells.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-200">
                          <div className="text-sm font-medium text-muted-foreground mb-2">卖出记录</div>
                          {relatedSells.map((sellTransaction) => {
                            const profit = calculateProfit(buyTransaction, sellTransaction);
                            const isProfitable = profit.profit > 0;
                            
                            return (
                              <div key={sellTransaction.id} className="mb-3 last:mb-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center text-sm">
                                      <span className="font-medium">卖出</span>
                                      <span className="mx-2">|</span>
                                      <span>{formatDate(sellTransaction.timestamp)}</span>
                                    </div>
                                    <div className="mt-1 text-sm">
                                      <span className="mr-4">数量: {sellTransaction.quantity}</span>
                                      <span className="mr-4">价格: {sellTransaction.price.toFixed(3)}</span>
                                      <span className="mr-4">手续费: {sellTransaction.fee}</span>
                                      <span className={`font-medium ${isProfitable ? 'text-red-600' : 'text-green-600'}`}>
                                        盈亏: {isProfitable ? '+' : ''}{profit.profit.toFixed(2)} ({isProfitable ? '+' : ''}{profit.profitPercentage.toFixed(2)}%)
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditClick(sellTransaction)}
                                    >
                                      <IconPencil size={16} className="mr-1" />
                                      编辑
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteTransaction(sellTransaction)}
                                    >
                                      <IconTrash size={16} className="mr-1" />
                                      删除
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* 卖出理由 */}
                                {sellTransaction.sell_reason && (
                                  <div className="mt-2 text-sm">
                                    <div className="flex flex-wrap gap-1 mb-1">
                                      {sellTransaction.sell_reason.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                      ))}
                                    </div>
                                    {sellTransaction.sell_reason.note && (
                                      <p className="text-muted-foreground text-xs">{sellTransaction.sell_reason.note}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 卖出对话框 */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>卖出股票</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sell-quantity" className="text-right">
                卖出数量
              </Label>
              <div className="col-span-3">
                <Input
                  id="sell-quantity"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  type="number"
                  min="1"
                  max={currentBuyTransaction?.remaining}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  最大可卖: {currentBuyTransaction?.remaining}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sell-price" className="text-right">
                卖出价格
              </Label>
              <div className="col-span-3">
                <Input
                  id="sell-price"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sell-fee" className="text-right">
                手续费
              </Label>
              <div className="col-span-3">
                <Input
                  id="sell-fee"
                  value={sellFee}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 允许用户手动输入，但必须是有效的数字
                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                      setSellFee(value);
                    }
                  }}
                  type="text"
                  inputMode="decimal"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  自动计算: 费率0.03%, 最低5元
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sell-date" className="text-right">
                交易日期
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={sellDate}
                  setDate={setSellDate}
                  placeholder="选择卖出日期"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">卖出理由标签</Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={sellTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSellTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="sell-reason" className="text-right mt-2">
                卖出备注
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="sell-reason"
                  value={sellReason}
                  onChange={(e) => setSellReason(e.target.value)}
                  placeholder="请输入卖出原因..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSellDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSell}>确认卖出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 买入对话框 */}
      <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>买入股票</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buy-quantity" className="text-right">
                买入数量
              </Label>
              <div className="col-span-3">
                <Input
                  id="buy-quantity"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  type="number"
                  min="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buy-price" className="text-right">
                买入价格
              </Label>
              <div className="col-span-3">
                <Input
                  id="buy-price"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buy-fee" className="text-right">
                手续费
              </Label>
              <div className="col-span-3">
                <Input
                  id="buy-fee"
                  value={buyFee}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 允许用户手动输入，但必须是有效的数字
                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                      setBuyFee(value);
                    }
                  }}
                  type="text"
                  inputMode="decimal"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  自动计算: 费率0.03%, 最低5元
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buy-date" className="text-right">
                交易日期
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={buyDate}
                  setDate={setBuyDate}
                  placeholder="选择买入日期"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">买入理由标签</Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={buyTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleBuyTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="buy-reason" className="text-right mt-2">
                买入备注
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="buy-reason"
                  value={buyReason}
                  onChange={(e) => setBuyReason(e.target.value)}
                  placeholder="请输入买入原因..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleBuy}>确认买入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              编辑{editingTransaction?.type === 'buy' ? '买入' : '卖出'}记录
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">
                数量
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-quantity"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  type="number"
                  min="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                价格
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-price"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fee" className="text-right">
                手续费
              </Label>
              <div className="col-span-3">
                <Input
                  id="edit-fee"
                  value={editFee}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 允许用户手动输入，但必须是有效的数字
                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                      setEditFee(value);
                    }
                  }}
                  type="text"
                  inputMode="decimal"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  自动计算: 费率0.03%, 最低5元
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                交易日期
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={editDate}
                  setDate={setEditDate}
                  placeholder="选择交易日期"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">理由标签</Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={editTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleEditTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-reason" className="text-right mt-2">
                备注
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="edit-reason"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="请输入交易原因..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditSave}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 