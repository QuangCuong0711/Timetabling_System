import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Building2,
  GraduationCap,
  BookOpen,
  Play,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { roomApi, lecturerApi, scheduleApi } from '../../api/services';
import { StatCard, Card, Button, Badge } from '../../components/ui';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ rooms: 0, lecturers: 0, conflicts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [rooms, lecturers] = await Promise.all([roomApi.list(), lecturerApi.list()]);
        setStats((s) => ({ ...s, rooms: rooms.length, lecturers: lecturers.length }));
      } catch (_) {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  const roleLabel: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    TRAINING_STAFF: 'Chuyên viên Phòng Đào tạo',
    FACILITY_STAFF: 'Phòng Hành chính Quản trị',
    LECTURER: 'Giảng viên',
    DEPARTMENT_HEAD: 'Trưởng bộ môn',
  };

  const quickActions = [
    {
      label: 'Xem thời khóa biểu',
      icon: <CalendarDays className="w-5 h-5" />,
      to: '/schedule',
      roles: ['ADMIN', 'TRAINING_STAFF', 'LECTURER', 'DEPARTMENT_HEAD'],
      color: 'blue',
    },
    {
      label: 'Quản lý phòng học',
      icon: <Building2 className="w-5 h-5" />,
      to: '/rooms',
      roles: ['ADMIN', 'FACILITY_STAFF', 'TRAINING_STAFF'],
      color: 'green',
    },
    {
      label: 'Quản lý giảng viên',
      icon: <GraduationCap className="w-5 h-5" />,
      to: '/lecturers',
      roles: ['ADMIN', 'TRAINING_STAFF', 'DEPARTMENT_HEAD'],
      color: 'purple',
    },
    {
      label: 'Lớp học phần',
      icon: <BookOpen className="w-5 h-5" />,
      to: '/classes',
      roles: ['ADMIN', 'TRAINING_STAFF', 'DEPARTMENT_HEAD'],
      color: 'amber',
    },
  ].filter((a) => a.roles.includes(user?.role ?? ''));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Tổng quan</h1>
          <p className="text-ink-muted text-sm mt-0.5">
            Xin chào, <span className="font-medium text-ink">{user?.full_name}</span> —{' '}
            <Badge label={roleLabel[user?.role ?? ''] ?? ''} color="blue" />
          </p>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Phòng học"
            value={stats.rooms}
            icon={<Building2 className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Giảng viên"
            value={stats.lecturers}
            icon={<GraduationCap className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Lớp học phần"
            value="—"
            icon={<BookOpen className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            label="Xung đột lịch"
            value={stats.conflicts}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="purple"
          />
        </div>
      )}

      {/* Quick actions */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-4">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-surface-border hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-surface text-ink-muted group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                {action.icon}
              </div>
              <span className="text-xs font-medium text-ink-muted group-hover:text-primary-700 text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Solver CTA — chỉ hiện với ADMIN/TRAINING_STAFF */}
      {['ADMIN', 'TRAINING_STAFF'].includes(user?.role ?? '') && (
        <Card className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Xếp lịch tự động</h2>
              <p className="text-primary-200 text-sm mt-1">
                Chạy thuật toán ASP (Clingo) để sinh thời khóa biểu tối ưu
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/schedule')} className="shrink-0">
              <Play className="w-4 h-4" />
              Chạy solver
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
