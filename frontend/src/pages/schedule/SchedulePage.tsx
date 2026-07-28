import { useState, useEffect } from 'react';
import { Play, Save, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { scheduleApi, semesterApi } from '../../api/services';
import { useAuthStore } from '../../store/auth.store';
import { Button, Card, Badge, Spinner, Select } from '../../components/ui';
import type { TimetableEntry, SolveResult, Semester, Conflict } from '../../types';
import { DAY_LABELS, PERIOD_LABELS } from '../../types';

// ── Timetable Grid ────────────────────────────────────────────
const DAYS = [1, 2, 3, 4, 5, 6];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const CELL_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-rose-50 border-rose-200 text-rose-800',
  'bg-cyan-50 border-cyan-200 text-cyan-800',
];

function colorForCourse(id: string) {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffff;
  return CELL_COLORS[Math.abs(hash) % CELL_COLORS.length];
}

interface GridCell {
  entry: TimetableEntry;
  conflict?: boolean;
}

function TimetableGrid({
  entries,
  conflicts,
  onCellClick,
}: {
  entries: TimetableEntry[];
  conflicts: Conflict[];
  onCellClick?: (entry: TimetableEntry) => void;
}) {
  const conflictEntryIds = new Set(conflicts.flatMap((c) => c.entries));

  const cellMap = new Map<string, TimetableEntry>();
  for (const e of entries) {
    cellMap.set(`${e.day}-${e.period}`, e);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[700px]">
        <thead>
          <tr>
            <th className="w-14 p-2 text-ink-light font-medium border border-surface-border bg-surface">
              Tiết
            </th>
            {DAYS.map((d) => (
              <th
                key={d}
                className="p-2 text-center font-semibold text-ink border border-surface-border bg-surface"
              >
                {DAY_LABELS[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period}>
              <td className="p-2 text-center text-ink-muted font-medium border border-surface-border bg-surface/50">
                {PERIOD_LABELS[period]}
              </td>
              {DAYS.map((day) => {
                const entry = cellMap.get(`${day}-${period}`);
                const hasConflict = entry && conflictEntryIds.has(entry.id);
                return (
                  <td key={day} className="border border-surface-border p-1 h-16 align-top">
                    {entry ? (
                      <div
                        onClick={() => onCellClick?.(entry)}
                        className={clsx(
                          'h-full rounded p-1.5 border cursor-pointer hover:opacity-90 transition-opacity',
                          hasConflict
                            ? 'bg-red-50 border-red-400 text-red-800'
                            : colorForCourse(entry.class_section?.course_id ?? '')
                        )}
                      >
                        {hasConflict && <AlertTriangle className="w-3 h-3 mb-0.5" />}
                        <p className="font-semibold leading-tight truncate">
                          {entry.class_section?.course_id}
                        </p>
                        <p className="text-[10px] opacity-70 truncate">{entry.room?.name}</p>
                        <p className="text-[10px] opacity-70 truncate">
                          {entry.lecturer?.full_name}
                        </p>
                      </div>
                    ) : (
                      <div className="h-full rounded bg-surface/30" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SchedulePage() {
  const { user } = useAuthStore();
  const canManage = ['ADMIN', 'TRAINING_STAFF'].includes(user?.role ?? '');

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [solveResult, setSolveResult] = useState<SolveResult | null>(null);

  const [loadingTkb, setLoadingTkb] = useState(false);
  const [solving, setSolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Load semesters
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

  // Load TKB when semester changes
  useEffect(() => {
    if (!selectedSemester) return;
    setLoadingTkb(true);
    scheduleApi
      .get(selectedSemester)
      .then(setEntries)
      .catch(() => toast.error('Không tải được thời khóa biểu'))
      .finally(() => setLoadingTkb(false));
  }, [selectedSemester]);

  const handleSolve = async () => {
    if (!selectedSemester) return toast.error('Chọn kỳ học trước');
    setSolving(true);
    setSolveResult(null);
    try {
      const result = await scheduleApi.solve(selectedSemester);
      setSolveResult(result);
      if (result.status === 'sat') {
        toast.success(`Xếp lịch thành công! (${result.solve_time_ms}ms, cost=${result.cost})`);
      } else if (result.status === 'unsat') {
        toast.error('Không tìm được lịch thỏa ràng buộc. ' + result.message);
      } else {
        toast.error('Solver timeout hoặc lỗi: ' + result.message);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Lỗi kết nối solver');
    } finally {
      setSolving(false);
    }
  };

  const handleSave = async () => {
    if (!solveResult?.timetable?.length) return;
    setSaving(true);
    try {
      await scheduleApi.save(selectedSemester, solveResult.timetable);
      toast.success('Đã lưu thời khóa biểu!');
      // Reload
      const updated = await scheduleApi.get(selectedSemester);
      setEntries(updated);
      setSolveResult(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckConflicts = async () => {
    if (!selectedSemester) return;
    setCheckingConflicts(true);
    try {
      const res = await scheduleApi.conflicts(selectedSemester);
      setConflicts(res.conflicts ?? []);
      if (res.total_conflicts === 0) toast.success('Không có xung đột lịch!');
      else toast.error(`Phát hiện ${res.total_conflicts} xung đột!`);
    } catch (_) {
      toast.error('Không kiểm tra được xung đột');
    } finally {
      setCheckingConflicts(false);
    }
  };

  const semesterOptions = [
    { value: '', label: '-- Chọn kỳ học --' },
    ...semesters.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="p-6 max-w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Thời khóa biểu</h1>
          <p className="text-sm text-ink-muted mt-0.5">Xem và quản lý lịch học theo kỳ</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={semesterOptions}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-52"
          />
          {canManage && (
            <>
              <Button
                variant="secondary"
                onClick={handleCheckConflicts}
                loading={checkingConflicts}
                size="sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Kiểm tra xung đột
              </Button>
              <Button onClick={handleSolve} loading={solving} size="sm">
                <Play className="w-4 h-4" />
                Chạy solver
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Conflict summary */}
      {conflicts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">
              Phát hiện {conflicts.length} xung đột — các ô màu đỏ trên lưới cần được xử lý
            </p>
          </div>
        </Card>
      )}

      {/* Solve result */}
      {solveResult?.status === 'sat' && (
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <p className="text-sm font-medium">
                Solver tìm được lịch tối ưu — {solveResult.timetable.length} slot, cost=
                {solveResult.cost}, thời gian={solveResult.solve_time_ms}ms
              </p>
            </div>
            <Button onClick={handleSave} loading={saving} size="sm">
              <Save className="w-4 h-4" />
              Lưu thời khóa biểu
            </Button>
          </div>
        </Card>
      )}

      {/* Timetable grid */}
      <Card className="p-4">
        {loadingTkb ? (
          <Spinner text="Đang tải thời khóa biểu..." />
        ) : entries.length === 0 && !solveResult ? (
          <div className="py-16 text-center">
            <CalendarDays className="w-12 h-12 text-ink-light mx-auto mb-3" />
            <p className="text-ink-muted text-sm">Chưa có thời khóa biểu cho kỳ này</p>
            {canManage && (
              <p className="text-xs text-ink-light mt-1">Nhấn "Chạy solver" để tạo tự động</p>
            )}
          </div>
        ) : (
          <TimetableGrid entries={entries} conflicts={conflicts} />
        )}
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-200 border border-red-400 inline-block" />
          Xung đột
        </span>
        <span>Nhấn vào ô để xem chi tiết / chỉnh sửa</span>
      </div>
    </div>
  );
}

// Fix missing import
function CalendarDays(props: any) {
  const { CalendarDays: CD } = require('lucide-react');
  return <CD {...props} />;
}
