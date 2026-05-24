import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import OrdersPage from './pages/OrdersPage';
import AuthPage from './pages/AuthPage'; 


export default function App() {
  return (
      <BrowserRouter>
          <Routes>

              <Route path="/" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />     
              <Route path="/Dashboard" element={<Layout><div>Dashboard</div></Layout>} />    
              
              <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
          </Routes>
    </BrowserRouter>
  );
}