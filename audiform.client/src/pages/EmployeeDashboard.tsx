import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useEmployeeOrders } from '../hooks/useEmployeeOrders';
import EmployeeOrdersTable from '../components/orders/EmployeeOrdersTable';

export default function EmployeeDashboard() {
  const { orders, loading, error, updateStatus } = useEmployeeOrders();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Medewerker Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overzicht van alle orders. Pas de status aan via de knop of dropdown.
        </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && orders.length === 0 && (
        <Typography color="text.secondary">Geen orders gevonden.</Typography>
      )}

      {!loading && !error && orders.length > 0 && (
        <EmployeeOrdersTable orders={orders} onStatusChange={updateStatus} />
      )}
    </Box>
  );
}