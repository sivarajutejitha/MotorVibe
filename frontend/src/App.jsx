import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AboutPage } from './pages/AboutPage';

// Authenticated Application Pages
import { DashboardPage } from './pages/DashboardPage';
import { MotorsPage } from './pages/MotorsPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { AlertsPage } from './pages/AlertsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Authenticated Application Layout with Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/motors" element={<MotorsPage />} />
            <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
