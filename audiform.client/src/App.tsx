import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Bestelpagina from './pages/Bestelpagina';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import { MedewerkerPortaal } from './pages/MedewerkerPortaal';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import Configuratiepagina from './pages/Configuratiepagina';
import BestellingAfronden from './pages/BestellingAfronden';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeDashboard from './pages/EmployeeDashboard';


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Layout><AccountPage /></Layout></ProtectedRoute>} />
                <Route path="/medewerkerportaal" element={<ProtectedRoute><Layout><MedewerkerPortaal /></Layout></ProtectedRoute>} />
                <Route path="/medewerker" element={<ProtectedRoute><Layout><EmployeeDashboard /></Layout></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
                <Route path="/bestelpagina" element={<ProtectedRoute><Layout><Bestelpagina /></Layout></ProtectedRoute>} />
                <Route path="/configuratie" element={<ProtectedRoute><Layout><Configuratiepagina /></Layout></ProtectedRoute>} />
                <Route path="/configuratie/:templateId" element={<ProtectedRoute><Layout><Configuratiepagina /></Layout></ProtectedRoute>} />
                <Route path="/bestelling-afronden" element={<ProtectedRoute><Layout><BestellingAfronden /></Layout></ProtectedRoute>} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

            </Routes>
        </BrowserRouter>
    );
}
