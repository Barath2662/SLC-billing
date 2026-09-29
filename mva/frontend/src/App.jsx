import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateBill from './pages/CreateBill';
import SearchBills from './pages/SearchBills';
import EditBill from './pages/EditBill';
import ViewBill from './pages/ViewBill';
import ChangePassword from './pages/ChangePassword';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-bill" element={<ProtectedRoute><CreateBill /></ProtectedRoute>} />
        <Route path="/search-bills" element={<ProtectedRoute><SearchBills /></ProtectedRoute>} />
        <Route path="/edit-bill/:billNumber" element={<ProtectedRoute><EditBill /></ProtectedRoute>} />
        <Route path="/view-bill/:billNumber" element={<ProtectedRoute><ViewBill /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
