import React from 'react';
import { Plus, Search, Folder, Edit2, Trash2, Globe, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface Project {
  id: string;
  name: string;
  address: string;
  port: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([
    { id: '1', name: '电商平台项目', address: 'https://api.mall.example.com', port: '443' },
    { id: '2', name: '用户中心系统', address: 'http://192.168.1.100', port: '8080' },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    port: ''
  });

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        address: project.address,
        port: project.port
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', address: '', port: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.port) {
      toast.error('请填写完整项目信息');
      return;
    }

    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...editingProject, ...formData } : p));
      toast.success('项目更新成功');
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData
      };
      setProjects([...projects, newProject]);
      toast.success('项目添加成功');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast.success('项目已删除');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索项目名称..." className="pl-10" />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={() => handleOpenDialog()} />}>
            <Plus className="w-4 h-4" />
            添加项目
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? '编辑项目' : '添加项目'}</DialogTitle>
              <DialogDescription>
                配置项目的基本信息，包括名称、地址和端口。
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">项目名称</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="例如：电商平台项目"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">项目地址</Label>
                <Input 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="例如：https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">项目端口</Label>
                <Input 
                  id="port" 
                  value={formData.port} 
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })} 
                  placeholder="例如：8080"
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingProject ? '保存修改' : '立即添加'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目名称</TableHead>
              <TableHead>项目地址</TableHead>
              <TableHead>项目端口</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  暂无项目信息
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-primary" />
                      {project.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      {project.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="w-3 h-3" />
                      {project.port}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(project)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(project.id)}>
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
