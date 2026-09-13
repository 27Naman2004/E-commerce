import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/slices/authSlice';

export const ProtectedRoute = () => {
  const user = useSelector(selectCurrentUser);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const user = useSelector(selectCurrentUser);
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};
