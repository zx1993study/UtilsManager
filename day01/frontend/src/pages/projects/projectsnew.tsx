
import React from 'react';
import { Plus, Search, Folder, Edit2, Trash2, Globe, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { projectApi } from '@/services/api';

interface Project {
  id: string;
  project_name: string;
  project_address: string;
  project_port: string;
  project_env: string;
  description: string;
  status: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    project_name: '',
    project_address: '',
    project_port: '',
    project_env: '',
    description: ''
  });

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (error) {
      toast.error('获取项目列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        project_name: project.project_name,
        project_address: project.project_address,
        project_port: project.project_port,
        project_env: project.project_env,
        description: project.description
      });
    } else {
      setEditingProject(null);
      setFormData({ project_name: '', project_address: '', project_port: '', project_env: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_name || !formData.project_address || !formData.project_port) {
      toast.error('请填写完整项目信息');
      return;
    }

    try {
      if (editingProject) {
        await projectApi.updateProject(parseInt(editingProject.id), formData);
        toast.success('项目更新成功');
      } else {
        await projectApi.createProject(formData);
        toast.success('项目添加成功');
      }
      setIsDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectApi.deleteProject(parseInt(id));
      toast.success('项目已删除');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
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
                <Label htmlFor="project_name">项目名称</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="例如：电商平台项目"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_address">项目地址</Label>
                <Input
                  id="project_address"
                  value={formData.project_address}
                  onChange={(e) => setFormData({ ...formData, project_address: e.target.value })}
                  placeholder="例如：https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_port">项目端口</Label>
                <Input
                  id="project_port"
                  value={formData.project_port}
                  onChange={(e) => setFormData({ ...formData, project_port: e.target.value })}
                  placeholder="例如：8080"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_env">项目环境</Label>
                <Input
                  id="project_env"
                  value={formData.project_env}
                  onChange={(e) => setFormData({ ...formData, project_env: e.target.value })}
                  placeholder="例如：开发环境"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">备注</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如：电商核心系统"
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
              <TableHead>项目环境</TableHead>
              <TableHead>备注</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  正在加载项目...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无项目信息
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-primary" />
                      {project.project_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      {project.project_address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="w-3 h-3" />
                      {project.project_port}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline" className={project.project_env === '开发环境' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}>
                      {project.project_env || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{project.description || '-'}</TableCell>
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
