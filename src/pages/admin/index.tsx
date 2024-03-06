import React, {
  FC,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  CSSProperties,
} from "react";
import { Label, TextInput } from "flowbite-react";
// import { useLogin } from "../hooks/useLogin";
import { useLogin } from "../../hooks/useLogin";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import BounceLoader from "react-spinners/ClipLoader";

interface AdminProps {}

const Admin: FC<AdminProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login } = useLogin();
  const { user } = useAuthContext();
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "#0d9276",
  };

  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoggingIn(true);
    await login(email, password);
    setLoggingIn(false);
  };

  return (
    <div className="flex flex-col cream h-screen mx-auto">
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

            <div className="flex flex-row justify-between items-center mt-8">
              <button className="bg-[#0d9276] text-gray-900 rounded-lg w-1/3  text font-bold shadow-md shadow-black focus:shadow-sm">
                {loggingIn ? (
                  <div>
                    <BounceLoader
                      color={"#dbe7c9"}
                      loading={true}
                      cssOverride={override}
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </div>
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

export default Admin;
