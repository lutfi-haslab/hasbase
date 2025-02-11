import { Route, Routes } from "react-router";
import HomePage from "../pages/HomePage";

const DesktopRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};
export default DesktopRoutes;
