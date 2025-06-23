import { HTMLAttributes, useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/components/ui/use-toast'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: '请输入您的邮箱' })
    .email({ message: '邮箱格式不正确' }),
  password: z
    .string()
    .min(1, {
      message: '请输入您的密码',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login, error, user, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loginAttempted, setLoginAttempted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 使用useEffect监听登录状态变化
  useEffect(() => {
    console.log('🔐 状态变化:', { loginAttempted, error, user: !!user });
    if (loginAttempted) {
      if (error) {
        console.log('🔐 检测到错误，显示错误信息:', error);
        
        // 针对不同错误类型提供更好的用户体验
        let title = "登录失败";
        let description = error;
        let duration = 5000;
        
        if (error.includes('Email not confirmed') || error.includes('邮箱未验证') || error.includes('email_not_confirmed')) {
          title = "邮箱未验证";
          description = "请先查收邮件并点击验证链接验证您的邮箱，然后再尝试登录。如果没有收到邮件，请检查垃圾邮件文件夹。";
          duration = 8000;
        } else if (error.includes('Invalid login credentials') || error.includes('邮箱或密码错误')) {
          title = "登录失败";
          description = "邮箱或密码错误，请检查后重试。如果您刚注册，请确保已验证邮箱。";
          duration = 6000;
        }
        
        toast({
          title,
          description,
          variant: "destructive",
          duration,
        });
        setLoginAttempted(false);
        setIsLoading(false); // 确保重置加载状态
      } else if (user) {
        console.log('🔐 检测到用户登录成功，准备跳转');
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        });
        setLoginAttempted(false); // 重置登录尝试状态
        navigate({ to: '/dashboard' });
      } else {
        console.log('🔐 登录尝试完成，但既没有错误也没有用户');
      }
    }
  }, [error, user, loginAttempted, toast, navigate]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log('🔐 开始登录流程:', data.email);
    
    // 清除之前的错误状态
    clearError();
    setIsLoading(true);
    
    try {
      console.log('🔐 调用 login 函数');
      await login(data.email, data.password);
      console.log('🔐 login 函数完成，设置 loginAttempted');
      setLoginAttempted(true);
    } catch (err) {
      console.error('🔐 登录过程出错:', err);
      toast({
        title: "登录失败",
        description: "登录过程中出现错误",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                忘记密码?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? "登录中..." : "登录"}
        </Button>
      </form>
    </Form>
  )
}
