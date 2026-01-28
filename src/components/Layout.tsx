import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  LayoutDashboard, 
  Package, 
  FilePlus, 
  LogOut, 
  Settings,
  Users,
  Palette,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/produtos', icon: Package, label: 'Produtos' },
    { path: '/propostas', icon: FilePlus, label: 'Propostas' },
    { path: '/catalogos', icon: BookOpen, label: 'Catálogos' },
    ...(user?.role === 'admin' ? [
      { path: '/templates', icon: Palette, label: 'Templates' },
      { path: '/usuarios', icon: Users, label: 'Usuários' },
    ] : []),
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700 bg-slate-800">
        <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">PropoCraft</span>
        </div>
        
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-amber-500/10 text-amber-500"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:bg-slate-700/50 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
