import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BookOpen,
  Building2,
  UserCog,
  LogOut,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import type { Role } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const NAV: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Tổng quan',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['ADMIN', 'TRAINING_STAFF', 'FACILITY_STAFF', 'LECTURER', 'DEPARTMENT_HEAD'],
  },
  {
    to: '/schedule',
    label: 'Thời khóa biểu',
    icon: <CalendarDays className="w-5 h-5" />,
    roles: ['ADMIN', 'TRAINING_STAFF', 'LECTURER', 'DEPARTMENT_HEAD'],
  },
  {
    to: '/classes',
    label: 'Lớp học phần',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['ADMIN', 'TRAINING_STAFF', 'DEPARTMENT_HEAD'],
  },
  {
    to: '/lecturers',
    label: 'Giảng viên',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['ADMIN', 'TRAINING_STAFF', 'DEPARTMENT_HEAD'],
  },
  {
    to: '/rooms',
    label: 'Phòng học',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['ADMIN', 'FACILITY_STAFF', 'TRAINING_STAFF'],
  },
  { to: '/users', label: 'Tài khoản', icon: <UserCog className="w-5 h-5" />, roles: ['ADMIN'] },
  {
    to: '/my-schedule',
    label: 'Lịch của tôi',
    icon: <Users className="w-5 h-5" />,
    roles: ['LECTURER'],
  },
];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  TRAINING_STAFF: 'CV Phòng Đào tạo',
  FACILITY_STAFF: 'Phòng HCQT',
  LECTURER: 'Giảng viên',
  DEPARTMENT_HEAD: 'Trưởng bộ môn',
};

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = NAV.filter((n) => user && n.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-white border-r border-surface-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">TKB System</p>
              <p className="text-xs text-ink-light">Xếp lịch tự động</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-ink-muted hover:bg-surface hover:text-ink'
                )
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-surface-border">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.full_name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.full_name}</p>
              <p className="text-xs text-ink-light truncate">{user ? ROLE_LABEL[user.role] : ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink-muted rounded-lg hover:bg-red-50 hover:text-danger transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
