import React from 'react';
import {
  Plus,
  Search,
  ArrowLeft,
  Settings2,
  FileJson,
  Play,
  Edit2,
  Trash2,
  Download,
  Copy,
  CheckSquare,
  Square,
  MoreVertical,
  Filter,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ElementTemplate {
  id: string;
  name: string;
  locator: string;
  element: string;
  type: string;
  remark: string;
}

interface OperationStep {
  id: string;
  name: string;
  instance: string;
  executions: number;
  expected: string;
  actual: string;
  executor: string;
  time: string;
  status: 'success' | 'failed' | 'pending';
}

export default function PageFlowsPage({ pageName = '用户登录页面', onBack }: { pageName?: string, onBack: () => void }) {
  const [templates, setTemplates] = React.useState<ElementTemplate[]>([
    { id: '1', name: 'username', locator: 'id=user-name', element: 'Input', type: '文本输入', remark: '用户名输入框' },
    { id: '2', name: 'password', locator: 'id=password', element: 'Input', type: '密码输入', remark: '密码输入框' },
    { id: '3', name: 'captcha', locator: 'class=captcha-input', element: 'Input', type: '文本输入', remark: '验证码输入框' },
  ]);

  const [steps, setSteps] = React.useState<OperationStep[]>([
    { id: '1', name: '正常登录', instance: 'username=admin&password=123456', executions: 15, expected: '登录成功', actual: '登录成功', executor: 'admin', time: '2024-03-20 14:30', status: 'success' },
    { id: '2', name: '用户名错误', instance: 'username=wrong&password=123456', executions: 8, expected: '用户名不存在', actual: '用户名不存在', executor: 'admin', time: '2024-03-20 12:15', status: 'success' },
    { id: '3', name: '密码错误', instance: 'username=admin&password=wrong', executions: 5, expected: '密码错误', actual: '系统错误', executor: 'test_user', time: '2024-03-19 16:45', status: 'failed' },
  ]);

  const [selectedStepIds, setSelectedStepIds] = React.useState<Set<string>>(new Set());

  // 元素模板编辑状态
  const [editingTemplate, setEditingTemplate] = React.useState<ElementTemplate | null>(null);
  const [isTemplateEditOpen, setIsTemplateEditOpen] = React.useState(false);

  // 操作步骤编辑状态
  const [editingStep, setEditingStep] = React.useState<OperationStep | null>(null);
  const [isStepEditOpen, setIsStepEditOpen] = React.useState(false);

  // 操作步骤复制状态
  const [copyingStep, setCopyingStep] = React.useState<OperationStep | null>(null);
  const [isStepCopyOpen, setIsStepCopyOpen] = React.useState(false);

  const toggleSelectAll = () => {
    if (selectedStepIds.size === steps.length) {
      setSelectedStepIds(new Set());
    } else {
      setSelectedStepIds(new Set(steps.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedStepIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedStepIds(newSelected);
  };

  const handleBatchRun = () => {
    if (selectedStepIds.size === 0) return toast.error('请选择操作步骤');
    toast.success(`正在批量运行 ${selectedStepIds.size} 个步骤...`);
  };

  // 打开元素模板编辑弹窗
  const openTemplateEdit = (template: ElementTemplate) => {
    setEditingTemplate(template);
    setIsTemplateEditOpen(true);
  };

  // 保存元素模板编辑
  const saveTemplateEdit = () => {
    if (!editingTemplate) return;
    setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setIsTemplateEditOpen(false);
    toast.success('元素模板已更新');
  };

  // 打开操作步骤编辑弹窗
  const openStepEdit = (step: OperationStep) => {
    setEditingStep(step);
    setIsStepEditOpen(true);
  };

  // 保存操作步骤编辑
  const saveStepEdit = () => {
    if (!editingStep) return;
    setSteps(steps.map(s => s.id === editingStep.id ? editingStep : s));
    setIsStepEditOpen(false);
    toast.success('操作步骤已更新');
  };

  // 打开操作步骤复制弹窗
  const openStepCopy = (step: OperationStep) => {
    setCopyingStep({ ...step, id: Date.now().toString(), name: `${step.name} (副本)` });
    setIsStepCopyOpen(true);
  };

  // 保存操作步骤复制
  const saveStepCopy = () => {
    if (!copyingStep) return;
    setSteps([...steps, copyingStep]);
    setIsStepCopyOpen(false);
    toast.success('操作步骤已复制');
  };

  // 根据元素模板生成随机实例
  const generateInstanceFromTemplate = () => {
    const instance: Record<string, any> = {};
    templates.forEach(template => {
      switch (template.type) {
        case 'String':
          // 生成随机长度为1-7的字符串
          const randomLength = Math.floor(Math.random() * 7) + 1;
          instance[template.name] = generateRandomString(randomLength);
          break;
        case 'Number':
          instance[template.name] = Math.floor(Math.random() * 1000);
          break;
        case 'Boolean':
          instance[template.name] = Math.random() > 0.5;
          break;
        case 'Object':
          instance[template.name] = { key: 'value' };
          break;
        case 'Array':
          instance[template.name] = ['item1', 'item2'];
          break;
        default:
          instance[template.name] = '';
      }
    });
    return JSON.stringify(instance, null, 2);
  };

  // 生成随机字符串
  const generateRandomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{pageName}</h2>
          <p className="text-xs text-muted-foreground">管理页面元素模板与操作步骤实例。</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left: Element Templates */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-4 border rounded-lg bg-card p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold">元素模板</h3>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info('导入功能')}>导入</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 text-xs gap-1">
                    <Plus className="w-3 h-3" /> 添加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加元素模板</DialogTitle>
                    <DialogDescription>定义页面元素的规范和约束。</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fieldName">元素名称</Label>
                      <Input id="fieldName" placeholder="例如: username" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="locator">定位器</Label>
                      <Select defaultValue="id">
                        <SelectTrigger id="locator">
                          <SelectValue placeholder="选择定位器" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">id</SelectItem>
                          <SelectItem value="name">name</SelectItem>
                          <SelectItem value="class">class</SelectItem>
                          <SelectItem value="tag">tag</SelectItem>
                          <SelectItem value="xpath">xpath</SelectItem>
                          <SelectItem value="css">css</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="element">元素</Label>
                      <Input id="element" placeholder="例如: user-name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fieldType">类型</Label>
                      <Select defaultValue="文本输入">
                        <SelectTrigger id="fieldType">
                          <SelectValue placeholder="选择类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="文本输入">文本输入</SelectItem>
                          <SelectItem value="密码输入">密码输入</SelectItem>
                          <SelectItem value="按钮点击">按钮点击</SelectItem>
                          <SelectItem value="下拉选择">下拉选择</SelectItem>
                          <SelectItem value="复选框">复选框</SelectItem>
                          <SelectItem value="单选框">单选框</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="remark">备注</Label>
                      <Input id="remark" placeholder="元素描述信息" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => toast.success('模板已添加')}>保存模板</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">元素名称</TableHead>
                  <TableHead className="text-xs">定位器</TableHead>
                  <TableHead className="text-xs">元素</TableHead>
                  <TableHead className="text-xs">类型</TableHead>
                  <TableHead className="text-xs">备注</TableHead>
                  <TableHead className="text-xs w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map(t => (
                  <TableRow key={t.id} className="text-xs">
                    <TableCell className="font-mono font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t.locator}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{t.element}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{t.type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{t.remark}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openTemplateEdit(t)}><Edit2 className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right: Operation Steps */}
        <div className="col-span-12 lg:col-span-7 flex flex-col space-y-4 border rounded-lg bg-card p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold">操作步骤</h3>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info('导入功能')}>导入</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 text-xs gap-1">
                    <Plus className="w-3 h-3" /> 添加步骤
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>添加操作步骤</DialogTitle>
                    <DialogDescription>创建具体的操作执行实例。</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stepName">步骤名称</Label>
                      <Input id="stepName" placeholder="例如: 正常登录场景" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="executions">执行次数</Label>
                      <Input id="executions" type="number" defaultValue="1" />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="instanceJson">实例 (根据模板生成)</Label>
                        <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {
                          const generated = generateInstanceFromTemplate();
                          const textarea = document.getElementById('instanceJson') as HTMLTextAreaElement;
                          if (textarea) textarea.value = generated;
                          toast.success('已根据模板自动生成实例');
                        }}>自动生成</Button>
                      </div>
                      <Textarea id="instanceJson" placeholder='{"username": "admin", "password": "123456"}' className="font-mono text-xs h-24" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expected">预期结果</Label>
                      <Input id="expected" placeholder="例如: 登录成功" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => toast.success('步骤已添加')}>保存步骤</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="搜索步骤名称..." className="pl-8 h-9 text-xs" />
            </div>
            <div className="flex gap-2">
              {selectedStepIds.size > 0 && (
                <Button size="sm" variant="default" className="h-9 text-xs bg-green-600 hover:bg-green-700 gap-1" onClick={handleBatchRun}>
                  <Play className="w-3 h-3 fill-current" /> 批量运行 ({selectedStepIds.size})
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-9 text-xs gap-1">
                <Filter className="w-3 h-3" /> 筛选
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox checked={selectedStepIds.size === steps.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="text-xs">步骤名称</TableHead>
                  <TableHead className="text-xs">实例</TableHead>
                  <TableHead className="text-xs">执行</TableHead>
                  <TableHead className="text-xs">预期</TableHead>
                  <TableHead className="text-xs">实际</TableHead>
                  <TableHead className="text-xs">结果</TableHead>
                  <TableHead className="text-xs">执行人</TableHead>
                  <TableHead className="text-xs">时间</TableHead>
                  <TableHead className="text-xs w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.map(c => (
                  <TableRow key={c.id} className={`text-xs ${selectedStepIds.has(c.id) ? 'bg-muted/30' : ''}`}>
                    <TableCell>
                      <Checkbox checked={selectedStepIds.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground truncate max-w-[100px]" title={c.instance}>{c.instance}</TableCell>
                    <TableCell>{c.executions}</TableCell>
                    <TableCell className="text-muted-foreground">{c.expected}</TableCell>
                    <TableCell>
                      <span className={c.status === 'success' ? 'text-green-600' : 'text-red-600'}>{c.actual}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === 'success' ? 'secondary' : 'outline'}
                        className={c.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600 border-red-200'}
                      >
                        {c.status === 'success' ? '成功' : '失败'}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.executor}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{c.time}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="运行"><Play className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="复制" onClick={() => openStepCopy(c)}><Copy className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="编辑" onClick={() => openStepEdit(c)}><Edit2 className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="删除"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 元素模板编辑弹窗 */}
      <Dialog open={isTemplateEditOpen} onOpenChange={setIsTemplateEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑元素模板</DialogTitle>
            <DialogDescription>修改页面元素的规范和约束。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editFieldName">元素名称</Label>
              <Input
                id="editFieldName"
                value={editingTemplate?.name || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editLocator">定位器</Label>
              <Select
                value={editingTemplate?.locator || 'id'}
                onValueChange={(value) => setEditingTemplate(prev => prev ? { ...prev, locator: value } : null)}
              >
                <SelectTrigger id="editLocator">
                  <SelectValue placeholder="选择定位器" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">id</SelectItem>
                  <SelectItem value="name">name</SelectItem>
                  <SelectItem value="class">class</SelectItem>
                  <SelectItem value="tag">tag</SelectItem>
                  <SelectItem value="xpath">xpath</SelectItem>
                  <SelectItem value="css">css</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editElement">元素</Label>
              <Input
                id="editElement"
                value={editingTemplate?.element || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, element: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editFieldType">类型</Label>
              <Select
                value={editingTemplate?.type || '文本输入'}
                onValueChange={(value) => setEditingTemplate(prev => prev ? { ...prev, type: value } : null)}
              >
                <SelectTrigger id="editFieldType">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="文本输入">文本输入</SelectItem>
                  <SelectItem value="密码输入">密码输入</SelectItem>
                  <SelectItem value="按钮点击">按钮点击</SelectItem>
                  <SelectItem value="下拉选择">下拉选择</SelectItem>
                  <SelectItem value="复选框">复选框</SelectItem>
                  <SelectItem value="单选框">单选框</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRemark">备注</Label>
              <Input
                id="editRemark"
                value={editingTemplate?.remark || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, remark: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveTemplateEdit}>保存模板</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 操作步骤编辑弹窗 */}
      <Dialog open={isStepEditOpen} onOpenChange={setIsStepEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>编辑操作步骤</DialogTitle>
            <DialogDescription>修改操作执行实例的详细信息。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editStepName">步骤名称</Label>
              <Input
                id="editStepName"
                value={editingStep?.name || ''}
                onChange={(e) => setEditingStep(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editExecutions">执行次数</Label>
              <Input
                id="editExecutions"
                type="number"
                value={editingStep?.executions || 1}
                onChange={(e) => setEditingStep(prev => prev ? { ...prev, executions: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="editInstanceJson">实例</Label>
                <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {
                  const generated = generateInstanceFromTemplate();
                  setEditingStep(prev => prev ? { ...prev, instance: generated } : null);
                  toast.success('已根据模板自动生成实例');
                }}>自动生成</Button>
              </div>
              <Textarea
                id="editInstanceJson"
                value={editingStep?.instance || ''}
                onChange={(e) => setEditingStep(prev => prev ? { ...prev, instance: e.target.value } : null)}
                className="font-mono text-xs h-24"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editExpected">预期结果</Label>
              <Input
                id="editExpected"
                value={editingStep?.expected || ''}
                onChange={(e) => setEditingStep(prev => prev ? { ...prev, expected: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStepEditOpen(false)}>取消</Button>
            <Button onClick={saveStepEdit}>保存步骤</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 操作步骤复制新增弹窗 */}
      <Dialog open={isStepCopyOpen} onOpenChange={setIsStepCopyOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>复制操作步骤</DialogTitle>
            <DialogDescription>基于现有步骤创建新的操作实例。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="copyStepName">步骤名称</Label>
              <Input
                id="copyStepName"
                value={copyingStep?.name || ''}
                onChange={(e) => setCopyingStep(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="copyExecutions">执行次数</Label>
              <Input
                id="copyExecutions"
                type="number"
                value={copyingStep?.executions || 1}
                onChange={(e) => setCopyingStep(prev => prev ? { ...prev, executions: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="copyInstanceJson">实例</Label>
                <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {
                  const generated = generateInstanceFromTemplate();
                  setCopyingStep(prev => prev ? { ...prev, instance: generated } : null);
                  toast.success('已根据模板自动生成实例');
                }}>自动生成</Button>
              </div>
              <Textarea
                id="copyInstanceJson"
                value={copyingStep?.instance || ''}
                onChange={(e) => setCopyingStep(prev => prev ? { ...prev, instance: e.target.value } : null)}
                className="font-mono text-xs h-24"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="copyExpected">预期结果</Label>
              <Input
                id="copyExpected"
                value={copyingStep?.expected || ''}
                onChange={(e) => setCopyingStep(prev => prev ? { ...prev, expected: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStepCopyOpen(false)}>取消</Button>
            <Button onClick={saveStepCopy}>创建步骤</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}