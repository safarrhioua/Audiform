import { Typography, Box, Alert, CircularProgress, TextField, Pagination } from '@mui/material';
import OrdersTable from '../components/orders/OrdersTable';
import { useOrders } from '../hooks/useOrders';

export default function OrdersPage() {
    const { orders, loading, query, setQuery, page, setPage, totalCount } = useOrders();

    return (
        <Box>
            <TextField
                label="Zoeken op bestelnummer, klantnaam of klantnummer"
                variant="outlined"
                fullWidth
                sx={{ mb: 3 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Mijn Bestellingen
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Hier zie je een overzicht van al je bestellingen en hun huidige status.
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : orders.length === 0 ? (
                <Alert severity="info">Geen bestellingen gevonden.</Alert>
            ) : (
                <>
                    <OrdersTable orders={orders} />
                    {!query.trim() && totalCount > 20 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={Math.ceil(totalCount / 20)}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}