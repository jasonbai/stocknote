import { z } from 'zod';

// 用户模式
export const userSchema = z.object({
  id: z.string().optional(),
  auth_id: z.string(),
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的电子邮件地址'),
  role: z.enum(['admin', 'user']).default('user'),
  tags: z.array(z.string()).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  avatar: z.string().nullable().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;

// 股票模式
export const stockSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  stock_code: z.string().min(1, '股票代码不能为空'),
  stock_name: z.string().min(1, '股票名称不能为空'),
  current_price: z.number().positive('价格必须是正数'),
  updated_at: z.string().optional(),
});

export type StockSchema = z.infer<typeof stockSchema>;

// 买入理由模式
export const buyReasonSchema = z.object({
  tags: z.array(z.string()).default([]),
  note: z.string().default(''),
});

// 卖出理由模式
export const sellReasonSchema = z.object({
  tags: z.array(z.string()).default([]),
  note: z.string().default(''),
});

// 交易记录模式
export const transactionSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  stock_id: z.string(),
  type: z.enum(['buy', 'sell']),
  quantity: z.number().positive('数量必须是正数'),
  price: z.number().positive('价格必须是正数'),
  fee: z.number().nonnegative('费用必须是非负数'),
  timestamp: z.string().optional(),
  parent_buy_id: z.string().optional(),
  remaining: z.number().nonnegative('剩余数量必须是非负数').optional(),
  batch_id: z.string().optional(),
  buy_reason: buyReasonSchema.optional(),
  sell_reason: sellReasonSchema.optional(),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;

// 登录表单模式
export const loginFormSchema = z.object({
  email: z.string().email('请输入有效的电子邮件地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

// 注册表单模式
export const registerFormSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的电子邮件地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string().min(6, '密码至少需要6个字符'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;

// 股票表单模式
export const stockFormSchema = z.object({
  stock_code: z.string().min(1, '股票代码不能为空'),
  stock_name: z.string().min(1, '股票名称不能为空'),
  current_price: z.number().positive('价格必须是正数').or(z.string().transform(val => parseFloat(val))),
});

export type StockFormSchema = z.infer<typeof stockFormSchema>;

// 买入交易表单模式
export const buyTransactionFormSchema = z.object({
  quantity: z.number().positive('数量必须是正数').or(z.string().transform(val => parseFloat(val))),
  price: z.number().positive('价格必须是正数').or(z.string().transform(val => parseFloat(val))),
  fee: z.number().nonnegative('费用必须是非负数').or(z.string().transform(val => parseFloat(val))),
  timestamp: z.string(),
  buy_reason: z.object({
    tags: z.array(z.string()).default([]),
    note: z.string().default(''),
  }),
});

export type BuyTransactionFormSchema = z.infer<typeof buyTransactionFormSchema>;

// 卖出交易表单模式
export const sellTransactionFormSchema = z.object({
  quantity: z.number().positive('数量必须是正数').or(z.string().transform(val => parseFloat(val))),
  price: z.number().positive('价格必须是正数').or(z.string().transform(val => parseFloat(val))),
  fee: z.number().nonnegative('费用必须是非负数').or(z.string().transform(val => parseFloat(val))),
  timestamp: z.string(),
  parent_buy_id: z.string(),
  sell_reason: z.object({
    tags: z.array(z.string()).default([]),
    note: z.string().default(''),
  }),
});

export type SellTransactionFormSchema = z.infer<typeof sellTransactionFormSchema>; 