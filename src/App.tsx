import { BrowserRouter } from "react-router";
import { ENV } from "./utils/env";
import DesktopRoutes from "./platform/desktop/routes";
import MobileRoutes from "./platform/mobile/routes";
import WebRoutes from "./platform/web/routes";




const App = () => {

    return (
        <BrowserRouter>
            {ENV.PLATFORM === 'web' && <WebRoutes />}
            {ENV.PLATFORM === 'mobile' && <MobileRoutes />}
            {ENV.PLATFORM === 'desktop' && <DesktopRoutes />}
        </BrowserRouter>
    );
}

export default App;