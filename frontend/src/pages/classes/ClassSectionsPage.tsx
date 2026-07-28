import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { classSectionApi, semesterApi } from '../../api/services';
import { Button, Card, Table, Modal, Input, Select, Badge, Spinner } from '../../components/ui';
import type { ClassSection, Semester, RoomType } from '../../types';

const ROOM_TYPE_OPTIONS = [
  { value: 'normal', label: 'Phòng thường' },
  { value: 'lab', label: 'Phòng Lab' },
  { value: 'computer', label: 'Phòng máy tính' },
];

const EMPTY: Partial<ClassSection> = {
  course_id: '',
  course_name: '',
  students_count: 30,
  room_type: 'normal',
  sessions_per_week: 2,
  credits: 3,
};

export default function ClassSectionsPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassSection | null>(null);
  const [form, setForm] = useState<Partial<ClassSection>>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    semesterApi
      .list()
      .then((data) => {
        setSemesters(data);
        const active = data.find((s: Semester) => s.is_active);
        if (active) setSelectedSemester(active.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;
    setLoading(true);
    classSectionApi
      .list(selectedSemester)
      .then(setClasses)
      .catch(() => toast.error('Không tải được lớp học phần'))
      .finally(() => setLoading(false));
  }, [selectedSemester]);

  const handleSave = async () => {
    if (!form.course_id?.trim()) return toast.error('Nhập mã môn học');
    setSaving(true);
    try {
      const payload = { ...form, semester_id: selectedSemester };
      if (editing) {
        await classSectionApi.update(editing.id, payload);
        toast.success('Cập nhật thành công');
      } else {
        await classSectionApi.create(payload);
        toast.success('Thêm lớp học phần thành công');
      }
      setModalOpen(false);
      classSectionApi.list(selectedSemester).then(setClasses);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa lớp "${name}"?`)) return;
    try {
      await classSectionApi.remove(id);
      toast.success('Đã xóa');
      classSectionApi.list(selectedSemester).then(setClasses);
    } catch (_) {
      toast.error('Không xóa được');
    }
  };

  const semesterOptions = [
    { value: '', label: '-- Chọn kỳ học --' },
    ...semesters.map((s) => ({ value: s.id, label: s.name })),
  ];

  const ROOM_LABEL: Record<RoomType, string> = {
    normal: 'Thường',
    lab: 'Lab',
    computer: 'Máy tính',
  };
  const ROOM_COLOR: Record<RoomType, 'blue' | 'green' | 'amber'> = {
    normal: 'blue',
    lab: 'green',
    computer: 'amber',
  };

  const columns = [
    {
      key: 'course_id',
      header: 'Mã môn',
      render: (c: ClassSection) => <span className="font-mono font-medium">{c.course_id}</span>,
    },
    { key: 'course_name', header: 'Tên môn' },
    { key: 'credits', header: 'TC', render: (c: ClassSection) => c.credits },
    { key: 'students_count', header: 'SV', render: (c: ClassSection) => c.students_count },
    {
      key: 'sessions_per_week',
      header: 'Tiết/tuần',
      render: (c: ClassSection) => c.sessions_per_week,
    },
    {
      key: 'room_type',
      header: 'Loại phòng',
      render: (c: ClassSection) => (
        <Badge label={ROOM_LABEL[c.room_type]} color={ROOM_COLOR[c.room_type]} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c: ClassSection) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(c);
              setForm(c);
              setModalOpen(true);
            }}
            className="p-1.5 text-ink-light hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(c.id, c.course_id)}
            className="p-1.5 text-ink-light hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Lớp học phần</h1>
          <p className="text-sm text-ink-muted mt-0.5">{classes.length} lớp trong kỳ</p>
        </div>
        <div className="flex gap-3">
          <Select
            options={semesterOptions}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-48"
          />
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY, semester_id: selectedSemester });
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Thêm lớp HP
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <Table
            columns={columns}
            data={classes}
            emptyText="Chưa có lớp học phần nào trong kỳ này"
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Cập nhật lớp HP' : 'Thêm lớp học phần'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã môn *"
              placeholder="CS101"
              value={form.course_id ?? ''}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            />
            <Input
              label="Tên môn"
              placeholder="Lập trình cơ bản"
              value={form.course_name ?? ''}
              onChange={(e) => setForm({ ...form, course_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Số TC"
              type="number"
              min={1}
              value={form.credits ?? 3}
              onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
            />
            <Input
              label="Số SV"
              type="number"
              min={1}
              value={form.students_count ?? 30}
              onChange={(e) => setForm({ ...form, students_count: Number(e.target.value) })}
            />
            <Input
              label="Tiết/tuần"
              type="number"
              min={1}
              max={5}
              value={form.sessions_per_week ?? 2}
              onChange={(e) => setForm({ ...form, sessions_per_week: Number(e.target.value) })}
            />
          </div>
          <Select
            label="Loại phòng yêu cầu"
            options={ROOM_TYPE_OPTIONS}
            value={form.room_type ?? 'normal'}
            onChange={(e) => setForm({ ...form, room_type: e.target.value as RoomType })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Cập nhật' : 'Thêm lớp'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
