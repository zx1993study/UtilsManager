import React from 'react';
import { Plus, Search, Globe, Code, Play, Edit2, Copy, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function InterfacesPage() {
  const [interfaces, setInterfaces] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Project state
  const [projects, setProjects] = React.useState<any[]>([
    { id: '1', name: '电商平台项目' },
    { id: '2', name: '用户中心系统' }
  ]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('1');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);
  const [editingInterface, setEditingInterface] = React.useState<any>(null);
  const [copyingInterface, setCopyingInterface] = React.useState<any>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  const fetchInterfaces = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/interfaces', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setInterfaces(data);
      }
    } catch (error) {
      toast.error('获取接口列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInterfaces();
  }, []);

  const mockInterfaces = [
    { 
      id: 1, 
      name: '获取用户资料', 
      url: '/v1/users/me', 
      method: 'GET', 
      paramType: 'Query', 
      params: 'id=123', 
      tokenName: '开发环境 Token', 
      expectedResult: '{"code": 200, "data": {"name": "Admin"}}',
      actualResult: '{"code": 200, "data": {"name": "Admin"}}',
      description: '获取当前登录用户详情' 
    },
    { 
      id: 2, 
      name: '更新库存', 
      url: '/v1/stock/update', 
      method: 'POST', 
      paramType: 'JSON', 
      params: '{"sku": "ABC", "qty": 10}', 
      tokenName: '测试环境 Token', 
      expectedResult: '{"status": "updated"}',
      actualResult: '{"status": "updated"}',
      description: '批量更新库存水平' 
    },
    { 
      id: 3, 
      name: '处理支付', 
      url: '/v1/checkout/pay', 
      method: 'POST', 
      paramType: 'JSON', 
      params: '{"amount": 99.9, "currency": "USD"}', 
      tokenName: '开发环境 Token', 
      expectedResult: '{"success": true}',
      actualResult: '{"success": true}',
      description: '执行 Stripe 支付' 
    },
  ];

  const handleEdit = (item: any) => {
    setEditingInterface(item);
    setIsEditDialogOpen(true);
  };

  const handleCopy = (item: any) => {
    setCopyingInterface({
      ...item,
      name: `${item.name} (副本)`
    });
    setIsCopyDialogOpen(true);
  };

  const saveCopy = () => {
    if (!copyingInterface) return;
    const newItem = {
      ...copyingInterface,
      id: Date.now()
    };
    setInterfaces(prev => [newItem, ...prev]);
    setIsCopyDialogOpen(false);
    toast.success('接口副本已保存');
  };

  const toggleSelectAll = () => {
    const currentList = interfaces.length > 0 ? interfaces : mockInterfaces;
    if (selectedIds.size === currentList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentList.map(i => i.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchRun = () => {
    if (selectedIds.size === 0) {
      toast.error('请先选择要运行的接口');
      return;
    }
    toast.info(`正在批量运行 ${selectedIds.size} 个接口...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索接口..." className="pl-10" />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">项目</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[180px]">
                {selectedProjectId || "选择项目"}
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleBatchRun}>
              <Play className="w-4 h-4 fill-current" />
              批量运行 ({selectedIds.size})
            </Button>
          )}
          <Dialog>
            <DialogTrigger render={<Button className="gap-2" />}>
              <Plus className="w-4 h-4" />
              新建接口
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>定义 API 接口</DialogTitle>
                <DialogDescription>
                  设置用于测试的端点、方法和参数。
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label>名称</Label>
                  <Input placeholder="例如：创建订单" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>所属项目</Label>
                  <Select defaultValue={selectedProjectId}>
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
                <div className="space-y-2">
                  <Label>方法</Label>
                  <Select defaultValue="GET">
                    <SelectTrigger>
                      <SelectValue placeholder="选择方法" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="/api/v1/orders" />
                </div>
                <div className="space-y-2">
                  <Label>关联 Token</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择 Token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      <SelectItem value="dev">开发环境 Token</SelectItem>
                      <SelectItem value="test">测试环境 Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>参数类型</Label>
                  <Select defaultValue="None">
                    <SelectTrigger>
                      <SelectValue placeholder="选择参数类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Query">Query</SelectItem>
                      <SelectItem value="JSON">JSON</SelectItem>
                      <SelectItem value="Form Data">Form Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>参数内容</Label>
                  <Input placeholder='例如：{"id": 123} 或 key=value' />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>预期结果</Label>
                  <Input placeholder='例如：{"code": 200}' />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>描述</Label>
                  <Input placeholder="简要描述此 API 的功能" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => toast.info('演示版暂不支持此功能')}>保存接口</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>复制并编辑接口</DialogTitle>
                <DialogDescription>
                  您可以修改副本的配置后保存。
                </DialogDescription>
              </DialogHeader>
              {copyingInterface && (
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 space-y-2">
                    <Label>名称</Label>
                    <Input 
                      value={copyingInterface.name} 
                      onChange={(e) => setCopyingInterface({...copyingInterface, name: e.target.value})}
                      placeholder="例如：创建订单" 
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>所属项目</Label>
                    <Select 
                      value={copyingInterface.projectId || '1'}
                      onValueChange={(val) => setCopyingInterface({...copyingInterface, projectId: val})}
                    >
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
                  <div className="space-y-2">
                    <Label>方法</Label>
                    <Select 
                      value={copyingInterface.method}
                      onValueChange={(val) => setCopyingInterface({...copyingInterface, method: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择方法" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input 
                      value={copyingInterface.url} 
                      onChange={(e) => setCopyingInterface({...copyingInterface, url: e.target.value})}
                      placeholder="/api/v1/orders" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>关联 Token</Label>
                    <Select 
                      value={copyingInterface.tokenName === '开发环境 Token' ? 'dev' : copyingInterface.tokenName === '测试环境 Token' ? 'test' : 'none'}
                      onValueChange={(val) => setCopyingInterface({...copyingInterface, tokenName: val === 'dev' ? '开发环境 Token' : val === 'test' ? '测试环境 Token' : ''})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择 Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        <SelectItem value="dev">开发环境 Token</SelectItem>
                        <SelectItem value="test">测试环境 Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>参数类型</Label>
                    <Select 
                      value={copyingInterface.paramType || 'None'}
                      onValueChange={(val) => setCopyingInterface({...copyingInterface, paramType: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择参数类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Query">Query</SelectItem>
                        <SelectItem value="JSON">JSON</SelectItem>
                        <SelectItem value="Form Data">Form Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>参数内容</Label>
                    <Input 
                      value={copyingInterface.params} 
                      onChange={(e) => setCopyingInterface({...copyingInterface, params: e.target.value})}
                      placeholder='例如：{"id": 123} 或 key=value' 
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>预期结果</Label>
                    <Input 
                      value={copyingInterface.expectedResult} 
                      onChange={(e) => setCopyingInterface({...copyingInterface, expectedResult: e.target.value})}
                      placeholder='例如：{"code": 200}' 
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>描述</Label>
                    <Input 
                      value={copyingInterface.description} 
                      onChange={(e) => setCopyingInterface({...copyingInterface, description: e.target.value})}
                      placeholder="简要描述此 API 的功能" 
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={saveCopy}>保存副本</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>编辑 API 接口</DialogTitle>
                <DialogDescription>
                  修改接口的端点、方法和参数。
                </DialogDescription>
              </DialogHeader>
              {editingInterface && (
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 space-y-2">
                    <Label>名称</Label>
                    <Input defaultValue={editingInterface.name} placeholder="例如：创建订单" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>所属项目</Label>
                    <Select defaultValue={editingInterface.projectId || '1'}>
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
                  <div className="space-y-2">
                    <Label>方法</Label>
                    <Select defaultValue={editingInterface.method}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择方法" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input defaultValue={editingInterface.url} placeholder="/api/v1/orders" />
                  </div>
                  <div className="space-y-2">
                    <Label>关联 Token</Label>
                    <Select defaultValue={editingInterface.tokenName === '开发环境 Token' ? 'dev' : editingInterface.tokenName === '测试环境 Token' ? 'test' : 'none'}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择 Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        <SelectItem value="dev">开发环境 Token</SelectItem>
                        <SelectItem value="test">测试环境 Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>参数类型</Label>
                    <Select defaultValue={editingInterface.paramType || 'None'}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择参数类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Query">Query</SelectItem>
                        <SelectItem value="JSON">JSON</SelectItem>
                        <SelectItem value="Form Data">Form Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>参数内容</Label>
                    <Input defaultValue={editingInterface.params} placeholder='例如：{"id": 123} 或 key=value' />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>预期结果</Label>
                    <Input defaultValue={editingInterface.expectedResult} placeholder='例如：{"code": 200}' />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>描述</Label>
                    <Input defaultValue={editingInterface.description} placeholder="简要描述此 API 的功能" />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => {
                  toast.info('演示版暂不支持保存修改');
                  setIsEditDialogOpen(false);
                }}>保存修改</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedIds.size > 0 && selectedIds.size === (interfaces.length > 0 ? interfaces : mockInterfaces).length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>名称</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>端点</TableHead>
              <TableHead>Token 名称</TableHead>
              <TableHead>参数类型</TableHead>
              <TableHead>参数</TableHead>
              <TableHead>预期结果</TableHead>
              <TableHead>实际结果</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(interfaces.length > 0 ? interfaces : mockInterfaces).map((item) => (
              <TableRow key={item.id} className={selectedIds.has(item.id) ? 'bg-muted/50' : ''}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-muted-foreground" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.method === 'GET' ? 'secondary' : 'default'}
                    className={item.method === 'POST' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                  >
                    {item.method}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.url}</TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{item.tokenName || '-'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{item.paramType || 'None'}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[150px]" title={item.params}>
                  {item.params || '-'}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={item.expectedResult}>
                  {item.expectedResult || '-'}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={item.actualResult}>
                  <span className={item.actualResult === item.expectedResult ? 'text-green-500' : 'text-red-500'}>
                    {item.actualResult || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{item.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-3 h-3" />
                      编辑
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => handleCopy(item)}>
                      <Copy className="w-3 h-3" />
                      复制
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 h-8">
                      <Play className="w-3 h-3 fill-current" />
                      运行
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
