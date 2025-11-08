// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Projects from './pages/Projects';

// Este componente protege las rutas
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
        <Route 
          path="/*" // Cualquier otra ruta
          element={
            <PrivateRoute>
              <DashboardLayout>
                {/* Aquí irán las rutas internas del dashboard */}
                <Routes>
                   <Route path="/" element={<Projects />} />
                   {/* Ejemplo de otra ruta: <Route path="/tasks" element={<TasksPage />} /> */}
                </Routes>
              </DashboardLayout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

// El componente principal envuelve todo en el AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;