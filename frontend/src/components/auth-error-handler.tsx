import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';

export function AuthErrorHandler() {
  const { error, clearError } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      // 显示错误提示
      toast({
        title: "认证错误",
        description: error,
        variant: "destructive",
        duration: 5000,
      });

      // 5秒后自动清除错误状态
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError, toast]);

  return null; // 这是一个无UI组件
} 