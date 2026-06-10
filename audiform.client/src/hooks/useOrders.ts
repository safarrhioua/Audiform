import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types/order';

function isOrderVisible(order: Order): boolean {
    const oneWeekAfterDelivery = new Date(order.deliveryDate);
    oneWeekAfterDelivery.setDate(oneWeekAfterDelivery.getDate() + 7);
    return new Date() <= oneWeekAfterDelivery;
}

export function getEffectiveStatus(order: Order): string {
    if (order.state.stateName === 'verzonden') {
        return new Date(order.deliveryDate) < new Date() ? 'afgeleverd' : 'verzonden';
    }
    return order.state.stateName;
}

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [query, setQuery] = useState<string>('');

    const fetchOrders = useCallback((searchQuery: string) => {
        setLoading(true);
        const url = searchQuery.trim()
            ? `https://localhost:7050/api/orders/search?q=${encodeURIComponent(searchQuery)}`
            : 'https://localhost:7050/api/orders';

        fetch(url, { credentials: 'include' })
            .then(res => res.json())
            .then((data: Order[]) => {
                setOrders(data.filter(isOrderVisible));
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query, fetchOrders]);

    return { orders, loading, query, setQuery };
}