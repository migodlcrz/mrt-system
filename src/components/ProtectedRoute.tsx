import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

const ProtectedRoute = ({ children }: { children: any }) => {
  const api = process.env.REACT_APP_API_KEY;
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [isValidToken, setIsValidToken] = useState(true);
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsValidToken(false);
        return;
      }
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          setIsValidToken(false);
          return;
        }

        const response = await fetch(`${api}/api/cards/checkToken`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          setIsValidToken(false);
        }
      } catch (error) {
        setIsValidToken(false);
      }
    };

    checkTokenValidity();
  }, [user]);

  if (!isValidToken) {
    logout();
    return <Navigate to="/logout" />;
  }

  return children;
};

export default ProtectedRoute;
