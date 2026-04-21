
import React from 'react';
import { Plus, Search, Book, Edit2, Trash2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { dictionaryApi } from '@/services/api';

interface Dictionary {
  id: string;
  key: string;
  value: string;
  type: string;
  description: string;
}

export default function DictionariesPage() {
  const [dictionaries, setDictionaries] = React.useState<Dictionary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingDictionary, setEditingDictionary] = React.useState<Dictionary | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    key: '',
    value: '',
    type: 'string',
    description: ''
  });

  // 获取字典列表
  const fetchDictionaries = async () => {
    try {
      setIsLoading(true);
      const data = await dictionaryApi.getDictionaries();
      setDictionaries(data);
    } catch (error) {
      toast.error('获取字典列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDictionaries();
  }, []);

  const handleOpenDialog = (dictionary?: Dictionary) => {
    if (dictionary) {
      setEditingDictionary(dictionary);
      setFormData({
        key: dictionary.key,
        value: dictionary.value,
        type: dictionary.type,
        description: dictionary.description
      });
    } else {
      setEditingDictionary(null);
      setFormData({ key: '', value: '', type: 'string', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.value) {
      toast.error('请填写完整字典信息');
      return;
    }

    try {
      if (editingDictionary) {
        await dictionaryApi.updateDictionary(parseInt(editingDictionary.id), formData);
        toast.success('字典更新成功');
      } else {
        await dictionaryApi.createDictionary(formData);
        toast.success('字典添加成功');
      }
      setIsDialogOpen(false);
      fetchDictionaries();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dictionaryApi.deleteDictionary(parseInt(id));
      toast.success('字典已删除');
      fetchDictionaries();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索字典..." className="pl-10" />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={() => handleOpenDialog()} />}>
            <Plus className="w-4 h-4" />
            添加字典
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDictionary ? '编辑字典' : '添加字典'}</DialogTitle>
              <DialogDescription>
                配置字典的基本信息，包括键、值和类型。
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key">键</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="例如：API_URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">值</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="例如：https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">类型</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">字符串</SelectItem>
                    <SelectItem value="number">数字</SelectItem>
                    <SelectItem value="boolean">布尔值</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如：API基础URL"
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingDictionary ? '保存修改' : '立即添加'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>键</TableHead>
              <TableHead>值</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  正在加载字典...
                </TableCell>
              </TableRow>
            ) : dictionaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  暂无字典信息
                </TableCell>
              </TableRow>
            ) : (
              dictionaries.map((dictionary) => (
                <TableRow key={dictionary.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-primary" />
                      {dictionary.key}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {dictionary.value}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      dictionary.type === 'string' ? 'bg-blue-50 text-blue-600' :
                      dictionary.type === 'number' ? 'bg-green-50 text-green-600' :
                      dictionary.type === 'boolean' ? 'bg-purple-50 text-purple-600' :
                      'bg-orange-50 text-orange-600'
                    }>
                      {dictionary.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {dictionary.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(dictionary)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(dictionary.id)}>
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
