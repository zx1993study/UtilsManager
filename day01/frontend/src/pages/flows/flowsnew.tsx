
import React from 'react';
import { Plus, Search, GitBranch, Edit2, Trash2, Play, Pause } from 'lucide-react';
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
import { toast } from 'sonner';
import { flowApi } from '@/services/api';

interface Flow {
  id: string;
  flow_name: string;
  flow_steps: string;
  description: string;
  status: string;
}

export default function FlowsPage() {
  const [flows, setFlows] = React.useState<Flow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingFlow, setEditingFlow] = React.useState<Flow | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    flow_name: '',
    flow_steps: '',
    description: ''
  });

  // 获取流程列表
  const fetchFlows = async () => {
    try {
      setIsLoading(true);
      const data = await flowApi.getFlows();
      setFlows(data);
    } catch (error) {
      toast.error('获取流程列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFlows();
  }, []);

  const handleOpenDialog = (flow?: Flow) => {
    if (flow) {
      setEditingFlow(flow);
      setFormData({
        flow_name: flow.flow_name,
        flow_steps: flow.flow_steps,
        description: flow.description
      });
    } else {
      setEditingFlow(null);
      setFormData({ flow_name: '', flow_steps: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.flow_name || !formData.flow_steps) {
      toast.error('请填写完整流程信息');
      return;
    }

    try {
      if (editingFlow) {
        await flowApi.updateFlow(parseInt(editingFlow.id), formData);
        toast.success('流程更新成功');
      } else {
        await flowApi.createFlow(formData);
        toast.success('流程添加成功');
      }
      setIsDialogOpen(false);
      fetchFlows();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await flowApi.deleteFlow(parseInt(id));
      toast.success('流程已删除');
      fetchFlows();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await flowApi.toggleFlowStatus(parseInt(id));
      toast.success('流程状态已更新');
      fetchFlows();
    } catch (error: any) {
      toast.error(error.message || '更新状态失败');
    }
  };

  const handleRunFlow = async (id: string) => {
    try {
      await flowApi.runFlow(parseInt(id));
      toast.success('流程已启动');
    } catch (error: any) {
      toast.error(error.message || '启动流程失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索流程..." className="pl-10" />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={() => handleOpenDialog()} />}>
            <Plus className="w-4 h-4" />
            添加流程
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFlow ? '编辑流程' : '添加流程'}</DialogTitle>
              <DialogDescription>
                配置测试流程，定义步骤和执行顺序。
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="flow_name">流程名称</Label>
                <Input
                  id="flow_name"
                  value={formData.flow_name}
                  onChange={(e) => setFormData({ ...formData, flow_name: e.target.value })}
                  placeholder="例如：用户注册流程"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flow_steps">流程步骤</Label>
                <Textarea
                  id="flow_steps"
                  value={formData.flow_steps}
                  onChange={(e) => setFormData({ ...formData, flow_steps: e.target.value })}
                  placeholder="例如：1. 打开注册页面&#10;2. 填写用户信息&#10;3. 提交注册"
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如：测试用户注册功能的完整流程"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingFlow ? '保存修改' : '立即添加'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>流程名称</TableHead>
              <TableHead>流程步骤</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  正在加载流程...
                </TableCell>
              </TableRow>
            ) : flows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  暂无流程信息
                </TableCell>
              </TableRow>
            ) : (
              flows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-primary" />
                      {flow.flow_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="max-h-[60px] overflow-y-auto">
                      {flow.flow_steps.split('
').map((step, index) => (
                        <div key={index}>{step}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={flow.status === 'active' ? 'default' : 'secondary'}
                      className={flow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                      onClick={() => handleToggleStatus(flow.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {flow.status === 'active' ? '活跃' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {flow.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleRunFlow(flow.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(flow)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(flow.id)}>
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
