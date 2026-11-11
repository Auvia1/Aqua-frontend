import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { GuestOnly, RequireAuth } from '@/context/AuthProvider';
import { AuthPage } from '@/features/auth/AuthPage';
import { HomePage } from '@/features/home/HomePage';
import { CloseCyclePage } from '@/features/ponds/CloseCyclePage';
import { PondDetailPage } from '@/features/ponds/PondDetailPage';
import { PondFormPage } from '@/features/ponds/PondFormPage';
import { PondsPage } from '@/features/ponds/PondsPage';
import { StartCyclePage } from '@/features/ponds/StartCyclePage';
import { ExpensePage } from '@/features/add/ExpensePage';
import { FeedPage } from '@/features/add/FeedPage';
import { LabourPage } from '@/features/add/LabourPage';
import { SalePage } from '@/features/add/SalePage';
import { CommonFormPage } from '@/features/common/CommonFormPage';
import { CommonPage } from '@/features/common/CommonPage';
import { DuesPage } from '@/features/dues/DuesPage';
import { PartyDetailPage } from '@/features/dues/PartyDetailPage';
import { LedgerPage } from '@/features/ledger/LedgerPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { CategoriesPage } from '@/features/settings/CategoriesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { TeamPage } from '@/features/settings/TeamPage';
import { AddRedirectPage } from '@/pages/AddRedirectPage';
import { DevUiPage } from '@/pages/dev/DevUiPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/ponds" element={<PondsPage />} />
          <Route path="/ponds/new" element={<PondFormPage />} />
          <Route path="/ponds/:id" element={<PondDetailPage />} />
          <Route path="/ponds/:id/edit" element={<PondFormPage />} />
          <Route path="/ponds/:id/start-cycle" element={<StartCyclePage />} />
          <Route path="/ponds/:id/close-cycle" element={<CloseCyclePage />} />
          <Route path="/add" element={<AddRedirectPage />} />
          <Route path="/add/expense" element={<ExpensePage />} />
          <Route path="/add/feed" element={<FeedPage />} />
          <Route path="/add/labour" element={<LabourPage />} />
          <Route path="/add/sale" element={<SalePage />} />
          <Route path="/common" element={<CommonPage />} />
          <Route path="/common/new" element={<CommonFormPage />} />
          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="/dues" element={<DuesPage />} />
          <Route path="/dues/:partyId" element={<PartyDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/categories" element={<CategoriesPage />} />
          <Route path="/settings/team" element={<TeamPage />} />
          <Route path="/dev/ui" element={<DevUiPage />} />
          <Route path="*" element={<PlaceholderPage title="Not found" />} />
        </Route>
      </Route>
    </Routes>
  );
}
