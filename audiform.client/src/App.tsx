import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import Bestelpagina from "./pages/Bestelpagina";
import Configuratiepagina from "./pages/Configuratiepagina";
import BestellingAfronden from "./pages/BestellingAfronden";

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Bestelpagina />} />
                    <Route path="/configuratie/:templateId" element={<Configuratiepagina />} />
                    <Route path="/bestelling-afronden" element={<BestellingAfronden />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/orders" element={<OrdersPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
