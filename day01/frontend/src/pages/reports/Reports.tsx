import React from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  History as HistoryIcon, 
  Filter, 
  Layout, 
  Code, 
  GitBranch,
  Calendar,
  ArrowLeft,
  FileText,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ReportRecord {
  id: string;
  type: 'interface' | 'page' | 'flow';
  name: string;
  description: string;
  expected: string;
  actual: string;
  status: 'pending' | 'success' | 'failed';
  duration: string;
  date: string;
  executor: string;
  remark?: string;
}

const mockReports: ReportRecord[] = [
  { 
    id: 'R-001', 
    type: 'interface', 
    name: '获取用户资料', 
    description: '验证用户信息接口返回数据完整性', 
    expected: '{"code": 200, "name": "Admin"}', 
    actual: '{"code": 200, "name": "Admin"}', 
    status: 'success', 
    duration: '120ms', 
    date: '2024-03-20 14:30', 
    executor: 'admin',
    remark: '接口响应正常'
  },
  { 
    id: 'R-002', 
    type: 'page', 
    name: '登录页面测试', 
    description: '验证登录表单提交流程', 
    expected: '跳转至首页', 
    actual: '跳转至首页', 
    status: 'success', 
    duration: '2.5s', 
    date: '2024-03-20 12:15', 
    executor: 'test_user',
    remark: 'UI显示符合预期'
  },
  { 
    id: 'R-003', 
    type: 'flow', 
    name: '下单全流程', 
    description: '从搜索到支付的闭环测试', 
    expected: '订单状态为已支付', 
    actual: '支付接口超时', 
    status: 'failed', 
    duration: '5.8s', 
    date: '2024-03-19 16:45', 
    executor: 'admin',
    remark: '支付网关不稳定'
  },
  { 
    id: 'R-004', 
    type: 'interface', 
    name: '更新库存', 
    description: '验证库存扣减逻辑', 
    expected: '{"status": "updated"}', 
    actual: '{"status": "updated"}', 
    status: 'success', 
    duration: '85ms', 
    date: '2024-03-19 10:20', 
    executor: 'admin',
    remark: '逻辑校验通过'
  },
  { 
    id: 'R-005', 
    type: 'page', 
    name: '商品详情页', 
    description: '验证规格选择功能', 
    expected: '显示正确价格', 
    actual: '价格显示延迟', 
    status: 'failed', 
    duration: '1.2s', 
    date: '2024-03-18 15:30', 
    executor: 'test_user',
    remark: '前端渲染性能需优化'
  },
];

const mockHistory: Record<string, ReportRecord[]> = {
  '获取用户资料': [
    { id: 'H-001', type: 'interface', name: '获取用户资料', description: '验证用户信息接口返回数据完整性', expected: '{"code": 200}', actual: '{"code": 200}', status: 'success', duration: '110ms', date: '2024-03-19 14:30', executor: 'admin', remark: '首次测试通过' },
    { id: 'H-002', type: 'interface', name: '获取用户资料', description: '验证用户信息接口返回数据完整性', expected: '{"code": 200}', actual: '{"code": 500}', status: 'failed', duration: '150ms', date: '2024-03-18 14:30', executor: 'admin', remark: '服务器内部错误' },
  ],
  '登录页面测试': [
    { id: 'H-003', type: 'page', name: '登录页面测试', description: '验证登录表单提交流程', expected: '跳转至首页', actual: '跳转至首页', status: 'success', duration: '2.4s', date: '2024-03-19 12:15', executor: 'test_user', remark: '回归测试通过' },
  ]
};

export default function ReportsPage() {
  const [viewMode, setViewMode] = React.useState<'list' | 'history'>('list');
  const [activeTab, setActiveTab] = React.useState('all');
  const [selectedHistory, setSelectedHistory] = React.useState<ReportRecord[]>([]);
  const [historyTitle, setHistoryTitle] = React.useState('');
  
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [currentDetail, setCurrentDetail] = React.useState<ReportRecord | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState<{ status: 'success' | 'failed' | 'pending', remark: string }>({
    status: 'pending',
    remark: ''
  });
  const [editingRecordId, setEditingRecordId] = React.useState<string | null>(null);

  const filteredReports = mockReports.filter(report => {
    if (activeTab === 'all') return true;
    return report.type === activeTab;
  });

  const enterHistory = (name: string) => {
    const history = mockHistory[name] || [];
    setSelectedHistory(history);
    setHistoryTitle(name);
    setViewMode('history');
  };

  const openDetail = (record: ReportRecord) => {
    setCurrentDetail(record);
    setIsDetailOpen(true);
  };

  const openEdit = (record: ReportRecord) => {
    setEditingRecordId(record.id);
    setEditFormData({
      status: record.status,
      remark: record.remark || ''
    });
    setIsEditDialogOpen(true);
  };

  const saveEdit = () => {
    setSelectedHistory(prev => prev.map(h => 
      h.id === editingRecordId ? { ...h, status: editFormData.status, remark: editFormData.remark } : h
    ));
    setIsEditDialogOpen(false);
    toast.success('执行记录已更新');
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 border-green-200"><CheckCircle2 className="w-3 h-3" /> 成功</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> 失败</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 gap-1 border-slate-200">未开始</Badge>;
    }
  };

  const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'interface': return <Code className="w-4 h-4 text-blue-500" />;
      case 'page': return <Layout className="w-4 h-4 text-purple-500" />;
      case 'flow': return <GitBranch className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'interface': return '接口';
      case 'page': return '页面';
      case 'flow': return '流程';
      default: return '未知';
    }
  };

  if (viewMode === 'history') {
    const totalExecutions = selectedHistory.length;
    const failedExecutions = selectedHistory.filter(h => h.status === 'failed').length;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setViewMode('list')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{historyTitle}</h2>
            <p className="text-muted-foreground">查看该功能的历史执行趋势与详细记录。</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-card border rounded-lg shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">执行总数</p>
              <p className="text-3xl font-bold">{totalExecutions}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <HistoryIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 bg-card border rounded-lg shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">失败总数</p>
              <p className="text-3xl font-bold text-destructive">{failedExecutions}</p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索执行记录..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" /> 筛选</Button>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> 导出</Button>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>功能名称</TableHead>
                <TableHead>执行时间</TableHead>
                <TableHead>预期结果</TableHead>
                <TableHead>实际结果</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>执行人</TableHead>
                <TableHead>备注</TableHead>
                <TableHead className="w-[150px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedHistory.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{h.date}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs font-mono" title={h.expected}>{h.expected}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs font-mono" title={h.actual}>{h.actual}</TableCell>
                  <TableCell><StatusBadge status={h.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{h.duration}</TableCell>
                  <TableCell className="text-xs">{h.executor}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground" title={h.remark}>{h.remark || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600" onClick={() => openDetail(h)}>详情</Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => openEdit(h)}>编辑</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {selectedHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无历史记录</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                执行详情报告
              </DialogTitle>
              <DialogDescription>查看详细的执行日志、截图及返回结果。</DialogDescription>
            </DialogHeader>
            {currentDetail && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">预期结果</Label>
                    <div className="p-3 bg-muted/30 rounded border font-mono text-xs min-h-[60px]">{currentDetail.expected}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">返回结果</Label>
                    <div className={`p-3 rounded border font-mono text-xs min-h-[60px] ${currentDetail.status === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      {currentDetail.actual}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">执行日志</Label>
                    <div className="bg-slate-950 text-slate-200 p-4 rounded-md font-mono text-[10px] space-y-1 h-[200px] overflow-y-auto">
                      <p className="text-slate-500">[{currentDetail.date}] 开始执行测试...</p>
                      <p className="text-blue-400">[{currentDetail.date}] 正在调用接口: {currentDetail.name}</p>
                      <p className="text-slate-400">[{currentDetail.date}] 请求参数: {"{}"}</p>
                      <p className={currentDetail.status === 'success' ? "text-green-400" : "text-red-400"}>
                        [{currentDetail.date}] 响应状态: {currentDetail.status === 'success' ? '200 OK' : '500 Error'}
                      </p>
                      <p className="text-slate-500">[{currentDetail.date}] 执行完毕，耗时 {currentDetail.duration}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">执行截图</Label>
                    <div className="relative aspect-video rounded-md border bg-muted overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${currentDetail.id}/800/450`} 
                        alt="Screenshot" 
                        className="object-cover w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/60 text-[8px] h-4">自动截图</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>编辑执行记录</DialogTitle>
              <DialogDescription>修改测试执行的状态或添加备注信息。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">执行状态</Label>
                <Select 
                  value={editFormData.status} 
                  onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                    <SelectItem value="pending">未开始</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remark">备注信息</Label>
                <Textarea 
                  id="remark" 
                  placeholder="请输入备注..." 
                  value={editFormData.remark}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, remark: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
              <Button onClick={saveEdit}>保存修改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索功能名称..." className="pl-10" />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            导出报告
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
          <TabsTrigger value="all">全部报告</TabsTrigger>
          <TabsTrigger value="interface">接口报告</TabsTrigger>
          <TabsTrigger value="page">页面报告</TabsTrigger>
          <TabsTrigger value="flow">流程报告</TabsTrigger>
        </TabsList>

        <div className="mt-6 rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>功能名称</TableHead>
                <TableHead>功能类型</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>预期结果</TableHead>
                <TableHead>实际结果</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>日期</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon type={report.type} />
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {getTypeLabel(report.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground" title={report.description}>
                    {report.description}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs font-mono" title={report.expected}>
                    {report.expected}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs font-mono" title={report.actual}>
                    {report.actual}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {report.duration}
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => enterHistory(report.name)}>
                        <HistoryIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    暂无相关测试报告
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>
    </div>
  );
}
