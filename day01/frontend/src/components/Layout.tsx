import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Book, 
  Globe, 
  GitBranch, 
  FileText, 
  LogOut,
  Menu,
  X,
  Key,
  Folder,
  Layout as LayoutIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { name: '统计面板', path: '/', icon: LayoutDashboard },
  { name: '用户管理', path: '/users', icon: Users },
  { name: '项目管理', path: '/projects', icon: Folder },
  { name: '字典配置', path: '/dictionaries', icon: Book },
  { name: '接口管理', path: '/interfaces', icon: Globe },
  { name: '页面管理', path: '/pages', icon: LayoutIcon },
  { name: '流程管理', path: '/flows', icon: GitBranch },
  { name: 'Token 管理', path: '/tokens', icon: Key },
  { name: '测试报告', path: '/reports', icon: FileText },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    await fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <GitBranch className="w-6 h-6" />
          自动化测试平台
        </h1>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50" />}>
          <Menu className="w-6 h-6" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-card flex-shrink-0">
          <h2 className="text-lg font-semibold capitalize">
            {navItems.find(item => item.path === location.pathname)?.name || '统计面板'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">管理员</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
