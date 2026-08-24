import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import ApplyLeavePage from './pages/ApplyLeavePage';
import MyLeavesPage from './pages/MyLeavesPage';

// Task 2: Lazy-loaded route for an HR Panel using React.lazy + Suspense
const HRPanel = lazy(() => import('./pages/HRPanel'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Route: / -> LoginPage */}
              <Route path="/" element={<LoginPage />} />

              {/* Route: /apply -> ApplyLeavePage (protected) */}
              <Route
                path="/apply"
                element={
                  <ProtectedRoute>
                    <ApplyLeavePage />
                  </ProtectedRoute>
                }
              />

              {/* Route: /my-leaves -> MyLeavesPage (protected) */}
              <Route
                path="/my-leaves"
                element={
                  <ProtectedRoute>
                    <MyLeavesPage />
                  </ProtectedRoute>
                }
              />

              {/* Route: /hr -> HRPanel (lazy-loaded, role 'hr' required) */}
              <Route
                path="/hr"
                element={
                  <ProtectedRoute requiredRole="hr">
                    <Suspense
                      fallback={
                        <div className="state-container">
                          <div className="spinner"></div>
                          <p>Loading HR Panel (Lazy-loaded)...</p>
                        </div>
                      }
                    >
                      <HRPanel />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="site-footer">
            <p>© 2026 TechSolutions Pvt Ltd • Employee Leave Management System (ITUE301 SET C)</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
