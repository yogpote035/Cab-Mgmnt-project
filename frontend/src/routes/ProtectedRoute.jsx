import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { loadMe } from "../redux/slices/authSlice";

export function ProtectedRoute() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  useEffect(() => { if (isAuthenticated && !user) dispatch(loadMe()); }, [dispatch, isAuthenticated, user]);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
