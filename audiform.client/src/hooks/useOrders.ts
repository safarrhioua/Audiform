import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types/order';
 
const BASE_URL = import.meta.env.VITE_API_URL as string;
 
// Geeft true terug als de leverdatum minder dan 1 week geleden is.
function isWithinOneWeekAfterDelivery(order: Order): boolean {
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
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState<number>(1);
 
    const fetchOrders = useCallback((searchQuery: string, currentPage: number) => {
        const safePage = Math.max(1, Math.floor(Number(currentPage)));
 
        const url = searchQuery.trim()
            ? `${BASE_URL}/api/orders/search?q=${encodeURIComponent(searchQuery)}`
            : `${BASE_URL}/api/orders?page=${safePage}&pageSize=20`;
 
        setLoading(true);
        setError(null);
 
        fetch(url, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error(`Serverfout: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (searchQuery.trim()) {
                    const results = (data as Order[]).filter(order =>
                        getEffectiveStatus(order) !== 'afgeleverd' || isWithinOneWeekAfterDelivery(order)
                    );
                    setOrders(results);
                    setTotalCount(results.length);
                } else {
                    const filtered = (data.items as Order[]).filter(order =>
                        getEffectiveStatus(order) !== 'afgeleverd' || isWithinOneWeekAfterDelivery(order)
                    );
                    setOrders(filtered);
                    setTotalCount(data.totalCount);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Fout bij ophalen orders:', err);
                setError('Kon orders niet ophalen. Probeer het opnieuw.');
                setLoading(false);
            });
    }, []);
 
    const handleSetQuery = useCallback((newQuery: string) => {
        setQuery(newQuery);
        setPage(1);
    }, []);
 
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(query, page);
        }, 400);
        return () => clearTimeout(timer);
    }, [query, page, fetchOrders]);
 
    return { orders, loading, error, query, setQuery: handleSetQuery, page, setPage, totalCount };
}