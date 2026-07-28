import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { scheduleApi, semesterApi } from '../../api/services';
import { useAuthStore } from '../../store/auth.store';
import { Card, Select, Spinner } from '../../components/ui';
import type { Semester } from '../../types';
import { DAY_LABELS, PERIOD_LABELS } from '../../types';

const DAYS = [1, 2, 3, 4, 5, 6];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MySchedulePage() {
  const { user } = useAuthStore();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (!selectedSemester || !user) return;
    setLoading(true);
    scheduleApi
      .getByLecturer(selectedSemester, user.id)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [selectedSemester, user]);

  const cellMap = new Map<string, any>();
  for (const e of entries) cellMap.set(`${e.day}-${e.period}`, e);

  const semesterOptions = [
    { value: '', label: '-- Chọn kỳ học --' },
    ...semesters.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Lịch dạy của tôi</h1>
          <p className="text-sm text-ink-muted mt-0.5">{user?.full_name}</p>
        </div>
        <Select
          options={semesterOptions}
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-52"
        />
      </div>

      <Card className="p-4">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="w-12 p-2 border border-surface-border bg-surface text-ink-light">
                    Tiết
                  </th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      className="p-2 text-center font-semibold border border-surface-border bg-surface"
                    >
                      {DAY_LABELS[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period}>
                    <td className="p-2 text-center text-ink-muted border border-surface-border bg-surface/50 font-medium">
                      {PERIOD_LABELS[period]}
                    </td>
                    {DAYS.map((day) => {
                      const entry = cellMap.get(`${day}-${period}`);
                      return (
                        <td key={day} className="border border-surface-border p-1 h-16 align-top">
                          {entry ? (
                            <div className="h-full rounded p-1.5 bg-primary-50 border border-primary-200 text-primary-800">
                              <p className="font-semibold leading-tight truncate">
                                {entry.class_section?.course_id}
                              </p>
                              <p className="text-[10px] opacity-70">{entry.room?.name}</p>
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
        )}
        {!loading && entries.length === 0 && (
          <p className="text-center text-ink-muted text-sm py-10">Chưa có lịch dạy trong kỳ này</p>
        )}
      </Card>
    </div>
  );
}
