import { Navigate, Route, Routes } from 'react-router-dom';
import {
  ContactsPage,
  CreateContactPage,
  DealsPage,
  HomePage,
  LoginPage,
  SettingsPage,
} from '../pages';
import { RequireAuth } from './RequireAuth';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/contacts"
        element={
          <RequireAuth>
            <ContactsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/contacts/new"
        element={
          <RequireAuth>
            <CreateContactPage />
          </RequireAuth>
        }
      />
      <Route
        path="/deals"
        element={
          <RequireAuth>
            <DealsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
