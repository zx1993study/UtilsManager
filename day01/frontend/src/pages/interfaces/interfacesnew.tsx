
import React from 'react';
import { Plus, Search, Globe, Code, Play, Edit2, Copy, CheckSquare, Square, Settings2, Trash2 } from 'lucide-react';
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
import { interfaceApi } from '@/services/api';

interface Interface {
  id: string;
  api_name: string;
  method_url: string;
  method_type: string;
  token_id: string;
  request_header: string;
  description: string;
  remark: string;
  testStatus?: string;
}

export default function InterfacesPage() {
  const [viewMode, setViewMode] = React.useState<'list' | 'params'>('list');
  const [selectedInterface, setSelectedInterface] = React.useState<Interface | null>(null);
  const [interfaces, setInterfaces] = React.useState<Interface[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Project state
  const [projects, setProjects] = React.useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('1');

  // Headers state
  const [headers, setHeaders] = React.useState<any[]>([]);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);
  const [editingInterface, setEditingInterface] = React.useState<Interface | null>(null);
  const [copyingInterface, setCopyingInterface] = React.useState<Interface | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = React.useState({
    api_name: '',
    method_url: '',
    method_type: 'GET',
    token_id: '',
    request_header: '',
    description: '',
    remark: ''
  });

  // 获取接口列表
  const fetchInterfaces = async () => {
    try {
      setIsLoading(true);
      const data = await interfaceApi.getInterfaces();
      setInterfaces(data);
    } catch (error) {
      toast.error('获取接口列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInterfaces();
  }, []);

  const handleEdit = (item: Interface) => {
    setEditingInterface(item);
    setFormData({
      api_name: item.api_name,
      method_url: item.method_url,
      method_type: item.method_type,
      token_id: item.token_id,
      request_header: item.request_header,
      description: item.description,
      remark: item.remark
    });
    setIsEditDialogOpen(true);
  };

  const handleCopy = (item: Interface) => {
    setCopyingInterface({
      ...item,
      api_name: `${item.api_name} (副本)`
    });
    setFormData({
      api_name: `${item.api_name} (副本)`,
      method_url: item.method_url,
      method_type: item.method_type,
      token_id: item.token_id,
      request_header: item.request_header,
      description: item.description,
      remark: item.remark
    });
    setIsCopyDialogOpen(true);
  };

  const saveCopy = async () => {
    if (!copyingInterface) return;
    try {
      await interfaceApi.copyInterface(parseInt(copyingInterface.id), formData.api_name);
      toast.success('接口副本已保存');
      setIsCopyDialogOpen(false);
      fetchInterfaces();
    } catch (error: any) {
      toast.error(error.message || '复制接口失败');
    }
  };

  const saveEdit = async () => {
    if (!editingInterface) return;
    try {
      await interfaceApi.updateInterface(parseInt(editingInterface.id), formData);
      toast.success('接口更新成功');
      setIsEditDialogOpen(false);
      fetchInterfaces();
    } catch (error: any) {
      toast.error(error.message || '更新接口失败');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await interfaceApi.createInterface(formData);
      toast.success('接口创建成功');
      setIsEditDialogOpen(false);
      fetchInterfaces();
      setFormData({
        api_name: '',
        method_url: '',
        method_type: 'GET',
        token_id: '',
        request_header: '',
        description: '',
        remark: ''
      });
    } catch (error: any) {
      toast.error(error.message || '创建接口失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await interfaceApi.deleteInterface(parseInt(id));
      toast.success('接口删除成功');
      fetchInterfaces();
    } catch (error: any) {
      toast.error(error.message || '删除接口失败');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === interfaces.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(interfaces.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchRun = async () => {
    if (selectedIds.size === 0) {
      toast.error('请先选择要运行的接口');
      return;
    }
    try {
      const apiIds = Array.from(selectedIds).map(id => parseInt(id));
      await interfaceApi.batchRunInterfaces(apiIds);
      toast.success(`已启动 ${selectedIds.size} 个接口的测试`);
    } catch (error: any) {
      toast.error(error.message || '批量运行失败');
    }
  };

  const openParams = (item: Interface) => {
    setSelectedInterface(item);
    setViewMode('params');
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
                {projects.find(p => p.id === selectedProjectId)?.name || "选择项目"}
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
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger render={<Button className="gap-2" onClick={() => {
              setFormData({
                api_name: '',
                method_url: '',
                method_type: 'GET',
                token_id: '',
                request_header: '',
                description: '',
                remark: ''
              });
              setEditingInterface(null);
            }} />}>
              <Plus className="w-4 h-4" />
              新建接口
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingInterface ? '编辑 API 接口' : '定义 API 接口'}</DialogTitle>
                <DialogDescription>
                  设置用于测试的端点、方法和参数。
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={editingInterface ? (e) => { e.preventDefault(); saveEdit(); } : handleCreate} className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label>名称</Label>
                  <Input 
                    value={formData.api_name}
                    onChange={(e) => setFormData({...formData, api_name: e.target.value})}
                    placeholder="例如：创建订单" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>所属项目</Label>
                  <Select value={selectedProjectId}>
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
                  <Select value={formData.method_type} onValueChange={(value) => setFormData({...formData, method_type: value})}>
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
                    value={formData.method_url}
                    onChange={(e) => setFormData({...formData, method_url: e.target.value})}
                    placeholder="/api/v1/orders" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>关联 Token</Label>
                  <Select value={formData.token_id}>
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
                  <Label>请求头</Label>
                  <Select value={formData.request_header}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择请求头" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>描述</Label>
                  <Input 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="简要描述此 API 的功能" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>备注</Label>
                  <Input 
                    value={formData.remark}
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    placeholder="其他备注信息" 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">{editingInterface ? '保存修改' : '保存接口'}</Button>
                </DialogFooter>
              </form>
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
              <form onSubmit={(e) => { e.preventDefault(); saveCopy(); }} className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label>名称</Label>
                  <Input 
                    value={formData.api_name}
                    onChange={(e) => setFormData({...formData, api_name: e.target.value})}
                    placeholder="例如：创建订单" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>所属项目</Label>
                  <Select value={selectedProjectId}>
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
                  <Select value={formData.method_type} onValueChange={(value) => setFormData({...formData, method_type: value})}>
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
                    value={formData.method_url}
                    onChange={(e) => setFormData({...formData, method_url: e.target.value})}
                    placeholder="/api/v1/orders" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>关联 Token</Label>
                  <Select value={formData.token_id}>
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
                  <Label>请求头</Label>
                  <Select value={formData.request_header}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择请求头" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>描述</Label>
                  <Input 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="简要描述此 API 的功能" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>备注</Label>
                  <Input 
                    value={formData.remark}
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    placeholder="其他备注信息" 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">保存副本</Button>
                </DialogFooter>
              </form>
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
                  checked={selectedIds.size > 0 && selectedIds.size === interfaces.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>名称</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>端点</TableHead>
              <TableHead>Token 名称</TableHead>
              <TableHead>测试结果</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  正在加载接口...
                </TableCell>
              </TableRow>
            ) : interfaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  暂无接口数据
                </TableCell>
              </TableRow>
            ) : (
              interfaces.map((item) => (
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
                      {item.api_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.method_type === 'GET' ? 'secondary' : 'default'}
                      className={item.method_type === 'POST' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                      {item.method_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.method_url}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{item.token_id || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.testStatus === 'success' ? 'secondary' : item.testStatus === 'failed' ? 'outline' : 'outline'}
                      className={
                        item.testStatus === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                        item.testStatus === 'failed' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }
                    >
                      {item.testStatus === 'success' ? '成功' : item.testStatus === 'failed' ? '失败' : '未开始'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => openParams(item)}>
                        <Settings2 className="w-3 h-3" />
                        参数
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-3 h-3" />
                        编辑
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => handleCopy(item)}>
                        <Copy className="w-3 h-3" />
                        复制
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                        删除
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 h-8">
                        <Play className="w-3 h-3 fill-current" />
                        运行
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
}l>
                  <Input 
                    value={formData.remark}
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    placeholder="其他备注信息" 
                  />
                </div>
                <DialogFooter className="col-span-2">
                  <Button type="submit">{editingInterface ? '保存修改' : '保存接口'}</Button>
                </DialogFooter>
              </form>
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
                <form onSubmit={(e) => { e.preventDefault(); saveCopy(); }} className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 space-y-2">
                    <Label>名称</Label>
                    <Input
                      value={formData.api_name}
                      onChange={(e) => setFormData({...formData, api_name: e.target.value})}
                      placeholder="例如：创建订单"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>所属项目</Label>
                    <Select
                      value={formData.token_id || '1'}
                      onValueChange={(val) => setFormData({...formData, token_id: val})}
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
                      value={formData.method_type}
                      onValueChange={(val) => setFormData({...formData, method_type: val})}
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
                      value={formData.method_url}
                      onChange={(e) => setFormData({...formData, method_url: e.target.value})}
                      placeholder="/api/v1/orders"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>关联 Token</Label>
                    <Select
                      value={formData.token_id}
                      onValueChange={(val) => setFormData({...formData, token_id: val})}
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
                    <Label>请求头</Label>
                    <Select
                      value={formData.request_header}
                      onValueChange={(val) => setFormData({...formData, request_header: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择请求头" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map(h => (
                          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>描述</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="简要描述此 API 的功能"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>备注</Label>
                    <Input
                      value={formData.remark}
                      onChange={(e) => setFormData({...formData, remark: e.target.value})}
                      placeholder="其他备注信息"
                    />
                  </div>
                  <DialogFooter className="col-span-2">
                    <Button type="submit">保存副本</Button>
                  </DialogFooter>
                </form>
              )}
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
                  checked={selectedIds.size > 0 && selectedIds.size === interfaces.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>名称</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>端点</TableHead>
              <TableHead>Token 名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  正在加载接口...
                </TableCell>
              </TableRow>
            ) : interfaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  暂无接口信息
                </TableCell>
              </TableRow>
            ) : (
              interfaces.map((item) => (
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
                      {item.api_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.method_type === 'GET' ? 'secondary' : 'default'}
                      className={item.method_type === 'POST' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                      {item.method_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.method_url}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{item.token_id || '-'}</span>
                  </TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => openParams(item)}>
                        <Settings2 className="w-3 h-3" />
                        参数
                      </Button>
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
                      <Button variant="outline" size="sm" className="gap-1 h-8 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                        删除
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
