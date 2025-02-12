import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import DesktopRoutes from "./platform/desktop/routes";
import MobileRoutes from "./platform/mobile/routes";
import WebRoutes from "./platform/web/routes";
import { ENV } from "./utils/env";

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ENV.PLATFORM === "web" && <WebRoutes />}
        {ENV.PLATFORM === "mobile" && <MobileRoutes />}
        {ENV.PLATFORM === "desktop" && <DesktopRoutes />}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
