import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { toast } from "react-toastify";

interface LoginResponse {
  error: string | null;
  user_: string | null;
  jwt: string | null;
}

export const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const { dispatch } = useAuthContext();
  const api = process.env.REACT_APP_API_KEY;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`${api}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json: LoginResponse = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(toast.error(json.error) as any);
    }

    if (response.ok) {
      if (json.jwt) {
        toast.success("Login successful");
        localStorage.setItem("token", json.jwt);
      }

      dispatch({ type: "LOGIN", payload: json });

      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
