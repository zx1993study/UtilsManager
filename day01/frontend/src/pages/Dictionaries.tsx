import React from 'react';
import { Plus, Search, Book, Tag, Hash } from 'lucide-react';
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
                <Label>键名</Label>
                <Input placeholder="例如：API_TIMEOUT" />
              </div>
              <div className="space-y-2">
                <Label>值</Label>
                <Input placeholder="例如：5000" />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <Input placeholder="例如：Number, String, JSON" />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
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
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>键名</TableHead>
              <TableHead>值</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>描述</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  正在加载...
                </TableCell>
              </TableRow>
            ) : dicts.length === 0 ? (
              // Mock data for demo if empty
              [
                { id: 1, key: 'BASE_URL', value: 'https://api.example.com', type: 'String', description: '主 API 端点' },
                { id: 2, key: 'MAX_RETRIES', value: '3', type: 'Number', description: '请求失败后的重试次数' },
                { id: 3, key: 'AUTH_HEADER', value: 'Authorization', type: 'String', description: 'Token 的 Header 键名' },
              ].map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">{item.key}</TableCell>
                  <TableCell className="font-mono text-xs">{item.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {item.type === 'Number' ? <Hash className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.description}</TableCell>
                </TableRow>
              ))
            ) : (
              dicts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">{item.key}</TableCell>
                  <TableCell className="font-mono text-xs">{item.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
