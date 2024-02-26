import React, {
  FC,
  useReducer,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  user: any;
}

interface AuthAction {
  type: string;
  payload?: any; // Make the payload optional for LOGOUT action
}

interface AuthContextProps {
  user: any;
  dispatch: React.Dispatch<AuthAction>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

const authReducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
      };

    default:
      return state;
  }
};

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  useEffect(() => {
    const api = process.env.REACT_APP_API_KEY;
    const token = localStorage.getItem("token");

    const checkToken = async () => {
      console.log("TOKEN: ", token);
      console.log("PUMASOK SIYA SA CHECKER");
      const response = await fetch(`${api}/api/cards/checkToken`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Remove the double quotes here
        },
      });
      if (!response.ok) {
        dispatch({ type: "LOGOUT" });
      }
    };

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // No need for : any

        // checkToken();
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token is expired, log the user out
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
        } else {
          dispatch({ type: "LOGIN", payload: token });
        }
      } catch (error) {
        localStorage.removeItem("token");
        dispatch({ type: "LOGOUT" });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
