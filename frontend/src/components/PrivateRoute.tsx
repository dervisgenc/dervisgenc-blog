// PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useAuth();

    return token ? children : <Navigate to="/sentinel/login" />;
};

export default PrivateRoute;
