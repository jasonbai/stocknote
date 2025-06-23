import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { User } from '@/lib/mock-data';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { IconEdit, IconTrash, IconPlus, IconLoader2 } from '@tabler/icons-react';
import { format } from 'date-fns';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { fetchUsers, createUser, updateUser, deleteUser } from '@/lib/api';

export const Route = createFileRoute('/_authenticated/admin/users/')({
  component: UsersPage,
});

function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 新用户表单状态
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [newUserTags, setNewUserTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // 编辑用户表单状态
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'user'>('user');
  const [editUserTags, setEditUserTags] = useState<string[]>([]);
  const [editTag, setEditTag] = useState('');
  
  // 加载用户数据
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error('获取用户失败:', error);
        toast({
          title: '获取用户失败',
          description: '无法加载用户数据，请稍后再试',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, [toast]);

  // 如果不是管理员，显示无权限页面
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">无权访问</h1>
            <p className="text-muted-foreground">只有管理员可以访问用户管理页面</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 过滤用户
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  // 常用标签预设
  const commonTags = ['VIP', '新用户', '星球', '体验用户', '测试'];

  // 创建新用户
  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail) {
      toast({
        title: '错误',
        description: '请填写用户名和邮箱',
        variant: 'destructive',
      });
      return;
    }
    
    // 检查邮箱是否已存在
    if (users.some((user) => user.email === newUserEmail)) {
      toast({
        title: '错误',
        description: '该邮箱已被使用',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 创建一个临时的auth_id（实际应该由Supabase Auth生成）
      // 注意：在实际应用中，通常通过Supabase Auth注册用户，然后在用户表创建记录
      const newUser = await createUser({
        auth_id: `auth-${Date.now()}`, // 临时ID，实际应由Supabase Auth生成
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        tags: newUserTags,
        avatar: '',
      });
      
      setUsers([...users, newUser]);
      setIsCreateDialogOpen(false);
      resetCreateForm();
      
      toast({
        title: '创建成功',
        description: `已创建用户 ${newUserName}`,
      });
    } catch (error) {
      console.error('创建用户失败:', error);
      toast({
        title: '创建失败',
        description: '无法创建用户，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 编辑用户
  const handleEditUser = async () => {
    if (!selectedUser || !editUserName || !editUserEmail) {
      toast({
        title: '错误',
        description: '请填写用户名和邮箱',
        variant: 'destructive',
      });
      return;
    }
    
    // 检查邮箱是否已被其他用户使用
    if (users.some((user) => user.email === editUserEmail && user.id !== selectedUser.id)) {
      toast({
        title: '错误',
        description: '该邮箱已被其他用户使用',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const updatedUser = await updateUser(selectedUser.id, {
        name: editUserName,
        email: editUserEmail,
        role: editUserRole,
        tags: editUserTags,
      });
      
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? updatedUser : user
        )
      );
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: '更新成功',
        description: `已更新用户 ${editUserName}`,
      });
    } catch (error) {
      console.error('更新用户失败:', error);
      toast({
        title: '更新失败',
        description: '无法更新用户，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除用户
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      
      await deleteUser(selectedUser.id);
      
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: '删除成功',
        description: `已删除用户 ${selectedUser.name}`,
      });
    } catch (error) {
      console.error('删除用户失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除用户，请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新标签到新用户表单
  const handleAddNewTag = () => {
    if (newTag && !newUserTags.includes(newTag)) {
      setNewUserTags([...newUserTags, newTag]);
      setNewTag('');
    }
  };

  // 从新用户表单中移除标签
  const handleRemoveNewTag = (tag: string) => {
    setNewUserTags(newUserTags.filter((t) => t !== tag));
  };

  // 添加标签到编辑用户表单
  const handleAddEditTag = () => {
    if (editTag && !editUserTags.includes(editTag)) {
      setEditUserTags([...editUserTags, editTag]);
      setEditTag('');
    }
  };

  // 从编辑用户表单中移除标签
  const handleRemoveEditTag = (tag: string) => {
    setEditUserTags(editUserTags.filter((t) => t !== tag));
  };

  // 重置创建表单
  const resetCreateForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('user');
    setNewUserTags([]);
    setNewTag('');
  };

  // 打开编辑对话框
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserTags(user.tags || []);
    setIsEditDialogOpen(true);
  };

  // 打开删除对话框
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  // 判断是否是特殊标签
  const isSpecialTag = (tag: string) => {
    return tag === '星球';
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
          <CardDescription>
            管理系统用户账号，设置角色和权限
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 特殊标签说明区域 */}
          <div className="bg-muted p-4 rounded-md mb-6">
            <h3 className="font-semibold mb-2">特殊标签说明：</h3>
            <ul className="list-disc list-inside text-sm">
              <li>
                <Badge variant="outline" className="mr-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  星球 ⭐
                </Badge>
                标记为"星球"的用户不限制股票记录条数（普通用户最多5条）
              </li>
            </ul>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="搜索用户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              创建用户
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>标签</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        {searchTerm ? '没有找到匹配的用户' : '暂无用户数据'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                            {user.role === 'admin' ? '管理员' : '用户'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.tags && user.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline"
                                className={isSpecialTag(tag) ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
                              >
                                {tag} {isSpecialTag(tag) && "⭐"}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(user.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(user)}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteDialog(user)}
                              disabled={user.id === currentUser?.id} // 不能删除自己
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建用户对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="请输入用户姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="请输入用户邮箱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select value={newUserRole} onValueChange={(value: 'admin' | 'user') => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {newUserTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveNewTag(tag)}
                      className="text-xs rounded-full hover:bg-muted-foreground/10"
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加标签"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                />
                <Button type="button" variant="secondary" onClick={handleAddNewTag}>
                  添加
                </Button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">常用标签:</p>
                <div className="flex flex-wrap gap-1">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${isSpecialTag(tag) ? "bg-yellow-100 text-yellow-800" : ""}`}
                      onClick={() => {
                        if (!newUserTags.includes(tag)) {
                          setNewUserTags([...newUserTags, tag]);
                        }
                      }}
                    >
                      {tag} {isSpecialTag(tag) && "⭐"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetCreateForm();
              }}
            >
              取消
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                placeholder="请输入用户姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserEmail}
                onChange={(e) => setEditUserEmail(e.target.value)}
                placeholder="请输入用户邮箱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">角色</Label>
              <Select value={editUserRole} onValueChange={(value: 'admin' | 'user') => setEditUserRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {editUserTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveEditTag(tag)}
                      className="text-xs rounded-full hover:bg-muted-foreground/10"
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  placeholder="添加标签"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEditTag())}
                />
                <Button type="button" variant="secondary" onClick={handleAddEditTag}>
                  添加
                </Button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">常用标签:</p>
                <div className="flex flex-wrap gap-1">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${isSpecialTag(tag) ? "bg-yellow-100 text-yellow-800" : ""}`}
                      onClick={() => {
                        if (!editUserTags.includes(tag)) {
                          setEditUserTags([...editUserTags, tag]);
                        }
                      }}
                    >
                      {tag} {isSpecialTag(tag) && "⭐"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleEditUser} disabled={isLoading}>
              {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除用户确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除用户 "{selectedUser?.name}" 吗？此操作不可撤销，用户的所有数据将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isLoading}>
              {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 