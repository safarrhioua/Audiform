import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  Button, Select, MenuItem, Box,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { Order } from '../../types/order';
import { STATUS_FLOW, getNextStatus, type WorkflowStatus } from '../../hooks/useEmployeeOrders';

interface Props {
  orders: Order[];
  onStatusChange: (orderId: number, newStatus: string) => void;
}

const columns = [
  'Bestelnummer', 'Patiënt', 'Patiëntnummer',
  'Besteldatum', 'Leverdatum', 'Status', 'Acties',
] as const;

export default function EmployeeOrdersTable({ orders, onStatusChange }: Props) {
  return (
    <TableContainer component={Paper} elevation={4}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            {columns.map(col => (
              <TableCell key={col}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {col}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => {
            const current = order.state.stateName;
            const next = getNextStatus(current);
            return (
              <TableRow key={order.id} hover>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.patientName}</TableCell>
                <TableCell>{order.patientNumber}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString('nl-NL')}</TableCell>
                <TableCell>{new Date(order.deliveryDate).toLocaleDateString('nl-NL')}</TableCell>
                <TableCell>{current}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {next && (
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => onStatusChange(order.id, next)}
                        sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                      >
                        {next}
                      </Button>
                    )}
                    <Select
                      size="small"
                      value={STATUS_FLOW.includes(current as WorkflowStatus) ? current : 'nieuw'}
                      onChange={e => onStatusChange(order.id, e.target.value)}
                      sx={{ minWidth: 140, fontSize: '0.8rem' }}
                    >
                      {STATUS_FLOW.map(s => (
                        <MenuItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}