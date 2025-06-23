import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并CSS类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 检查用户是否有特定标签
 * @param userTags 用户标签数组
 * @param tag 要检查的标签
 * @returns 用户是否有该标签
 */
export const hasUserTag = (userTags: string[], tag: string): boolean => {
  return userTags.includes(tag);
};

/**
 * 检查用户是否可以添加更多股票
 * @param role 用户角色
 * @param tags 用户标签
 * @param currentCount 当前股票数量
 * @returns 是否可以添加更多股票
 */
export function canAddMoreStocks(
  role: string,
  tags: string[],
  currentCount: number
): boolean {
  // 管理员或有"星球"标签的用户无限制
  if (role === 'admin' || tags.includes('星球')) {
    return true;
  }
  
  // 普通用户最多5条
  return currentCount < 5;
}

/**
 * 获取用户的股票限制数量
 * @param role 用户角色
 * @param tags 用户标签
 * @returns 限制数量，-1表示无限制
 */
export function getStockLimit(role: string, tags: string[]): number {
  // 管理员或有"星球"标签的用户无限制
  if (role === 'admin' || tags.includes('星球')) {
    return -1;
  }
  
  // 普通用户最多5条
  return 5;
}

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化金额
 * @param amount 金额
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: any): string {
  const numAmount = Number(amount) || 0;
  return numAmount.toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

/**
 * 格式化百分比
 * @param percentage 百分比
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(percentage: any): string {
  const numPercentage = Number(percentage) || 0;
  return `${numPercentage.toFixed(3)}%`;
}

/**
 * 格式化价格（截断而不是四舍五入）
 * @param price 价格
 * @param decimals 小数位数，默认3位
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number, decimals: number = 3): string {
  const factor = Math.pow(10, decimals);
  const truncated = Math.floor(price * factor) / factor;
  return truncated.toFixed(decimals);
}
