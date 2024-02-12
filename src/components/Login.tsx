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
    <div className="flex flex-col cream h-screen mx-auto">
      {/* <div className="flex flex-row w-screen h-20 items-center">
        <img src="/logo.png" className="h-12 m-4 ml-4" alt="Flowbite Logo" />
        <div className="text-2xl font-black text-green-500">
          GLOBALTEK LIGHT RAIL TRANSIT
        </div>
      </div> */}
      <div className="flex h-full items-center justify-center bg-cream animate__animated animate__fadeInDown">
        <div className="flex flex-col max-w-screen mx-10 items-center mb-28 mt-20 bg-cream shadow-lg shadow-black p-10 rounded-xl animate__animated animate__fadeIn">
          <header className="font-bold text-xl md:text-2xl lg:text-3xl text-green-500"></header>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label className="text-[#0d9276] mt-5 text-md font-bold">
              Email:
            </label>
            <input
              className="md:w-80 lg:w-96 shadow-inner shadow-black rounded-lg text-black"
              type="text"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <label className="text-[#0d9276] mt-5 text-md font-bold">
              Password:
            </label>

            <input
              className="md:w-80 lg:w-96 shadow-inner shadow-black rounded-lg text-black"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />

            <button className="bg-[#0d9276] text-gray-900 rounded-lg w-1/3 mt-7 px-4 py-1 text font-bold shadow-md shadow-black focus:shadow-sm">
              Login
            </button>
          </form>
        </div>
      </div>
      <div className="text-black">
        <button
          className="flex mx-10 mb-10 bg-[#0d9276] px-2 py-1 rounded-lg font-bold text-[#dbe7c9] shadow-lg shadow-black"
          onClick={() => navigate("/")}
        >
          Go back to home
        </button>
      </div>
    </div>
  );
};

export default Login;
