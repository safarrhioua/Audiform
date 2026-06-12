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
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState<number>(1);

    const fetchOrders = useCallback((searchQuery: string, currentPage: number) => {
        setLoading(true);
        const url = searchQuery.trim()
            ? `https://localhost:7050/api/orders/search?q=${encodeURIComponent(searchQuery)}`
            : `https://localhost:7050/api/orders?page=${currentPage}&pageSize=20`;
 
        fetch(url, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (searchQuery.trim()) {
                    const results = data as Order[];
                    setOrders(results);
                    setTotalCount(results.length);
                } else {
                    setOrders(data.items as Order[]);
                    setTotalCount(data.totalCount);
                }
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
 
    return { orders, loading, query, setQuery: handleSetQuery, page, setPage, totalCount };
}