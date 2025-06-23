import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          {/* <CardTitle className='text-lg tracking-tight'>股票交易记录管理平台</CardTitle> */}
          <CardDescription>
           本站为星球：尾灯的量化视界 附加服务
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">💡 新用户提示</p>
            <p>如果您刚完成注册，请先查收邮件并点击验证链接激活账号，然后再尝试登录。</p>
          </div>
          <UserAuthForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
