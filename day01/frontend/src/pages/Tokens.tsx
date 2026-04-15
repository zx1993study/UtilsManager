import React from 'react';
import { Plus, Search, Key, Play, Copy, Folder } from 'lucide-react';
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

export default function TokenPage() {
  const [tokens, setTokens] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Project state (mocked for now, should ideally come from a shared service or API)
  const [projects] = React.useState<any[]>([
    { id: '1', name: '电商平台项目' },
    { id: '2', name: '用户中心系统' }
  ]);

  const fetchTokens = async () => {
    const authToken = localStorage.getItem('auth_token');
    try {
      // 假设后端有对应的接口，如果没有则使用 Mock 数据
      const res = await fetch('/api/tokens', {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data);
      }
    } catch (error) {
      // 静默失败，使用 Mock
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTokens();
  }, []);

  const mockTokens = [
    { 
      id: 1, 
      name: '开发环境 Token', 
      type: 'Bearer', 
      url: 'https://api-dev.example.com/oauth/token',
      paramType: 'JSON',
      params: '{"grant_type": "client_credentials"}',
      expiry: '2024-12-31', 
      description: '用于开发环境接口调试' 
    },
    { 
      id: 2, 
      name: '测试环境 Token', 
      type: 'JWT', 
      url: 'https://api-test.example.com/auth/login',
      paramType: 'Form Data',
      params: 'username=test&password=***',
      expiry: '2024-06-30', 
      description: 'QA 自动化测试专用' 
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Token 已复制到剪贴板');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索 Token 名称..." className="pl-10" />
        </div>
        
        <Dialog>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="w-4 h-4" />
            获取新 Token
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>获取访问 Token</DialogTitle>
              <DialogDescription>
                配置参数以生成用于接口测试的访问令牌。
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>名称</Label>
                <Input placeholder="例如：临时调试 Token" />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <Select defaultValue="Bearer">
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bearer">Bearer</SelectItem>
                    <SelectItem value="JWT">JWT</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="OAuth2">OAuth2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>所属项目</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>请求 URL</Label>
                <Input placeholder="https://api.example.com/oauth/token" />
              </div>
              <div className="space-y-2">
                <Label>参数类型</Label>
                <Select defaultValue="JSON">
                  <SelectTrigger>
                    <SelectValue placeholder="选择参数类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="Form Data">Form Data</SelectItem>
                    <SelectItem value="Query">Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>有效期 (天)</Label>
                <Input type="number" placeholder="7" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>请求参数</Label>
                <Input placeholder='例如：{"client_id": "...", "client_secret": "..."}' />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>描述</Label>
                <Input placeholder="简要描述此 Token 的用途" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => toast.info('演示版暂不支持在线生成')}>立即生成</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>请求 URL</TableHead>
              <TableHead>参数类型</TableHead>
              <TableHead>请求参数</TableHead>
              <TableHead>有效期至</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tokens.length > 0 ? tokens : mockTokens).map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[150px]" title={item.url}>
                  {item.url}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{item.paramType}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[150px]" title={item.params}>
                  {item.params}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{item.expiry}</TableCell>
                <TableCell className="text-sm">{item.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => handleCopy('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')}>
                      <Copy className="w-3 h-3" />
                      复制
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 h-8">
                      <Play className="w-3 h-3 fill-current" />
                      刷新
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
