import React from 'react';
import { Plus, Search, Book, Tag, Hash, Edit2, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

export default function DictionariesPage() {
  const [dicts, setDicts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingDict, setEditingDict] = React.useState<any>(null);
  
  // 模拟数据
  const mockDicts = [
    { id: 1, name: 'API配置', key: 'BASE_URL', value: 'https://api.example.com', type: 'String', remark: '主 API 端点', createTime: '2024-03-20 10:30:00' },
    { id: 2, name: '超时设置', key: 'MAX_RETRIES', value: '3', type: 'Number', remark: '请求失败后的重试次数', createTime: '2024-03-20 11:15:00' },
    { id: 3, name: '认证配置', key: 'AUTH_HEADER', value: 'Authorization', type: 'String', remark: 'Token 的 Header 键名', createTime: '2024-03-20 14:20:00' },
  ];
  
  // 处理编辑
  const handleEdit = (item: any) => {
    setEditingDict(item);
    setIsEditOpen(true);
  };
  
  // 处理删除
  const handleDelete = (id: number) => {
    setDicts(dicts.filter(item => item.id !== id));
    toast.success('已删除字典条目');
  };
  
  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingDict) return;
    setDicts(dicts.map(item => item.id === editingDict.id ? editingDict : item));
    setIsEditOpen(false);
    toast.success('已更新字典条目');
  };

  const fetchDicts = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/dictionaries', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDicts(data);
      }
    } catch (error) {
      toast.error('获取字典列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDicts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索字典键名..." className="pl-10" />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="w-4 h-4" />
            添加条目
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加字典条目</DialogTitle>
              <DialogDescription>
                配置测试所需的全局变量或数据映射。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>参数名称</Label>
                <Input placeholder="例如：API配置" />
              </div>
              <div className="space-y-2">
                <Label>参数键值</Label>
                <Input placeholder="例如：API_TIMEOUT" />
              </div>
              <div className="space-y-2">
                <Label>参数值</Label>
                <Input placeholder="例如：5000" />
              </div>
              <div className="space-y-2">
                <Label>参数类型</Label>
                <Input placeholder="例如：Number, String, JSON" />
              </div>
              <div className="space-y-2">
                <Label>备注</Label>
                <Input placeholder="此条目的用途是什么？" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                toast.info('演示版暂不支持此功能');
                setIsAddOpen(false);
              }}>保存条目</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 编辑弹窗 */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑字典条目</DialogTitle>
              <DialogDescription>
                修改字典条目的配置信息。
              </DialogDescription>
            </DialogHeader>
            {editingDict && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>参数名称</Label>
                  <Input 
                    value={editingDict.name || ''}
                    onChange={(e) => setEditingDict({...editingDict, name: e.target.value})}
                    placeholder="例如：API配置"
                  />
                </div>
                <div className="space-y-2">
                  <Label>参数键值</Label>
                  <Input 
                    value={editingDict.key || ''}
                    onChange={(e) => setEditingDict({...editingDict, key: e.target.value})}
                    placeholder="例如：API_TIMEOUT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>参数值</Label>
                  <Input 
                    value={editingDict.value || ''}
                    onChange={(e) => setEditingDict({...editingDict, value: e.target.value})}
                    placeholder="例如：5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>参数类型</Label>
                  <Input 
                    value={editingDict.type || ''}
                    onChange={(e) => setEditingDict({...editingDict, type: e.target.value})}
                    placeholder="例如：Number, String, JSON"
                  />
                </div>
                <div className="space-y-2">
                  <Label>备注</Label>
                  <Input 
                    value={editingDict.remark || ''}
                    onChange={(e) => setEditingDict({...editingDict, remark: e.target.value})}
                    placeholder="此条目的用途是什么？"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
              <Button onClick={handleSaveEdit}>保存修改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>参数名称</TableHead>
              <TableHead>参数键值</TableHead>
              <TableHead>参数值</TableHead>
              <TableHead>参数类型</TableHead>
              <TableHead>备注</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  正在加载...
                </TableCell>
              </TableRow>
            ) : dicts.length === 0 ? (
              // Mock data for demo if empty
              mockDicts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary">{item.key}</TableCell>
                  <TableCell className="font-mono text-xs">{item.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {item.type === 'Number' ? <Hash className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.remark}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.createTime}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              dicts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary">{item.key}</TableCell>
                  <TableCell className="font-mono text-xs">{item.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {item.type === 'Number' ? <Hash className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.remark}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.createTime}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
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
