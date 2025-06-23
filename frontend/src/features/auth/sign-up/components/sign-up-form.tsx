import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
import { useToast } from '@/components/ui/use-toast'
import { signUp } from '@/lib/auth'

type SignUpFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: '请输入您的姓名' })
      .min(2, { message: '姓名至少需要2个字符' }),
    email: z
      .string()
      .min(1, { message: '请输入您的邮箱' })
      .email({ message: '邮箱格式不正确' }),
    password: z
      .string()
      .min(1, {
        message: '请输入您的密码',
      })
      .min(7, {
        message: '密码长度至少为7个字符',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ['confirmPassword'],
  })

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      // 使用Supabase进行注册
      const { profileError } = await signUp(data.email, data.password, data.name);
      
      // 注册成功，指引用户查收邮箱验证
      toast({
        title: "注册成功！",
        description: "我们已向您的邮箱发送了验证链接，请查收邮件并点击验证链接，然后返回登录。",
        duration: 8000, // 延长显示时间，让用户有足够时间阅读
      });
      
      // 如果 profile 创建失败，额外提示
      if (profileError) {
        setTimeout(() => {
          let errorMessage = "账号已创建，但用户资料未能完全保存。验证邮箱后登录，您可以在个人中心补充完整资料。";
          
          // 根据错误类型提供更具体的提示
          const errorString = profileError instanceof Error ? profileError.message : String(profileError);
          if (errorString.includes('超时')) {
            errorMessage = "账号已创建，但用户资料保存超时。这不影响您的账号使用，验证邮箱后即可正常登录。";
          } else if (errorString.includes('row-level security')) {
            errorMessage = "账号已创建，但用户资料需要登录后补充。请先验证邮箱并登录，然后在个人中心完善资料。";
          }
          
          toast({
            title: "提醒",
            description: errorMessage,
            variant: "default",
            duration: 6000,
          });
        }, 1000); // 延迟1秒显示，避免与主提示重叠
      }
      
      // 立即跳转到登录页面，不等待 profile 创建结果
      navigate({ to: '/sign-in' });
    } catch (error: any) {
      console.error('注册失败:', error);
      
      // 处理不同类型的错误
      if (error.message.includes('User already registered')) {
        toast({
          title: "注册失败",
          description: "该邮箱已被注册，请尝试使用其他邮箱或直接登录。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "注册失败",
          description: error.message || "创建账号时出现错误，请稍后再试。",
          variant: "destructive",
        });
      }
    } finally {
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>姓名</FormLabel>
              <FormControl>
                <Input placeholder='请输入您的姓名' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? "注册中..." : "创建账号"}
        </Button>
      </form>
    </Form>
  )
}
