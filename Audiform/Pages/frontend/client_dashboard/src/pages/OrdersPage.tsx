import { useState, useEffect } from 'react';
import { Typography, Box, Alert, CircularProgress } from '@mui/material';
import OrdersTable from '../components/orders/OrdersTable';
import { mockOrders } from '../data/mockOrders';
import type { Order } from '../types/order';

export default function OrdersPage(){
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simuleer een API-aanroep met een korte vertraging
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      <Typography gutterBottom sx={{ variant: 'h4',  fontWeight: 'bold'}}>
        Mijn Actieve Bestellingen
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        Hier zie je een overzicht van al je lopende bestellingen en hun huidige status.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Alert severity="info">Je hebt momenteel geen actieve bestellingen.</Alert>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </Box>
  );
}