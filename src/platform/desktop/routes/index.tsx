import { Route, Routes } from 'react-router'
import DesktopHome from '../presenter/Home'
import Test from '../presenter/Test'

const DesktopRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<DesktopHome />} />
            <Route path="/test" element={<Test />} />
        </Routes>
    )
}
export default DesktopRoutes