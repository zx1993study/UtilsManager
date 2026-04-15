import React from 'react';
import { Search, FileText, Download, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ReportsPage() {
  const reports = [
    { id: 'R-1024', workflow: '完整下单流程', status: '成功', duration: '4.2s', date: '2024-03-20 14:30', author: 'admin' },
    { id: 'R-1023', workflow: '用户注册流程', status: '失败', duration: '1.8s', date: '2024-03-20 12:15', author: 'admin' },
    { id: 'R-1022', workflow: '完整下单流程', status: '成功', duration: '3.9s', date: '2024-03-19 16:45', author: 'test_user' },
    { id: 'R-1021', workflow: '支付网关测试', status: '成功', duration: '2.1s', date: '2024-03-19 10:20', author: 'admin' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索报告 ID 或流程名称..." className="pl-10" />
        </div>
        
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          导出全部
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>报告 ID</TableHead>
              <TableHead>流程名称</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>耗时</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>执行人</TableHead>
              <TableHead className="w-[100px]">详情</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-mono text-xs font-bold">{report.id}</TableCell>
                <TableCell className="font-medium">{report.workflow}</TableCell>
                <TableCell>
                  <Badge variant={report.status === '成功' ? 'default' : 'destructive'} className="gap-1">
                    {report.status === '成功' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.duration}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{report.date}</TableCell>
                <TableCell className="text-sm">{report.author}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => toast.info('正在打开报告详情...')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
