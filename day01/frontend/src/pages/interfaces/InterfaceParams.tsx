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

interface ParamTemplate {
  id: string;
  name: string;
  remark: string;
  required: boolean;
  size: string;
  type: string;
}

interface TestCase {
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

export default function InterfaceParamsPage({ interfaceName = '获取用户资料', onBack }: { interfaceName?: string, onBack: () => void }) {
  const [templates, setTemplates] = React.useState<ParamTemplate[]>([
    { id: '1', name: 'userId', remark: '用户唯一标识', required: true, size: '32', type: 'String' },
    { id: '2', name: 'token', remark: '访问令牌', required: true, size: '256', type: 'String' },
    { id: '3', name: 'fields', remark: '返回字段筛选', required: false, size: '512', type: 'String' },
  ]);

  const [testCases, setTestCases] = React.useState<TestCase[]>([
    { id: '1', name: '正常获取', instance: 'userId=123', executions: 15, expected: '200 OK', actual: '200 OK', executor: 'admin', time: '2024-03-20 14:30', status: 'success' },
    { id: '2', name: '用户不存在', instance: 'userId=999', executions: 8, expected: '404 Not Found', actual: '404 Not Found', executor: 'admin', time: '2024-03-20 12:15', status: 'success' },
    { id: '3', name: 'Token失效', instance: 'userId=123&token=expired', executions: 5, expected: '401 Unauthorized', actual: '500 Error', executor: 'test_user', time: '2024-03-19 16:45', status: 'failed' },
  ]);

  const [selectedCaseIds, setSelectedCaseIds] = React.useState<Set<string>>(new Set());
  
  // 参数模板编辑状态
  const [editingTemplate, setEditingTemplate] = React.useState<ParamTemplate | null>(null);
  const [isTemplateEditOpen, setIsTemplateEditOpen] = React.useState(false);
  
  // 测试用例编辑状态
  const [editingCase, setEditingCase] = React.useState<TestCase | null>(null);
  const [isCaseEditOpen, setIsCaseEditOpen] = React.useState(false);
  
  // 测试用例复制状态
  const [copyingCase, setCopyingCase] = React.useState<TestCase | null>(null);
  const [isCaseCopyOpen, setIsCaseCopyOpen] = React.useState(false);

  const toggleSelectAll = () => {
    if (selectedCaseIds.size === testCases.length) {
      setSelectedCaseIds(new Set());
    } else {
      setSelectedCaseIds(new Set(testCases.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedCaseIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedCaseIds(newSelected);
  };

  const handleBatchRun = () => {
    if (selectedCaseIds.size === 0) return toast.error('请选择用例');
    toast.success(`正在批量运行 ${selectedCaseIds.size} 个用例...`);
  };
  
  // 打开参数模板编辑弹窗
  const openTemplateEdit = (template: ParamTemplate) => {
    setEditingTemplate(template);
    setIsTemplateEditOpen(true);
  };
  
  // 保存参数模板编辑
  const saveTemplateEdit = () => {
    if (!editingTemplate) return;
    setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setIsTemplateEditOpen(false);
    toast.success('参数模板已更新');
  };
  
  // 打开测试用例编辑弹窗
  const openCaseEdit = (testCase: TestCase) => {
    setEditingCase(testCase);
    setIsCaseEditOpen(true);
  };
  
  // 保存测试用例编辑
  const saveCaseEdit = () => {
    if (!editingCase) return;
    setTestCases(testCases.map(c => c.id === editingCase.id ? editingCase : c));
    setIsCaseEditOpen(false);
    toast.success('测试用例已更新');
  };
  
  // 打开测试用例复制弹窗
  const openCaseCopy = (testCase: TestCase) => {
    setCopyingCase({ ...testCase, id: Date.now().toString(), name: `${testCase.name} (副本)` });
    setIsCaseCopyOpen(true);
  };
  
  // 保存测试用例复制
  const saveCaseCopy = () => {
    if (!copyingCase) return;
    setTestCases([...testCases, copyingCase]);
    setIsCaseCopyOpen(false);
    toast.success('测试用例已复制');
  };
  
  // 根据参数模板生成随机实例
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
          <h2 className="text-xl font-bold tracking-tight">{interfaceName}</h2>
          <p className="text-xs text-muted-foreground">管理接口参数模板与测试用例实例。</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left: Parameter Templates */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-4 border rounded-lg bg-card p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold">参数模板</h3>
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
                    <DialogTitle>添加参数模板</DialogTitle>
                    <DialogDescription>定义接口参数的规范和约束。</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fieldName">字段名称</Label>
                      <Input id="fieldName" placeholder="例如: userId" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="remark">备注</Label>
                      <Input id="remark" placeholder="字段描述信息" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="required">是否非空</Label>
                        <Select defaultValue="true">
                          <SelectTrigger id="required">
                            <SelectValue placeholder="选择" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">是</SelectItem>
                            <SelectItem value="false">否</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fieldType">字段类型</Label>
                        <Select defaultValue="String">
                          <SelectTrigger id="fieldType">
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="String">String</SelectItem>
                            <SelectItem value="Number">Number</SelectItem>
                            <SelectItem value="Boolean">Boolean</SelectItem>
                            <SelectItem value="Object">Object</SelectItem>
                            <SelectItem value="Array">Array</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fieldSize">字段大小</Label>
                      <Input id="fieldSize" placeholder="例如: 32" />
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
                  <TableHead className="text-xs">字段名称</TableHead>
                  <TableHead className="text-xs">备注</TableHead>
                  <TableHead className="text-xs">非空</TableHead>
                  <TableHead className="text-xs">大小</TableHead>
                  <TableHead className="text-xs">类型</TableHead>
                  <TableHead className="text-xs w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map(t => (
                  <TableRow key={t.id} className="text-xs">
                    <TableCell className="font-mono font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t.remark}</TableCell>
                    <TableCell>{t.required ? <Badge variant="secondary" className="bg-red-50 text-red-600 text-[10px]">是</Badge> : '否'}</TableCell>
                    <TableCell className="text-muted-foreground">{t.size}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{t.type}</Badge></TableCell>
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

        {/* Right: Test Cases */}
        <div className="col-span-12 lg:col-span-7 flex flex-col space-y-4 border rounded-lg bg-card p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold">测试用例</h3>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info('导入功能')}>导入</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 text-xs gap-1">
                    <Plus className="w-3 h-3" /> 添加用例
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>添加测试用例</DialogTitle>
                    <DialogDescription>创建具体的测试执行实例。</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="caseName">用例名称</Label>
                      <Input id="caseName" placeholder="例如: 正常登录场景" />
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
                      <Textarea id="instanceJson" placeholder='{"userId": "123", "token": "abc"}' className="font-mono text-xs h-24" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expected">预期结果</Label>
                      <Input id="expected" placeholder="例如: 200 OK" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => toast.success('用例已添加')}>保存用例</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="搜索用例名称..." className="pl-8 h-9 text-xs" />
            </div>
            <div className="flex gap-2">
              {selectedCaseIds.size > 0 && (
                <Button size="sm" variant="default" className="h-9 text-xs bg-green-600 hover:bg-green-700 gap-1" onClick={handleBatchRun}>
                  <Play className="w-3 h-3 fill-current" /> 批量运行 ({selectedCaseIds.size})
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
                    <Checkbox checked={selectedCaseIds.size === testCases.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="text-xs">用例名称</TableHead>
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
                {testCases.map(c => (
                  <TableRow key={c.id} className={`text-xs ${selectedCaseIds.has(c.id) ? 'bg-muted/30' : ''}`}>
                    <TableCell>
                      <Checkbox checked={selectedCaseIds.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
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
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="复制" onClick={() => openCaseCopy(c)}><Copy className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="编辑" onClick={() => openCaseEdit(c)}><Edit2 className="w-3 h-3" /></Button>
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
      
      {/* 参数模板编辑弹窗 */}
      <Dialog open={isTemplateEditOpen} onOpenChange={setIsTemplateEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑参数模板</DialogTitle>
            <DialogDescription>修改接口参数的规范和约束。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editFieldName">字段名称</Label>
              <Input 
                id="editFieldName" 
                value={editingTemplate?.name || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRemark">备注</Label>
              <Input 
                id="editRemark" 
                value={editingTemplate?.remark || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, remark: e.target.value } : null)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editRequired">是否非空</Label>
                <Select 
                  value={editingTemplate?.required ? 'true' : 'false'}
                  onValueChange={(value) => setEditingTemplate(prev => prev ? { ...prev, required: value === 'true' } : null)}
                >
                  <SelectTrigger id="editRequired">
                    <SelectValue placeholder="选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">是</SelectItem>
                    <SelectItem value="false">否</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editFieldType">字段类型</Label>
                <Select 
                  value={editingTemplate?.type || 'String'}
                  onValueChange={(value) => setEditingTemplate(prev => prev ? { ...prev, type: value } : null)}
                >
                  <SelectTrigger id="editFieldType">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="String">String</SelectItem>
                    <SelectItem value="Number">Number</SelectItem>
                    <SelectItem value="Boolean">Boolean</SelectItem>
                    <SelectItem value="Object">Object</SelectItem>
                    <SelectItem value="Array">Array</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editFieldSize">字段大小</Label>
              <Input 
                id="editFieldSize" 
                value={editingTemplate?.size || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, size: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateEditOpen(false)}>取消</Button>
            <Button onClick={saveTemplateEdit}>保存模板</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 测试用例编辑弹窗 */}
      <Dialog open={isCaseEditOpen} onOpenChange={setIsCaseEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>编辑测试用例</DialogTitle>
            <DialogDescription>修改测试执行实例的详细信息。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editCaseName">用例名称</Label>
              <Input 
                id="editCaseName" 
                value={editingCase?.name || ''}
                onChange={(e) => setEditingCase(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editExecutions">执行次数</Label>
              <Input 
                id="editExecutions" 
                type="number" 
                value={editingCase?.executions || 1}
                onChange={(e) => setEditingCase(prev => prev ? { ...prev, executions: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="editInstanceJson">实例</Label>
                <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {
                  const generated = generateInstanceFromTemplate();
                  setEditingCase(prev => prev ? { ...prev, instance: generated } : null);
                  toast.success('已根据模板自动生成实例');
                }}>自动生成</Button>
              </div>
              <Textarea 
                id="editInstanceJson" 
                value={editingCase?.instance || ''}
                onChange={(e) => setEditingCase(prev => prev ? { ...prev, instance: e.target.value } : null)}
                className="font-mono text-xs h-24" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editExpected">预期结果</Label>
              <Input 
                id="editExpected" 
                value={editingCase?.expected || ''}
                onChange={(e) => setEditingCase(prev => prev ? { ...prev, expected: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCaseEditOpen(false)}>取消</Button>
            <Button onClick={saveCaseEdit}>保存用例</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 测试用例复制新增弹窗 */}
      <Dialog open={isCaseCopyOpen} onOpenChange={setIsCaseCopyOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>复制测试用例</DialogTitle>
            <DialogDescription>基于现有用例创建新的测试实例。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="copyCaseName">用例名称</Label>
              <Input 
                id="copyCaseName" 
                value={copyingCase?.name || ''}
                onChange={(e) => setCopyingCase(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="copyExecutions">执行次数</Label>
              <Input 
                id="copyExecutions" 
                type="number" 
                value={copyingCase?.executions || 1}
                onChange={(e) => setCopyingCase(prev => prev ? { ...prev, executions: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="copyInstanceJson">实例</Label>
                <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {
                  const generated = generateInstanceFromTemplate();
                  setCopyingCase(prev => prev ? { ...prev, instance: generated } : null);
                  toast.success('已根据模板自动生成实例');
                }}>自动生成</Button>
              </div>
              <Textarea 
                id="copyInstanceJson" 
                value={copyingCase?.instance || ''}
                onChange={(e) => setCopyingCase(prev => prev ? { ...prev, instance: e.target.value } : null)}
                className="font-mono text-xs h-24" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="copyExpected">预期结果</Label>
              <Input 
                id="copyExpected" 
                value={copyingCase?.expected || ''}
                onChange={(e) => setCopyingCase(prev => prev ? { ...prev, expected: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCaseCopyOpen(false)}>取消</Button>
            <Button onClick={saveCaseCopy}>创建用例</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
