import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import OrdersPage from './pages/OrdersPage';
import AuthPage from './pages/AuthPage'; 
import AccountPage from './pages/AccountPage';
import { MedewerkerPortaal }  from './pages/MedewerkerPortaal';


export default function App() {
  return (
      <BrowserRouter>
          <Routes>

              <Route path="/" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />     
              <Route path="/Dashboard" element={<Layout><div>Dashboard</div></Layout>} />    
              <Route path="/Account" element={<Layout><AccountPage /></Layout>} />    
              <Route path="/Medewerkerportaal" element={<MedewerkerPortaal />} />    
              
              <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
          </Routes>
    </BrowserRouter>
  );
}