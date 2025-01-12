// PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/sentinel/login" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
