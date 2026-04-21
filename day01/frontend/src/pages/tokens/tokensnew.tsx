
import React from 'react';
import { Plus, Search, Key, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { tokenApi } from '@/services/api';

interface Token {
  id: string;
  token_name: string;
  token_value: string;
  token_env: string;
  description: string;
  status: string;
}

export default function TokensPage() {
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingToken, setEditingToken] = React.useState<Token | null>(null);
  const [copiedTokenId, setCopiedTokenId] = React.useState<string | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    token_name: '',
    token_value: '',
    token_env: 'dev',
    description: ''
  });

  // 获取Token列表
  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      const data = await tokenApi.getTokens();
      setTokens(data);
    } catch (error) {
      toast.error('获取Token列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTokens();
  }, []);

  const handleOpenDialog = (token?: Token) => {
    if (token) {
      setEditingToken(token);
      setFormData({
        token_name: token.token_name,
        token_value: token.token_value,
        token_env: token.token_env,
        description: token.description
      });
    } else {
      setEditingToken(null);
      setFormData({ token_name: '', token_value: '', token_env: 'dev', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.token_name || !formData.token_value) {
      toast.error('请填写完整Token信息');
      return;
    }

    try {
      if (editingToken) {
        await tokenApi.updateToken(parseInt(editingToken.id), formData);
        toast.success('Token更新成功');
      } else {
        await tokenApi.createToken(formData);
        toast.success('Token添加成功');
      }
      setIsDialogOpen(false);
      fetchTokens();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tokenApi.deleteToken(parseInt(id));
      toast.success('Token已删除');
      fetchTokens();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  const handleCopyToken = async (token: Token) => {
    try {
      await navigator.clipboard.writeText(token.token_value);
      setCopiedTokenId(token.id);
      toast.success('Token已复制到剪贴板');
      setTimeout(() => setCopiedTokenId(null), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await tokenApi.toggleTokenStatus(parseInt(id));
      toast.success('Token状态已更新');
      fetchTokens();
    } catch (error: any) {
      toast.error(error.message || '更新状态失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索Token..." className="pl-10" />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={() => handleOpenDialog()} />}>
            <Plus className="w-4 h-4" />
            添加Token
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingToken ? '编辑Token' : '添加Token'}</DialogTitle>
              <DialogDescription>
                配置API访问Token，用于接口认证。
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="token_name">Token名称</Label>
                <Input
                  id="token_name"
                  value={formData.token_name}
                  onChange={(e) => setFormData({ ...formData, token_name: e.target.value })}
                  placeholder="例如：开发环境Token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token_value">Token值</Label>
                <Input
                  id="token_value"
                  value={formData.token_value}
                  onChange={(e) => setFormData({ ...formData, token_value: e.target.value })}
                  placeholder="例如：Bearer eyJhbGc..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token_env">环境</Label>
                <Select value={formData.token_env} onValueChange={(value) => setFormData({ ...formData, token_env: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择环境" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">开发环境</SelectItem>
                    <SelectItem value="test">测试环境</SelectItem>
                    <SelectItem value="prod">生产环境</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如：用于开发环境API访问"
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingToken ? '保存修改' : '立即添加'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token名称</TableHead>
              <TableHead>Token值</TableHead>
              <TableHead>环境</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  正在加载Token...
                </TableCell>
              </TableRow>
            ) : tokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无Token信息
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" />
                      {token.token_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">
                        {token.token_value.substring(0, 20)}{token.token_value.length > 20 ? '...' : ''}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleCopyToken(token)}
                      >
                        {copiedTokenId === token.id ? 
                          <Check className="w-3 h-3 text-green-600" /> : 
                          <Copy className="w-3 h-3" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      token.token_env === 'dev' ? 'bg-blue-50 text-blue-600' :
                      token.token_env === 'test' ? 'bg-green-50 text-green-600' :
                      'bg-purple-50 text-purple-600'
                    }>
                      {token.token_env === 'dev' ? '开发环境' :
                       token.token_env === 'test' ? '测试环境' :
                       '生产环境'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={token.status === 'active' ? 'default' : 'secondary'}
                      className={token.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                      onClick={() => handleToggleStatus(token.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {token.status === 'active' ? '活跃' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {token.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(token)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(token.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
