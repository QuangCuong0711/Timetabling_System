import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { lecturerApi } from '../../api/services';
import { useAuthStore } from '../../store/auth.store';
import { Button, Card, Table, Modal, Input, Badge, Spinner } from '../../components/ui';
import type { Lecturer, BusySlot, PreferenceSlot } from '../../types';
import { DAY_LABELS, PERIOD_LABELS } from '../../types';

const DAYS = [1, 2, 3, 4, 5, 6];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ── Slot Grid picker ─────────────────────────────────────────
function SlotGrid({
  busy,
  preferences,
  lecturerId,
  onAddBusy,
  onAddPref,
  isOwner,
}: {
  busy: BusySlot[];
  preferences: PreferenceSlot[];
  lecturerId: number;
  isOwner: boolean;
  onAddBusy: (day: number, period: number, reason: string) => void;
  onAddPref: (day: number, period: number, isPrefer: boolean) => void;
}) {
  const busySet = new Set(busy.map((b) => `${b.day}-${b.period}`));
  const preferSet = new Set(
    preferences.filter((p) => p.is_prefer).map((p) => `${p.day}-${p.period}`)
  );
  const dislikeSet = new Set(
    preferences.filter((p) => !p.is_prefer).map((p) => `${p.day}-${p.period}`)
  );

  const handleClick = (day: number, period: number) => {
    if (!isOwner) return;
    const key = `${day}-${period}`;
    if (busySet.has(key)) return; // đã bận, không toggle
    if (preferSet.has(key)) {
      onAddPref(day, period, false); // prefer → dislike
    } else if (dislikeSet.has(key)) {
      // dislike → clear (gọi lại prefer với cùng slot để toggle)
      onAddPref(day, period, true);
    } else {
      onAddPref(day, period, true); // empty → prefer
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-10 p-1 text-ink-light border border-surface-border bg-surface" />
            {DAYS.map((d) => (
              <th
                key={d}
                className="p-1 text-center font-medium text-ink border border-surface-border bg-surface w-16"
              >
                {DAY_LABELS[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period}>
              <td className="p-1 text-center text-ink-muted border border-surface-border bg-surface/50 font-medium">
                {PERIOD_LABELS[period]}
              </td>
              {DAYS.map((day) => {
                const key = `${day}-${period}`;
                const isBusy = busySet.has(key);
                const isPrefer = preferSet.has(key);
                const isDislike = dislikeSet.has(key);
                return (
                  <td key={day} className="border border-surface-border p-0.5 h-8">
                    <div
                      onClick={() => handleClick(day, period)}
                      className={clsx(
                        'h-full w-full rounded transition-colors',
                        isOwner && !isBusy && 'cursor-pointer',
                        isBusy && 'bg-red-200 border border-red-400',
                        isPrefer && 'bg-emerald-200 border border-emerald-400',
                        isDislike && 'bg-amber-100 border border-amber-300',
                        !isBusy && !isPrefer && !isDislike && isOwner && 'hover:bg-primary-50'
                      )}
                      title={isBusy ? 'Bận' : isPrefer ? 'Ưu tiên' : isDislike ? 'Không thích' : ''}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-200 border border-red-400 inline-block" />
          Bận (đã duyệt)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400 inline-block" />
          Ưu tiên
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
          Không thích
        </span>
      </div>
      {isOwner && (
        <p className="text-xs text-ink-light mt-1">Nhấn vào ô để chuyển trạng thái ưu tiên</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function LecturersPage() {
  const { user } = useAuthStore();
  const canEdit = ['ADMIN', 'TRAINING_STAFF', 'DEPARTMENT_HEAD'].includes(user?.role ?? '');
  const isLecturer = user?.role === 'LECTURER';

  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // CRUD modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lecturer | null>(null);
  const [form, setForm] = useState<Partial<Lecturer>>({ full_name: '', department: '' });

  // Slots modal
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [activeLecturer, setActiveLecturer] = useState<Lecturer | null>(null);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [prefSlots, setPrefSlots] = useState<PreferenceSlot[]>([]);
  const [busyReason, setBusyReason] = useState('');

  const load = async () => {
    try {
      setLecturers(await lecturerApi.list());
    } catch (_) {
      toast.error('Không tải được danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openSlots = async (l: Lecturer) => {
    setActiveLecturer(l);
    const [busy, pref] = await Promise.all([
      lecturerApi.getBusy(l.id),
      lecturerApi.getPreference(l.id),
    ]);
    setBusySlots(busy);
    setPrefSlots(pref);
    setSlotsOpen(true);
  };

  const handleAddPref = async (day: number, period: number, isPrefer: boolean) => {
    if (!activeLecturer) return;
    try {
      await lecturerApi.addPreference({
        lecturer_id: activeLecturer.id,
        day,
        period,
        is_prefer: isPrefer,
      });
      const updated = await lecturerApi.getPreference(activeLecturer.id);
      setPrefSlots(updated);
    } catch (_) {
      toast.error('Lỗi cập nhật ưu tiên');
    }
  };

  const handleAddBusy = async () => {
    if (!activeLecturer || !busyReason.trim()) return toast.error('Nhập lý do bận');
    // For simplicity, this would open a sub-modal to pick day/period
    toast('Chức năng khai báo bận: chọn slot trực tiếp từ API');
  };

  const handleSave = async () => {
    if (!form.full_name?.trim()) return toast.error('Nhập tên giảng viên');
    setSaving(true);
    try {
      if (editing) {
        await lecturerApi.update(editing.id, form);
        toast.success('Cập nhật thành công');
      } else {
        await lecturerApi.create(form);
        toast.success('Thêm giảng viên thành công');
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
    if (!confirm(`Xóa giảng viên "${name}"?`)) return;
    try {
      await lecturerApi.remove(id);
      toast.success('Đã xóa');
      load();
    } catch (_) {
      toast.error('Không xóa được');
    }
  };

  const filtered = lecturers.filter(
    (l) =>
      l.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.department?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'full_name', header: 'Họ tên' },
    { key: 'department', header: 'Bộ môn', render: (l: Lecturer) => l.department ?? '—' },
    {
      key: 'slots',
      header: 'Lịch / Ưu tiên',
      render: (l: Lecturer) => (
        <Button variant="ghost" size="sm" onClick={() => openSlots(l)}>
          <Clock className="w-4 h-4" /> Xem lịch
        </Button>
      ),
    },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: '',
            render: (l: Lecturer) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(l);
                    setForm(l);
                    setModalOpen(true);
                  }}
                  className="p-1.5 text-ink-light hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(l.id, l.full_name)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Giảng viên</h1>
          <p className="text-sm text-ink-muted mt-0.5">{lecturers.length} giảng viên</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ full_name: '', department: '' });
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Thêm giảng viên
          </Button>
        )}
      </div>

      <Card>
        <div className="p-4 border-b border-surface-border">
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} data={filtered} emptyText="Chưa có giảng viên nào" />
        )}
      </Card>

      {/* CRUD Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Cập nhật giảng viên' : 'Thêm giảng viên'}
      >
        <div className="space-y-4">
          <Input
            label="Họ tên *"
            value={form.full_name ?? ''}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Nguyễn Văn A"
          />
          <Input
            label="Bộ môn"
            value={form.department ?? ''}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="Bộ môn CNTT"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Slots Modal */}
      <Modal
        open={slotsOpen}
        onClose={() => setSlotsOpen(false)}
        title={`Lịch — ${activeLecturer?.full_name}`}
        size="lg"
      >
        <div className="space-y-4">
          <SlotGrid
            busy={busySlots}
            preferences={prefSlots}
            lecturerId={activeLecturer?.id ?? 0}
            isOwner={isLecturer || canEdit}
            onAddBusy={handleAddBusy}
            onAddPref={handleAddPref}
          />
          {(isLecturer || canEdit) && (
            <div className="flex gap-3 pt-2 border-t border-surface-border">
              <Input
                placeholder="Lý do khai báo bận..."
                value={busyReason}
                onChange={(e) => setBusyReason(e.target.value)}
                className="flex-1"
              />
              <Button variant="secondary" onClick={handleAddBusy}>
                <Clock className="w-4 h-4" /> Khai báo bận
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
