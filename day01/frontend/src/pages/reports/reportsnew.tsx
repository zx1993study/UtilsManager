
import React from 'react';
import { Search, FileText, Trash2, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { reportApi } from '@/services/api';

interface Report {
  id: string;
  workflow_name: string;
  status: string;
  start_time: string;
  end_time: string;
  duration: string;
  success_count: number;
  failure_count: number;
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // 获取报告列表
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportApi.getReports();
      setReports(data);
    } catch (error) {
      toast.error('获取报告列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await reportApi.deleteReport(parseInt(id));
      toast.success('报告已删除');
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  const handleExport = async (id: string) => {
    try {
      await reportApi.exportReport(parseInt(id));
      toast.success('报告导出成功');
    } catch (error: any) {
      toast.error(error.message || '导出失败');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            成功
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-50 text-red-600 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            失败
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-blue-50 text-blue-600">
            <Clock className="w-3 h-3 mr-1" />
            运行中
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索报告..." className="pl-10" />
        </div>

        <Button variant="outline" className="gap-2" onClick={fetchReports}>
          <Search className="w-4 h-4" />
          刷新报告
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>工作流名称</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>开始时间</TableHead>
              <TableHead>结束时间</TableHead>
              <TableHead>持续时间</TableHead>
              <TableHead>成功/失败</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  正在加载报告...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  暂无报告信息
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {report.workflow_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(report.start_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {report.end_time ? new Date(report.end_time).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {report.duration || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-600">
                        成功: {report.success_count}
                      </Badge>
                      <Badge variant="outline" className="bg-red-50 text-red-600">
                        失败: {report.failure_count}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleExport(report.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive" 
                        onClick={() => handleDelete(report.id)}
                      >
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
