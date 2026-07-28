import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/services';
import { useAuthStore } from '../../store/auth.store';
import { Button, Input } from '../../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(form.username, form.password);
      login(res.user, res.access_token);
      toast.success(`Chào mừng, ${res.user.full_name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Sai tài khoản hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-elevated mb-4">
            <CalendarDays className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Hệ thống xếp lịch</h1>
          <p className="text-ink-muted text-sm mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-elevated p-8 border border-surface-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Tài khoản"
              placeholder="Nhập tên đăng nhập"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              autoFocus
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-ink">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg bg-white text-ink placeholder-ink-light focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full justify-center" loading={loading} size="lg">
              Đăng nhập
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-light mt-6">
          Liên hệ Phòng Đào tạo nếu quên mật khẩu
        </p>
      </div>
    </div>
  );
}
