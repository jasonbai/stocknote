export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          name: string
          email: string
          role: 'admin' | 'user'
          tags: string[]
          created_at: string
          updated_at: string
          avatar: string | null
        }
        Insert: {
          id?: string
          auth_id: string
          name: string
          email: string
          role?: 'admin' | 'user'
          tags?: string[]
          created_at?: string
          updated_at?: string
          avatar?: string | null
        }
        Update: {
          id?: string
          auth_id?: string
          name?: string
          email?: string
          role?: 'admin' | 'user'
          tags?: string[]
          created_at?: string
          updated_at?: string
          avatar?: string | null
        }
      }
      stocks: {
        Row: {
          id: string
          user_id: string
          stock_code: string
          stock_name: string
          current_price: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stock_code: string
          stock_name: string
          current_price: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stock_code?: string
          stock_name?: string
          current_price?: number
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          stock_id: string
          type: 'buy' | 'sell'
          quantity: number
          price: number
          fee: number
          timestamp: string
          parent_buy_id?: string
          remaining?: number
          batch_id?: string
          buy_reason?: {
            tags: string[]
            note: string
          }
          sell_reason?: {
            tags: string[]
            note: string
          }
        }
        Insert: {
          id?: string
          user_id: string
          stock_id: string
          type: 'buy' | 'sell'
          quantity: number
          price: number
          fee: number
          timestamp?: string
          parent_buy_id?: string
          remaining?: number
          batch_id?: string
          buy_reason?: {
            tags: string[]
            note: string
          }
          sell_reason?: {
            tags: string[]
            note: string
          }
        }
        Update: {
          id?: string
          user_id?: string
          stock_id?: string
          type?: 'buy' | 'sell'
          quantity?: number
          price?: number
          fee?: number
          timestamp?: string
          parent_buy_id?: string
          remaining?: number
          batch_id?: string
          buy_reason?: {
            tags: string[]
            note: string
          }
          sell_reason?: {
            tags: string[]
            note: string
          }
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 标签统计数据接口
export interface TagStats {
  tag: string;
  count: number;
  avgHoldingDays: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  winTrades: number;
} 