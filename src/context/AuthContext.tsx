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
  payload: any;
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
    const user = JSON.parse(localStorage.getItem("user") || "null");
    // const token = localStorage.getItem("token");

    // console.log("this user", user);

    // if (token) {
    //   dispatch({ type: "LOGIN", payload: token });
    // }

    if (user) {
      const decodedToken: any = jwtDecode(user.jwt);

      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
      } else {
        dispatch({ type: "LOGIN", payload: user });
        // dispatch({ type: "LOGIN", payload: user });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
