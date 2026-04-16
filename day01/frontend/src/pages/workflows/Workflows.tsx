import React from 'react';
import { Plus, Search, GitBranch, ArrowRight, Play, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const workflows = [
    { 
      id: 1, 
      name: '完整下单流程', 
      description: '测试从登录到订单确认的整个过程',
      steps: ['登录', '加入购物车', '结算', '支付'],
      lastRun: '2 小时前',
      status: '成功'
    },
    { 
      id: 2, 
      name: '用户注册流程', 
      description: '验证注册和初始个人资料设置',
      steps: ['注册', '邮件验证', '资料设置'],
      lastRun: '昨天',
      status: '失败'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索流程..." className="pl-10" />
        </div>
        
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          创建流程
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((flow) => (
          <Card key={flow.id} className="group hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary" />
                    {flow.name}
                  </CardTitle>
                  <CardDescription>{flow.description}</CardDescription>
                </div>
                <Badge variant={flow.status === '成功' ? 'default' : 'destructive'}>
                  {flow.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center flex-wrap gap-2">
                {flow.steps.map((step, i) => (
                  <React.Fragment key={step}>
                    <Badge variant="outline" className="bg-muted/50">
                      {step}
                    </Badge>
                    {i < flow.steps.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4 bg-muted/5 rounded-b-lg">
              <span className="text-xs text-muted-foreground">上次运行: {flow.lastRun}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8">
                  <Settings2 className="w-3 h-3 mr-1" />
                  编辑
                </Button>
                <Button size="sm" className="h-8 gap-1" onClick={() => toast.success('流程已启动')}>
                  <Play className="w-3 h-3 fill-current" />
                  执行
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
