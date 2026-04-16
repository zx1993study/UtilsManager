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
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = React.useState<string>('all');
  const [selectedProject2, setSelectedProject2] = React.useState<string>('all');
  const [selectedProject3, setSelectedProject3] = React.useState<string>('1');
  const [selectedProject4, setSelectedProject4] = React.useState<string>('1');
  const [selectedDateRange, setSelectedDateRange] = React.useState<string>('7days');

  const projects = [
    { id: '1', name: '电商平台项目' },
    { id: '2', name: '用户中心系统' },
    { id: '3', name: '订单管理系统' },
  ];

  const bugRankingData = [
    { project: '电商平台项目', count: 45 },
    { project: '用户中心系统', count: 32 },
    { project: '订单管理系统', count: 28 },
  ];

  const bugProbabilityData = [
    { name: '用户登录', probability: 12, icon: '🔐' },
    { name: '支付功能', probability: 8, icon: '💳' },
    { name: '购物车', probability: 15, icon: '🛒' },
    { name: '订单管理', probability: 6, icon: '📋' },
    { name: '数据统计', probability: 10, icon: '📊' },
  ];

  const functionalBugData = {
    '7days': [
      { name: '用户登录', dates: ['12-01', '12-02', '12-03', '12-04', '12-05', '12-06', '12-07'], counts: [5, 8, 6, 9, 7, 10, 8], color: '#3b82f6' },
      { name: '支付功能', dates: ['12-01', '12-02', '12-03', '12-04', '12-05', '12-06', '12-07'], counts: [3, 5, 4, 6, 5, 7, 6], color: '#ef4444' },
      { name: '购物车', dates: ['12-01', '12-02', '12-03', '12-04', '12-05', '12-06', '12-07'], counts: [7, 6, 8, 5, 9, 6, 7], color: '#22c55e' },
      { name: '订单管理', dates: ['12-01', '12-02', '12-03', '12-04', '12-05', '12-06', '12-07'], counts: [4, 7, 5, 8, 6, 9, 5], color: '#f59e0b' },
      { name: '数据统计', dates: ['12-01', '12-02', '12-03', '12-04', '12-05', '12-06', '12-07'], counts: [6, 5, 7, 4, 8, 5, 6], color: '#8b5cf6' },
    ],
    '1month': [
      { name: '用户登录', dates: ['12-01', '12-06', '12-11', '12-16', '12-21', '12-26', '12-31'], counts: [5, 8, 6, 9, 7, 10, 8], color: '#3b82f6' },
      { name: '支付功能', dates: ['12-01', '12-06', '12-11', '12-16', '12-21', '12-26', '12-31'], counts: [3, 5, 4, 6, 5, 7, 6], color: '#ef4444' },
      { name: '购物车', dates: ['12-01', '12-06', '12-11', '12-16', '12-21', '12-26', '12-31'], counts: [7, 6, 8, 5, 9, 6, 7], color: '#22c55e' },
      { name: '订单管理', dates: ['12-01', '12-06', '12-11', '12-16', '12-21', '12-26', '12-31'], counts: [4, 7, 5, 8, 6, 9, 5], color: '#f59e0b' },
      { name: '数据统计', dates: ['12-01', '12-06', '12-11', '12-16', '12-21', '12-26', '12-31'], counts: [6, 5, 7, 4, 8, 5, 6], color: '#8b5cf6' },
    ],
    '6months': [
      { name: '用户登录', dates: ['07-01', '08-01', '09-01', '10-01', '11-01', '12-01'], counts: [5, 8, 6, 9, 7, 10], color: '#3b82f6' },
      { name: '支付功能', dates: ['07-01', '08-01', '09-01', '10-01', '11-01', '12-01'], counts: [3, 5, 4, 6, 5, 7], color: '#ef4444' },
      { name: '购物车', dates: ['07-01', '08-01', '09-01', '10-01', '11-01', '12-01'], counts: [7, 6, 8, 5, 9, 6], color: '#22c55e' },
      { name: '订单管理', dates: ['07-01', '08-01', '09-01', '10-01', '11-01', '12-01'], counts: [4, 7, 5, 8, 6, 9], color: '#f59e0b' },
      { name: '数据统计', dates: ['07-01', '08-01', '09-01', '10-01', '11-01', '12-01'], counts: [6, 5, 7, 4, 8, 5], color: '#8b5cf6' },
    ],
    '1year': [
      { name: '用户登录', dates: ['01-01', '03-01', '05-01', '07-01', '09-01', '11-01'], counts: [5, 8, 6, 9, 7, 10], color: '#3b82f6' },
      { name: '支付功能', dates: ['01-01', '03-01', '05-01', '07-01', '09-01', '11-01'], counts: [3, 5, 4, 6, 5, 7], color: '#ef4444' },
      { name: '购物车', dates: ['01-01', '03-01', '05-01', '07-01', '09-01', '11-01'], counts: [7, 6, 8, 5, 9, 6], color: '#22c55e' },
      { name: '订单管理', dates: ['01-01', '03-01', '05-01', '07-01', '09-01', '11-01'], counts: [4, 7, 5, 8, 6, 9], color: '#f59e0b' },
      { name: '数据统计', dates: ['01-01', '03-01', '05-01', '07-01', '09-01', '11-01'], counts: [6, 5, 7, 4, 8, 5], color: '#8b5cf6' },
    ],
  };

  const stats = [
    { name: '总Bug数', value: '12', icon: XCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: '接口Bug', value: '48', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: '页面Bug', value: '24', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: '流程Bug', value: '156', icon: GitBranch, color: 'text-green-500', bg: 'bg-green-500/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Bug排行
              </div>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部项目</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] px-4">
              <div className="relative h-full">
                {/* Y轴 - 功能名称 */}
                <div className="absolute left-0 top-0 bottom-6 w-32 flex flex-col justify-around text-sm text-foreground font-medium">
                  {bugRankingData.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 truncate" title={item.project}>
                      <span className="text-base">{index + 1}</span>
                      <span className="truncate">{item.project}</span>
                    </div>
                  ))}
                </div>

                {/* 图表区域 */}
                <div className="absolute left-32 right-0 top-0 bottom-6">
                  {/* 柱状图 */}
                  <div className="absolute inset-0 flex flex-col justify-around">
                    {(() => {
                      const data = bugRankingData.slice(0, 5);
                      const maxCount = Math.max(...data.map(d => d.count));
                      const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
                      return data.map((item, index) => (
                        <div key={index} className="relative h-8 flex items-center">
                          <div
                            className="h-6 rounded transition-all duration-500"
                            style={{
                              width: `${(item.count / maxCount) * 100}%`,
                              backgroundColor: colors[index % colors.length]
                            }}
                          />
                          <span className="absolute right-2 text-sm font-bold text-foreground">{item.count}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* X轴 */}
                <div className="absolute left-32 right-0 bottom-0 h-6 flex justify-between text-xs text-muted-foreground">
                  {(() => {
                    const maxCount = Math.max(...bugRankingData.slice(0, 5).map(d => d.count));
                    return [0, Math.round(maxCount * 0.25), Math.round(maxCount * 0.5), Math.round(maxCount * 0.75), maxCount].map((value, i) => (
                      <div key={i} className="text-center">{value}</div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Bug概率
              </div>
              <Select value={selectedProject4} onValueChange={setSelectedProject4}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              {/* 饼状图 */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    const data = bugProbabilityData.slice(0, 5); 

                    const total = data.reduce((sum, item) => sum + item.probability, 0);
                    let currentAngle = 0;
                    
                    return data.map((item, index) => {
                      const percentage = item.probability / total;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + percentage * 2 * Math.PI;
                      currentAngle = endAngle;
                      
                      const x1 = 50 + 40 * Math.cos(startAngle);
                      const y1 = 50 + 40 * Math.sin(startAngle);
                      const x2 = 50 + 40 * Math.cos(endAngle);
                      const y2 = 50 + 40 * Math.sin(endAngle);
                      const largeArcFlag = percentage > 0.5 ? 1 : 0;
                      
                      const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={color}
                          stroke="white"
                          strokeWidth="0.5"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* 中心文字 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bugProbabilityData.slice(0, 5) 
.reduce((sum, item) => sum + item.probability, 0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">总概率</div>
                  </div>
                </div>
              </div>
              {/* 图例 */}
              <div className="space-y-3">
                {bugProbabilityData.slice(0, 5).map((item, index) => {
                    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
                    const color = colors[index % colors.length];
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium ml-auto">{item.probability}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              功能Bug趋势
            </div>
            <div className="flex gap-2">
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="日期范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7天</SelectItem>
                  <SelectItem value="1month">一个月</SelectItem>
                  <SelectItem value="6months">半年</SelectItem>
                  <SelectItem value="1year">一年</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedProject3} onValueChange={setSelectedProject3}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 功能图标区域 */}
            <div className="flex justify-center gap-6 py-4">
              {functionalBugData[selectedDateRange]?.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="h-[300px] px-4">
              <div className="relative h-full">
                {/* Y轴 */}
                <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-muted-foreground">
                  <div>10</div>
                  <div>8</div>
                  <div>6</div>
                  <div>4</div>
                  <div>2</div>
                  <div>0</div>
                </div>
                
                {/* 图表区域 */}
                <div className="absolute left-12 right-0 top-0 bottom-6">
                  {/* 网格线 */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border-b border-muted/30" />
                    ))}
                  </div>
                  
                  {/* 折线 */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {functionalBugData[selectedDateRange]?.map((line, lineIndex) => (
                      <g key={lineIndex}>
                        <polyline
                          fill="none"
                          stroke={line.color}
                          strokeWidth="2"
                          points={line.counts.map((count, i) => {
                            const x = (i / (line.dates.length - 1)) * 100;
                            const y = ((10 - count) / 10) * 100;
                            return `${x},${y}`;
                          }).join(' ')}
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* 数据点 */}
                        {line.counts.map((count, i) => {
                          const x = (i / (line.dates.length - 1)) * 100;
                          const y = ((10 - count) / 10) * 100;
                          return (
                            <circle
                              key={i}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="2.5"
                              fill={line.color}
                              stroke="white"
                              strokeWidth="1.5"
                            />
                          );
                        })}
                      </g>
                    ))}
                  </svg>
                </div>
                
                {/* X轴 */}
                <div className="absolute left-12 right-0 bottom-0 h-6 flex justify-between text-xs text-muted-foreground">
                  {functionalBugData[selectedDateRange]?.[0]?.dates.map((date, i) => (
                    <div key={i} className="text-center">{date}</div>
                  ))}
                </div>
              </div>
              
              {/* 图例 */}
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {functionalBugData[selectedDateRange]?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
