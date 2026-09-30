import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Passport from './pages/Passport';
import PublicVerify from './pages/PublicVerify';
import Impact from './pages/Impact';
import Leaderboard from './pages/Leaderboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import WasteRecords from './pages/admin/WasteRecords';
import BinMonitoring from './pages/admin/BinMonitoring';
import LifecycleManagement from './pages/admin/LifecycleManagement';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify/:id" element={<PublicVerify />} />

              {/* Protected Student / User Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner"
                element={
                  <ProtectedRoute>
                    <Scanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passport/:id"
                element={
                  <ProtectedRoute>
                    <Passport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/impact"
                element={
                  <ProtectedRoute>
                    <Impact />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/waste"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <WasteRecords />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bins"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <BinMonitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/lifecycle"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <LifecycleManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
