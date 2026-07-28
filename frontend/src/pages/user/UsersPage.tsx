import { useEffect, useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/services';
import { Button, Card, Table, Modal, Input, Select, Badge, Spinner } from '../../components/ui';
import type { Role } from '../../types';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'EDUCATION_STAFF', label: 'CV Phòng Đào tạo' },
  { value: 'FACILITY_STAFF', label: 'Phòng HCQT' },
  { value: 'LECTURER', label: 'Giảng viên' },
  { value: 'DEPT_HEAD', label: 'Trưởng bộ môn' },
];

const ROLE_COLOR: Record<Role, 'red' | 'blue' | 'green' | 'amber' | 'purple'> = {
  ADMIN: 'red',
  EDUCATION_STAFF: 'blue',
  FACILITY_STAFF: 'green',
  LECTURER: 'amber',
  DEPT_HEAD: 'purple',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'LECTURER' as Role,
  });

  const load = async () => {
    try {
      setUsers(await userApi.list());
    } catch (_) {
      toast.error('Không tải được danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.full_name) {
      return toast.error('Điền đầy đủ thông tin');
    }
    setSaving(true);
    try {
      await userApi.create(form);
      toast.success('Tạo tài khoản thành công');
      setModalOpen(false);
      setForm({ username: '', password: '', full_name: '', role: 'LECTURER' });
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Lỗi tạo tài khoản');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'full_name', header: 'Họ tên' },
    {
      key: 'username',
      header: 'Tài khoản',
      render: (u: any) => <span className="font-mono text-sm">{u.username}</span>,
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u: any) => {
        const opt = ROLE_OPTIONS.find((r) => r.value === u.role);
        return <Badge label={opt?.label ?? u.role} color={ROLE_COLOR[u.role as Role] ?? 'gray'} />;
      },
    },
    {
      key: 'is_active',
      header: 'Trạng thái',
      render: (u: any) => (
        <Badge
          label={u.is_active !== false ? 'Hoạt động' : 'Tạm khóa'}
          color={u.is_active !== false ? 'green' : 'gray'}
        />
      ),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Tài khoản</h1>
          <p className="text-sm text-ink-muted mt-0.5">{users.length} tài khoản trong hệ thống</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Tạo tài khoản
        </Button>
      </div>

      <Card className="p-4 bg-amber-50 border-amber-200 flex items-center gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          Trang này chỉ dành cho Quản trị viên. Phân quyền cẩn thận trước khi tạo tài khoản.
        </p>
      </Card>

      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} data={users} emptyText="Chưa có tài khoản nào" />
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tạo tài khoản mới">
        <div className="space-y-4">
          <Input
            label="Họ tên *"
            placeholder="Nguyễn Văn A"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            label="Tên đăng nhập *"
            placeholder="nguyenvana"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            label="Mật khẩu *"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Vai trò"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Tạo tài khoản
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
