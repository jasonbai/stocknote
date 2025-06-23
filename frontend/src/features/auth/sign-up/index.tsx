import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export default function SignUp() {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardDescription>
            本站为星球：尾灯的量化视界 附加服务 <br />
            非星球用户部分功能受限，请先加入星球
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">📧 注册流程说明</p>
            <p>注册后我们会向您的邮箱发送验证链接，请查收邮件并点击验证链接完成账号激活，然后返回登录。</p>
          </div>
          <SignUpForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
