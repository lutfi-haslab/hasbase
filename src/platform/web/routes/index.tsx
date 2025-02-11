import HomePage from "@/platform/desktop/pages/HomePage";
import { Routes, Route } from "react-router";

const WebRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<HomePage />} />
        </Routes>
    )
}

export default WebRoutes;