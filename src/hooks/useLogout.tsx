import { useAuthContext } from "./useAuthContext";

interface LogoutProps {
  logout: () => void;
}

export const useLogout = (): LogoutProps => {
  const { dispatch } = useAuthContext();

  const logout = (): void => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch({
      type: "LOGOUT",
      payload: undefined,
    });
  };

  return { logout };
};
