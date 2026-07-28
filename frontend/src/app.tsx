import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppLayout from './components/layout/AppLayout';
import { RequireAuth } from './components/layout/RequireAuth';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SchedulePage from './pages/schedule/SchedulePage';
import MySchedulePage from './pages/schedule/MySchedulePage';
import RoomsPage from './pages/room/RoomsPage';
import LecturersPage from './pages/lecturer/LecturersPage';
import UsersPage from './pages/user/UsersPage';
import ClassSectionsPage from './pages/classes/ClassSectionsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected — requires login */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* TKB — tất cả role (trừ FACILITY_STAFF) */}
              <Route
                element={
                  <RequireAuth roles={['ADMIN', 'TRAINING_STAFF', 'LECTURER', 'DEPARTMENT_HEAD']} />
                }
              >
                <Route path="/schedule" element={<SchedulePage />} />
              </Route>

              {/* Lịch của tôi — chỉ Lecturer */}
              <Route element={<RequireAuth roles={['LECTURER']} />}>
                <Route path="/my-schedule" element={<MySchedulePage />} />
              </Route>

              {/* Lớp HP */}
              <Route
                element={<RequireAuth roles={['ADMIN', 'TRAINING_STAFF', 'DEPARTMENT_HEAD']} />}
              >
                <Route path="/classes" element={<ClassSectionsPage />} />
              </Route>

              {/* Giảng viên */}
              <Route
                element={
                  <RequireAuth roles={['ADMIN', 'TRAINING_STAFF', 'DEPARTMENT_HEAD', 'LECTURER']} />
                }
              >
                <Route path="/lecturers" element={<LecturersPage />} />
              </Route>

              {/* Phòng học */}
              <Route
                element={<RequireAuth roles={['ADMIN', 'FACILITY_STAFF', 'TRAINING_STAFF']} />}
              >
                <Route path="/rooms" element={<RoomsPage />} />
              </Route>

              {/* Tài khoản — chỉ ADMIN */}
              <Route element={<RequireAuth roles={['ADMIN']} />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: '14px',
            borderRadius: '10px',
            boxShadow: '0 4px 16px -2px rgb(0 0 0 / 0.1)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
