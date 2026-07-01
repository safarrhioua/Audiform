import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types/order';
import { API_URL } from '../utils/config';

export const STATUS_FLOW = [
  'nieuw', 'ontvangen', 'in productie', 'gereed', 'verzonden',
] as const;

export type WorkflowStatus = (typeof STATUS_FLOW)[number];

export function getNextStatus(current: string): WorkflowStatus | null {
  const idx = STATUS_FLOW.indexOf(current as WorkflowStatus);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function useEmployeeOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    fetch(`${API_URL}/api/employee/orders`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`Serverfout: ${res.status}`);
        return res.json() as Promise<Order[]>;
      })
      .then(data => {
        setOrders(data);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError('Kon orders niet ophalen. Probeer het opnieuw.');
        setLoading(false);
      });
  }, []);

  const updateStatus = useCallback(async (orderId: number, newStatus: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId
        ? { ...o, state: { ...o.state, stateName: newStatus } }
        : o)
    );
    const res = await fetch(`${API_URL}/api/employee/orders/${orderId}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, updateStatus };
}