import React from 'react';
import { 
  Users, 
  Book, 
  Globe, 
  GitBranch, 
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const stats = [
    { name: '总用户数', value: '12', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: '接口数量', value: '48', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: '流程数量', value: '24', icon: GitBranch, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: '测试报告', value: '156', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  const recentReports = [
    { id: 1, workflow: '用户登录流程', status: '成功', time: '2 分钟前' },
    { id: 2, workflow: '支付网关测试', status: '失败', time: '15 分钟前' },
    { id: 3, workflow: '数据同步服务', status: '成功', time: '1 小时前' },
    { id: 4, workflow: '库存更新接口', status: '成功', time: '3 小时前' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              最近测试活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>流程名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id}>
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
                      {report.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
              <h4 className="font-medium group-hover:text-primary">创建新测试</h4>
              <p className="text-xs text-muted-foreground">定义新的 API 接口进行测试</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
              <h4 className="font-medium group-hover:text-primary">配置工作流</h4>
              <p className="text-xs text-muted-foreground">将多个接口串联成流程</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
              <h4 className="font-medium group-hover:text-primary">导出报告</h4>
              <p className="text-xs text-muted-foreground">下载 PDF/Excel 格式的测试结果</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
