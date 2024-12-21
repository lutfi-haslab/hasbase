import { Routes, Route } from "react-router";
import DesktopHome from "../../desktop/presenter/Home";
import Test from "../../desktop/presenter/Test";

const WebRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<DesktopHome />} />
            <Route path="/test" element={<Test />} />
        </Routes>
    )
}

export default WebRoutes;