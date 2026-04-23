import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext);
  const location = useLocation();

  if (!authContext?.user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
