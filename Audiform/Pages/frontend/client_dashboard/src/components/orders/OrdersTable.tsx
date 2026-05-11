import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from '@mui/material';
import OrderStatusChip from './OrderStatusChip';
import type { Order } from '../../types/order';

interface OrdersTableProps {
  orders: Order[];
}

const columns = ['Bestelnummer', 'Patiënt', 'Patiëntnummer', 'Besteldatum', 'Leverdatum', 'Status'] as const;

export default function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <TableContainer component={Paper} elevation={2}>
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
          {orders.map((order) => (
            <TableRow key={order.id} hover>
               <TableCell>{order.orderNumber}</TableCell>
              <TableCell>{order.patientName}</TableCell>
              <TableCell>{order.patientNumber}</TableCell>
              <TableCell>{order.orderDate}</TableCell>
              <TableCell>{order.askedDeliveryDate}</TableCell>
              <TableCell>
                <OrderStatusChip status={order.state.stateName} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}