import React from 'react';
import { Plus, Search, GitBranch, Eye, Edit2, Trash2, Calendar, User, ListChecks, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Step {
  id: string;
  interfaceId: string;
  params: string;
  isBatch: string;
}

interface Flow {
  id: string;
  name: string;
  steps: string; // Keep for legacy display or summary
  structuredSteps: Step[];
  expectedResult: string;
  actualResult: string;
  createdAt: string;
  creator: string;
}

export default function FlowsPage() {
  const [interfaces] = React.useState<any[]>([
    { id: 'i1', name: '获取用户资料' },
    { id: 'i2', name: '更新库存' },
    { id: 'i3', name: '处理支付' },
    { id: 'i4', name: '登录系统' },
    { id: 'i5', name: '搜索商品' }
  ]);

  const [flows, setFlows] = React.useState<Flow[]>([
    {
      id: '1',
      name: '用户下单全流程测试',
      steps: '1. 登录系统\n2. 搜索商品\n3. 加入购物车\n4. 提交订单\n5. 支付成功',
      structuredSteps: [
        { id: 's1', interfaceId: 'i4', params: '{"user": "admin"}' },
        { id: 's2', interfaceId: 'i5', params: '{"keyword": "iphone"}' }
      ],
      expectedResult: '订单状态变为“已支付”，库存扣减成功',
      actualResult: '订单状态变为“已支付”，库存扣减成功',
      createdAt: '2024-03-20 10:30',
      creator: '张三'
    },
    {
      id: '2',
      name: '找回密码功能验证',
      steps: '1. 点击忘记密码\n2. 输入邮箱\n3. 查收验证码\n4. 重置新密码',
      structuredSteps: [
        { id: 's3', interfaceId: 'i1', params: '{"email": "test@example.com"}' }
      ],
      expectedResult: '成功重置密码并能用新密码登录',
      actualResult: '验证码邮件延迟较大',
      createdAt: '2024-03-21 14:15',
      creator: '李四'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [currentFlow, setCurrentFlow] = React.useState<Flow | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    structuredSteps: [] as Step[],
    expectedResult: '',
    actualResult: ''
  });

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      interfaceId: '',
      params: '',
      isBatch: 'no'
    };
    setFormData({
      ...formData,
      structuredSteps: [...formData.structuredSteps, newStep]
    });
  };

  const removeStep = (id: string) => {
    setFormData({
      ...formData,
      structuredSteps: formData.structuredSteps.filter(s => s.id !== id)
    });
  };

  const updateStep = (id: string, field: keyof Step, value: string) => {
    setFormData({
      ...formData,
      structuredSteps: formData.structuredSteps.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const handleAdd = () => {
    if (!formData.name) {
      toast.error('请输入流程名称');
      return;
    }
    const newFlow: Flow = {
      id: Date.now().toString(),
      name: formData.name,
      structuredSteps: formData.structuredSteps,
      steps: formData.structuredSteps.map((s, i) => `${i + 1}. ${interfaces.find(it => it.id === s.interfaceId)?.name || '未知接口'}`).join('\n'),
      expectedResult: formData.expectedResult,
      actualResult: formData.actualResult,
      createdAt: new Date().toLocaleString(),
      creator: '当前用户'
    };
    setFlows([...flows, newFlow]);
    setIsAddDialogOpen(false);
    setFormData({ name: '', structuredSteps: [], expectedResult: '', actualResult: '' });
    toast.success('流程添加成功');
  };

  const handleEdit = () => {
    if (!currentFlow) return;
    const updatedFlow: Flow = {
      ...currentFlow,
      name: formData.name,
      structuredSteps: formData.structuredSteps,
      steps: formData.structuredSteps.map((s, i) => `${i + 1}. ${interfaces.find(it => it.id === s.interfaceId)?.name || '未知接口'}`).join('\n'),
      expectedResult: formData.expectedResult,
      actualResult: formData.actualResult,
    };
    setFlows(flows.map(f => f.id === currentFlow.id ? updatedFlow : f));
    setIsEditDialogOpen(false);
    toast.success('流程更新成功');
  };

  const handleDelete = (id: string) => {
    setFlows(flows.filter(f => f.id !== id));
    toast.success('流程已删除');
  };

  const openView = (flow: Flow) => {
    setCurrentFlow(flow);
    setIsViewDialogOpen(true);
  };

  const openEdit = (flow: Flow) => {
    setCurrentFlow(flow);
    setFormData({
      name: flow.name,
      structuredSteps: flow.structuredSteps || [],
      expectedResult: flow.expectedResult,
      actualResult: flow.actualResult
    });
    setIsEditDialogOpen(true);
  };

  const openAdd = () => {
    setFormData({ name: '', structuredSteps: [], expectedResult: '', actualResult: '' });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索流程名称..." className="pl-10" />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={openAdd} />}>
            <Plus className="w-4 h-4" />
            添加流程
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加测试流程</DialogTitle>
              <DialogDescription>定义一个新的端到端测试流程。</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>流程名称</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="输入流程名称" 
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    流程步骤
                  </Label>
                  <Button variant="outline" size="sm" onClick={addStep} className="gap-1">
                    <Plus className="w-3 h-3" />
                    添加步骤
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.structuredSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 relative group">
                      <div className="flex-none mt-2 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-[1.2fr_0.8fr_1fr] gap-6">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">选择接口</Label>
                          <Select 
                            value={step.interfaceId} 
                            onValueChange={(val) => updateStep(step.id, 'interfaceId', val)}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="选择接口" />
                            </SelectTrigger>
                            <SelectContent>
                              {interfaces.map(it => (
                                <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">批处理</Label>
                          <Select 
                            value={step.isBatch || 'no'} 
                            onValueChange={(val) => updateStep(step.id, 'isBatch', val)}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="是否需要" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">不需要</SelectItem>
                              <SelectItem value="yes">需要</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">请求参数</Label>
                          <Input 
                            className="h-9"
                            placeholder='{"id": 123}' 
                            value={step.params}
                            onChange={(e) => updateStep(step.id, 'params', e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeStep(step.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.structuredSteps.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                      点击“添加步骤”开始配置流程
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>预期结果</Label>
                  <Textarea 
                    value={formData.expectedResult} 
                    onChange={(e) => setFormData({...formData, expectedResult: e.target.value})} 
                    placeholder="预期表现" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>实际结果</Label>
                  <Textarea 
                    value={formData.actualResult} 
                    onChange={(e) => setFormData({...formData, actualResult: e.target.value})} 
                    placeholder="实际表现" 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>保存流程</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>流程名称</TableHead>
              <TableHead>流程步骤</TableHead>
              <TableHead>预期结果</TableHead>
              <TableHead>实际结果</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>创建人</TableHead>
              <TableHead className="w-[200px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    {flow.name}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                  {flow.steps}
                </TableCell>
                <TableCell className="max-w-[150px] truncate text-sm">
                  {flow.expectedResult}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  <Badge variant={flow.actualResult === flow.expectedResult ? "secondary" : "outline"} className={flow.actualResult === flow.expectedResult ? "bg-green-100 text-green-700 hover:bg-green-100" : "text-red-500"}>
                    {flow.actualResult}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {flow.createdAt}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {flow.creator}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(flow)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(flow)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(flow.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>流程详情</DialogTitle>
          </DialogHeader>
          {currentFlow && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">流程名称</Label>
                  <p className="font-medium">{currentFlow.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">创建人</Label>
                  <p className="text-sm">{currentFlow.creator} ({currentFlow.createdAt})</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  流程步骤
                </Label>
                <div className="space-y-2">
                  {currentFlow.structuredSteps && currentFlow.structuredSteps.length > 0 ? (
                    currentFlow.structuredSteps.map((step, index) => (
                      <div key={step.id} className="flex gap-3 p-2 border rounded bg-muted/20">
                        <span className="text-xs font-bold text-primary">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {interfaces.find(it => it.id === step.interfaceId)?.name || '未知接口'}
                            </p>
                            {step.isBatch === 'yes' && (
                              <Badge variant="outline" className="text-[10px] h-4 bg-blue-50 text-blue-600 border-blue-200">
                                批处理
                              </Badge>
                            )}
                          </div>
                          {step.params && (
                            <code className="text-[10px] bg-muted px-1 rounded block mt-1">
                              参数: {step.params}
                            </code>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-muted p-3 rounded-md whitespace-pre-wrap text-sm leading-relaxed">
                      {currentFlow.steps}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-green-600">预期结果</Label>
                  <p className="text-sm border p-2 rounded bg-green-50/50">{currentFlow.expectedResult}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-blue-600">实际结果</Label>
                  <p className="text-sm border p-2 rounded bg-blue-50/50">{currentFlow.actualResult}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑流程</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>流程名称</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  流程步骤
                </Label>
                <Button variant="outline" size="sm" onClick={addStep} className="gap-1">
                  <Plus className="w-3 h-3" />
                  添加步骤
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.structuredSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 relative group">
                    <div className="flex-none mt-2 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-[1.2fr_0.8fr_1fr] gap-6">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">选择接口</Label>
                        <Select 
                          value={step.interfaceId} 
                          onValueChange={(val) => updateStep(step.id, 'interfaceId', val)}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="选择接口" />
                          </SelectTrigger>
                          <SelectContent>
                            {interfaces.map(it => (
                              <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">批处理</Label>
                        <Select 
                          value={step.isBatch || 'no'} 
                          onValueChange={(val) => updateStep(step.id, 'isBatch', val)}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="是否需要" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">不需要</SelectItem>
                            <SelectItem value="yes">需要</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">请求参数</Label>
                        <Input 
                          className="h-9"
                          placeholder='{"id": 123}' 
                          value={step.params}
                          onChange={(e) => updateStep(step.id, 'params', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeStep(step.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>预期结果</Label>
                <Textarea 
                  value={formData.expectedResult} 
                  onChange={(e) => setFormData({...formData, expectedResult: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>实际结果</Label>
                <Textarea 
                  value={formData.actualResult} 
                  onChange={(e) => setFormData({...formData, actualResult: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
