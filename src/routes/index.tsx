import Dashboard from "../pages/admin/dashboard";
import Navbar from "../components/NavBar";
import StationLanding from "../pages/admin/dashboard/station";
import CardLanding from "../pages/admin/dashboard/card";
import Admin from "../pages/admin";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import NotLogin from "../components/NotLogin";
import CardScan from "../components/CardScan";
import Root from "../components/Root";
import NavBar from "../components/NavBar";
import StationList from "../components/StationList";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Status {
  isDeployed: boolean;
}

const App = () => {
  const { user } = useAuthContext();
  const [hideNavbar, setHideNavbar] = useState(false);
  const [isDeployed, setisDeployed] = useState(false);
  const api = process.env.REACT_APP_API_KEY;

  const fetchStatus = async () => {
    const status_id = "65cb78bfe51a352d5ae51dd1";
    const response = await fetch(`${api}/api/status/${status_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${user.jwt}`,
      },
    });

    const json: Status = await response.json();

    if (response.ok) {
      setisDeployed(json.isDeployed);
    }

    if (!response.ok) {
      toast.error("Cannot retrieve data");
    }
  };

  useEffect(() => {
    // Check if the current path starts with "/station"
    setHideNavbar(window.location.pathname.startsWith("/station"));
    fetchStatus();
  }, []);

  return (
    <BrowserRouter>
      <div>
        {!hideNavbar && <NavBar />}{" "}
        {/* Render Navbar unless hideNavbar is true */}
        <Routes>
          <Route path={"/"} element={<Root />} />
          <Route path={"/admin"} element={<Admin />} />
          <Route
            path={"/admin/dashboard"}
            element={
              user ? (
                <Dashboard />
              ) : (
                <NotLogin
                  error="Not Logged in!"
                  message="You must be logged in to have access to contents"
                />
              )
            }
          />
          <Route
            path={"/admin/dashboard/card"}
            element={
              user ? (
                <CardLanding />
              ) : (
                <NotLogin
                  error="Not Logged in!"
                  message="You must be logged in to have access to contents"
                />
              )
            }
          />

          <Route
            path={"/admin/dashboard/station"}
            element={
              user ? (
                <StationLanding />
              ) : (
                <NotLogin
                  error="Not Logged in!"
                  message="You must be logged in to have access to contents"
                />
              )
            }
          />
          <Route
            path={"/*"}
            element={
              <NotLogin
                error="Page not found!"
                message="Go back to the login page."
              />
            }
          />

          <Route path={"/station"} element={<StationList />} />

          <Route
            path={"/station/:stn/:status"}
            element={
              isDeployed ? (
                <CardScan />
              ) : (
                <div>
                  <NotLogin
                    error="Stations under maintenace."
                    message="Go back to login page"
                  />
                </div>
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
