import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types/order';

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
            .then(data => {
                setOrders(data);
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