import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from '@mui/material';
import OrderStatusChip from './OrderStatusChip';
import type { Order } from '../../types/order';
import SecondaryButton from '../buttons/SecondaryButton';
import { getEffectiveStatus } from '../../hooks/useOrders';

interface OrdersTableProps {
  orders: Order[];
}

const columns = ['Bestelnummer', 'Klant', 'Klantnummer', 'Besteldatum', 'Leverdatum', 'Status', 'Actie'] as const;

export default function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <TableContainer component={Paper} elevation={4}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            {columns.map((col) => (
              <TableCell key={col}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {col}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const effectiveStatus = getEffectiveStatus(order);
            return (
              <TableRow key={order.id} hover>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.patientName}</TableCell>
                <TableCell>{order.patientNumber}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString('nl-NL')}</TableCell>
                <TableCell>{new Date(order.deliveryDate).toLocaleDateString('nl-NL')}</TableCell>
                <TableCell>
                  <OrderStatusChip status={effectiveStatus} />
                </TableCell>
                <TableCell>
                  {(effectiveStatus === 'verzonden' || effectiveStatus === 'afgeleverd') && (
                    <SecondaryButton>Remake</SecondaryButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}