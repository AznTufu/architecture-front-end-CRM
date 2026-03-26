import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';

const ContactsPage = lazy(async () => {
  const module = await import('../pages/ContactsPage');

  return { default: module.ContactsPage };
});

const CreateContactPage = lazy(async () => {
  const module = await import('../pages/CreateContactPage');

  return { default: module.CreateContactPage };
});

const DealsPage = lazy(async () => {
  const module = await import('../pages/DealsPage');

  return { default: module.DealsPage };
});

const HomePage = lazy(async () => {
  const module = await import('../pages/HomePage');

  return { default: module.HomePage };
});

const LoginPage = lazy(async () => {
  const module = await import('../pages/LoginPage');

  return { default: module.LoginPage };
});

const SettingsPage = lazy(async () => {
  const module = await import('../pages/SettingsPage');

  return { default: module.SettingsPage };
});

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
