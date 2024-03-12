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
  payload?: any;
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
    // const api = process.env.REACT_APP_API_KEY;
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (userString) {
      const userJson = JSON.parse(userString);

      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);

          // checkToken();
          if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            dispatch({ type: "LOGOUT" });
          } else {
            console.log("PAYLOAD: ", userJson);
            dispatch({ type: "LOGIN", payload: userJson });
          }
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
        }
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
