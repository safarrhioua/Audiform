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

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/account" element={<Layout><AccountPage /></Layout>} />
                <Route path="/medewerkerportaal" element={<Layout><MedewerkerPortaal /></Layout>} />
                <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
                <Route path="/bestelpagina" element={<Layout><Bestelpagina /></Layout>} />
                <Route path="/configuratie" element={<Layout><Configuratiepagina /></Layout>} />
                <Route path="/configuratie/:templateId" element={<Layout><Configuratiepagina /></Layout>} />
                <Route path="/bestelling-afronden" element={<Layout><BestellingAfronden /></Layout>} />
            </Routes>
        </BrowserRouter>
    );
}
