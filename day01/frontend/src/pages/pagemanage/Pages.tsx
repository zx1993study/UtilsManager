import React, { useEffect } from 'react';
import { Plus, Search, Layout as LayoutIcon, Play, Edit2, Copy, Trash2, CheckSquare, Square, Trash, List } from 'lucide-react';
import PageFlows from './PageFlows';
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
import { pageApi } from '@/services/pageapi';

interface TestStep {
  id: string;
  locationType: string;
  operationType: string;
  content: string;
}

interface PageTest {
  id: string;
  name: string;
  url: string;
  function: string;
  steps: string;
  structuredSteps: TestStep[];
  expectedResult: string;
  actualResult: string;
  testStatus: 'pending' | 'success' | 'failed';
  token: string;
}

export default function PagesPage() {
  const [viewMode, setViewMode] = React.useState<'list' | 'flows'>('list');
  const [selectedPage, setSelectedPage] = React.useState<any>(null);
  const [pages, setPages] = React.useState<PageTest[]>([
    {
      id: '1',
      name: '登录页面',
      url: 'https://example.com/login',
      function: '用户身份验证与准入',
      steps: '1. 输入用户名\n2. 输入密码\n3. 点击登录',
      structuredSteps: [
        { id: 's1', locationType: 'id', operationType: 'input', content: 'username' },
        { id: 's2', locationType: 'id', operationType: 'input', content: 'password' },
        { id: 's3', locationType: 'css', operationType: 'click', content: '.login-btn' }
      ],
      expectedResult: '跳转至首页并显示欢迎信息',
      actualResult: '跳转至首页并显示欢迎信息',
      testStatus: 'success',
      token: 'token1'
    },
    {
      id: '2',
      name: '商品详情页',
      url: 'https://example.com/product/123',
      function: '展示商品详细信息及规格选择',
      steps: '1. 点击商品列表项\n2. 查看图片轮播\n3. 选择规格',
      structuredSteps: [
        { id: 's4', locationType: 'xpath', operationType: 'click', content: '//div[@class="product"]' }
      ],
      expectedResult: '正确显示商品价格、库存及描述',
      actualResult: '价格显示偶发性延迟',
      testStatus: 'failed',
      token: 'token2'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);
  
  const [currentPage, setCurrentPage] = React.useState<PageTest | null>(null);
  const [formData, setFormData] = React.useState<Partial<PageTest>>({
    name: '',
    url: '',
    function: '',
    steps: '',
    structuredSteps: [],
    expectedResult: '',
    actualResult: '',
    token: ''
  });

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const addStep = () => {
    const newStep: TestStep = {
      id: Date.now().toString(),
      locationType: 'id',
      operationType: 'click',
      content: ''
    };
    setFormData(prev => ({
      ...prev,
      structuredSteps: [...(prev.structuredSteps || []), newStep]
    }));
  };

  const removeStep = (id: string) => {
    setFormData(prev => ({
      ...prev,
      structuredSteps: (prev.structuredSteps || []).filter(s => s.id !== id)
    }));
  };

  const updateStep = (id: string, field: keyof TestStep, value: string) => {
    setFormData(prev => ({
      ...prev,
      structuredSteps: (prev.structuredSteps || []).map(s => 
        s.id === id ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error('请输入页面名称');
      return;
    }
    try {
      const newPage = await pageApi.createPage({
        page_name: formData.name,
        url: formData.url,
        function: formData.function,
        token_id: formData.token
      });
      setPages([{ ...newPage, testStatus: 'pending' as const }, ...pages]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('页面测试用例已添加');
    } catch (error) {
      toast.error('添加页面失败');
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!currentPage) return;
    try {
      const updatedPage = await pageApi.updatePage(parseInt(currentPage.id), {
        page_name: formData.name,
        url: formData.url,
        function: formData.function,
        token_id: formData.token
      });
      setPages(pages.map(p => p.id === currentPage.id ? { ...p, ...formData, ...updatedPage } as PageTest : p));
      setIsEditDialogOpen(false);
      toast.success('更新成功');
    } catch (error) {
      toast.error('更新页面失败');
      console.error(error);
    }
  };

  const handleCopy = (page: PageTest) => {
    setCurrentPage(page);
    setFormData({
      ...page,
      name: `${page.name} (副本)`
    });
    setIsCopyDialogOpen(true);
  };

  const saveCopy = async () => {
    if (!currentPage) return;
    try {
      const newPage = await pageApi.copyPage(parseInt(currentPage.id), formData.name || `${currentPage.name} (副本)`);
      setPages([{ ...newPage, testStatus: 'pending' as const }, ...pages]);
      setIsCopyDialogOpen(false);
      toast.success('副本已保存');
    } catch (error) {
      toast.error('复制页面失败');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pageApi.deletePage(parseInt(id));
      setPages(pages.filter(p => p.id !== id));
      toast.success('已删除');
    } catch (error) {
      toast.error('删除页面失败');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      function: '',
      steps: '',
      structuredSteps: [],
      expectedResult: '',
      actualResult: '',
      token: ''
    });
  };

  const openEdit = (page: PageTest) => {
    setCurrentPage(page);
    setFormData(page);
    setIsEditDialogOpen(true);
  };



  const toggleSelectAll = () => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map(p => p.id)));
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
    try {
      const pageIds = Array.from(selectedIds).map(id => parseInt(id));
      await pageApi.batchRunPages(pageIds);
      toast.info(`正在批量运行 ${selectedIds.size} 个页面测试...`);
    } catch (error) {
      toast.error('批量运行页面测试失败');
      console.error(error);
    }
  };

  const openFlows = (page: any) => {
    setSelectedPage(page);
    setViewMode('flows');
  };

  if (viewMode === 'flows') {
    return (
      <PageFlows
        pageName={selectedPage?.name}
        pageId={selectedPage?.id}
        onBack={() => setViewMode('list')}
      />
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索页面名称..." className="pl-10" />
        </div>

        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleBatchRun}>
              <Play className="w-4 h-4 fill-current" />
              批量运行 ({selectedIds.size})
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
              <Plus className="w-4 h-4" />
              添加页面
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>添加页面测试</DialogTitle>
                <DialogDescription>定义一个新的页面功能测试用例。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>页面名称</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="例如：个人中心" />
                  </div>
                  <div className="space-y-2">
                    <Label>页面功能</Label>
                    <Input value={formData.function} onChange={(e) => setFormData({...formData, function: e.target.value})} placeholder="简述页面核心功能" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>浏览器地址</Label>
                  <Input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label>Token</Label>
                  <Select value={formData.token} onValueChange={(val) => setFormData({...formData, token: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择Token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="token1">Token 1</SelectItem>
                      <SelectItem value="token2">Token 2</SelectItem>
                      <SelectItem value="token3">Token 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                        
              </div>

              <DialogFooter>
                <Button onClick={handleAdd}>保存页面</Button>
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
                  checked={selectedIds.size > 0 && selectedIds.size === pages.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>页面名称</TableHead>
              <TableHead>页面功能</TableHead>
              <TableHead>URL地址</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>测试结果</TableHead>
              <TableHead className="w-[220px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id} className={selectedIds.has(page.id) ? 'bg-muted/50' : ''}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.has(page.id)}
                    onCheckedChange={() => toggleSelect(page.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <LayoutIcon className="w-4 h-4 text-primary" />
                    {page.name}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{page.function}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs font-mono text-blue-600">{page.url || '-'}</TableCell>
                <TableCell className="text-sm font-mono">{page.token || '-'}</TableCell>
                <TableCell>
                  <Badge 
                    variant={page.testStatus === 'success' ? 'secondary' : 'outline'} 
                    className={
                      page.testStatus === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                      page.testStatus === 'failed' ? 'bg-red-50 text-red-600 border-red-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }
                  >
                    {page.testStatus === 'success' ? '成功' : page.testStatus === 'failed' ? '失败' : '未开始'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openFlows(page)}>
                      <List className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(page)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(page)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => toast.info('正在运行测试...')}>
                      <Play className="w-4 h-4 fill-current" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(page.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>



      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑页面测试</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>页面名称</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>页面功能</Label>
                <Input value={formData.function} onChange={(e) => setFormData({...formData, function: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>浏览器地址</Label>
              <Input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={formData.token} onValueChange={(val) => setFormData({...formData, token: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token1">Token 1</SelectItem>
                    <SelectItem value="token2">Token 2</SelectItem>
                    <SelectItem value="token3">Token 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>                 
            </div>

          </div>
          <DialogFooter>
            <Button onClick={handleEdit}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>复制并编辑页面测试</DialogTitle>
            <DialogDescription>修改副本配置后保存为新用例。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>页面名称</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>页面功能</Label>
                <Input value={formData.function} onChange={(e) => setFormData({...formData, function: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>浏览器地址</Label>
              <Input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={formData.token} onValueChange={(val) => setFormData({...formData, token: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token1">Token 1</SelectItem>
                    <SelectItem value="token2">Token 2</SelectItem>
                    <SelectItem value="token3">Token 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
           </div>
          </div>
          <DialogFooter>
            <Button onClick={saveCopy}>保存副本</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
