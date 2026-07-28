import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { roomApi } from '../../api/services';
import { useAuthStore } from '../../store/auth.store';
import { Button, Card, Table, Modal, Input, Select, Badge, Spinner } from '../../components/ui';
import type { Room, RoomType } from '../../types';

const ROOM_TYPE_OPTIONS = [
  { value: 'LT', label: 'Lý thuyết' },
  { value: 'TH', label: 'Thực hành' },
];

const ROOM_TYPE_COLOR: Record<RoomType, 'blue' | 'green' | 'amber'> = {
  TH: 'blue',
  LT: 'green',
};
const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  TH: 'Thực hành',
  LT: 'Lý Thuyết',
};

const EMPTY: Partial<Room> = { name: '', capacity: 40, room_type: 'LT' };

export default function RoomsPage() {
  const { user } = useAuthStore();
  const canEdit = ['ADMIN', 'FACILITY_STAFF'].includes(user?.role ?? '');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<Partial<Room>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const data = await roomApi.list();
      setRooms(data);
    } catch (_) {
      toast.error('Không tải được danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };
  const openEdit = (r: Room) => {
    setEditing(r);
    setForm(r);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error('Vui lòng nhập tên phòng');
    setSaving(true);
    try {
      if (editing) {
        await roomApi.update(editing.id, form);
        toast.success('Cập nhật phòng thành công');
      } else {
        await roomApi.create(form);
        toast.success('Thêm phòng thành công');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa phòng "${name}"?`)) return;
    try {
      await roomApi.remove(id);
      toast.success('Đã xóa phòng');
      load();
    } catch (_) {
      toast.error('Không xóa được phòng');
    }
  };

  const filtered = rooms.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.room_type?.includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Tên phòng' },
    {
      key: 'room_type',
      header: 'Loại',
      render: (r: Room) => (
        <Badge label={ROOM_TYPE_LABEL[r.room_type]} color={ROOM_TYPE_COLOR[r.room_type]} />
      ),
    },
    { key: 'capacity', header: 'Sức chứa', render: (r: Room) => `${r.capacity} chỗ` },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: '',
            render: (r: Room) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(r)}
                  className="p-1.5 text-ink-light hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.name)}
                  className="p-1.5 text-ink-light hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Phòng học</h1>
          <p className="text-sm text-ink-muted mt-0.5">{rooms.length} phòng đang hoạt động</p>
        </div>
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Thêm phòng
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {ROOM_TYPE_OPTIONS.map((t) => {
          const count = rooms.filter((r) => r.room_type === t.value).length;
          return (
            <Card key={t.value} className="p-4 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-ink-light" />
              <div>
                <p className="text-xl font-bold text-ink">{count}</p>
                <p className="text-xs text-ink-muted">{t.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <div className="p-4 border-b border-surface-border">
          <Input
            placeholder="Tìm kiếm phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} data={filtered} emptyText="Chưa có phòng học nào" />
        )}
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Cập nhật phòng học' : 'Thêm phòng học'}
      >
        <div className="space-y-4">
          <Input
            label="Tên phòng *"
            placeholder="VD: A101, Lab B2..."
            value={form.name ?? ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label="Loại phòng"
            options={ROOM_TYPE_OPTIONS}
            value={form.room_type ?? 'normal'}
            onChange={(e) => setForm({ ...form, room_type: e.target.value as RoomType })}
          />
          <Input
            label="Sức chứa"
            type="number"
            min={1}
            value={form.capacity ?? 40}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Cập nhật' : 'Thêm phòng'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
