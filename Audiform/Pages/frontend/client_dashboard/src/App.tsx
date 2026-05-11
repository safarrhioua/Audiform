import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}