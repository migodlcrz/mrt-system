import React, { FC, useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Label, TextInput } from "flowbite-react";
import { useLogin } from "../hooks/useLogin";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";

interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, error } = useLogin();
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await login(email, password);
  };

  return (
    <div className="flex flex-col bg-gray-800 h-screen mx-auto animate__animated animate__fadeIn">
      <div className="flex flex-row w-screen h-20 items-center bg-gray-900">
        <img src="/logo.png" className="h-12 m-4 ml-4" alt="Flowbite Logo" />
        <div className="text-2xl font-black text-green-500">
          GLOBALTEK LIGHT RAIL TRANSIT
        </div>
      </div>
      <div className="flex h-full items-center justify-center bg-gray-800">
        <div className="flex flex-col max-w-screen mx-10 items-center mb-28 mt-20 bg-gray-900 p-10 rounded-xl">
          <header className="font-bold text-xl md:text-2xl lg:text-3xl text-green-500">
            MRT Admin
          </header>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <Label className="text-green-400 mt-5 text-md">Email:</Label>
            <TextInput
              className="md:w-80 lg:w-96"
              type="text"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <Label className="text-green-400 mt-5 text-md">Password:</Label>

            <input
              className="rounded-lg text-black"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />

            <button className="bg-green-500 text-gray-900 rounded-lg w-1/3 mt-7 px-4 py-1 text font-bold">
              Login
            </button>
            {user && (
              <button
                className="bg-green-500 text-gray-900 rounded-lg w-auto my-4 px-4 py-1 text font-bold"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
