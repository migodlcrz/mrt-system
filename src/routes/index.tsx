import Dashboard from "../pages/admin/dashboard";
import Navbar from "../components/NavBar";
import StationLanding from "../pages/admin/dashboard/station";
import CardLanding from "../pages/admin/dashboard/card";
import Admin from "../pages/admin";
import { useAuthContext } from "../hooks/useAuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotLogin from "../components/NotLogin";
import CardScan from "../components/CardScan";
import Root from "../components/Root";

const App = () => {
  const { user } = useAuthContext();

  console.log("Router", user);

  return (
    <BrowserRouter>
      <div>
        <Navbar />
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
                message="Go back to login page."
              />
            }
          />
          <Route path={"/station/:stn/:status"} element={<CardScan />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
