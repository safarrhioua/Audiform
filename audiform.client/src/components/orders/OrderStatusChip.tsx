import { Chip, type ChipProps } from '@mui/material';

interface OrderStatusChipProps {
  status: string;
}

const statusConfig: Record<string, { color: ChipProps['color'] }> = {
  'nieuw':        { color: 'default' },
  'ontvangen':    { color: 'primary' },
  'in productie': { color: 'warning' },
  'gereed':       { color: 'secondary' },
  'verzonden':    { color: 'info' },
  'afgeleverd':   { color: 'success' },
  'geannuleerd':  { color: 'error' },
};

export default function OrderStatusChip({ status }: OrderStatusChipProps) {
  const config = statusConfig[status] ?? { color: 'default' };
  return <Chip label={status} color={config.color} size="small" />;
}