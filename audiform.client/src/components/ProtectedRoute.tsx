import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_URL } from "../utils/config";

type ProtectedRouteProps = {
    children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch(`${API_URL}/api/Auth/check-auth`, {
                    method: "GET",
                    credentials: "include",
                });

                setIsAuthenticated(response.ok);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, []);

    if (isLoading) {
        return <p>Controleert login...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login?message=loginrequired" replace />;
    }

    return children;
}