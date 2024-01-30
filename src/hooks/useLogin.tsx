import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

interface LoginResponse {
  error: string | null;
  user: object | null;
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
      setError(json.error);
    }

    if (response.ok) {
      if (json.jwt) {
        localStorage.setItem("user", JSON.stringify(json));
        // localStorage.setItem("token", JSON.stringify(json.jwt));
      }

      dispatch({ type: "LOGIN", payload: json });

      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
