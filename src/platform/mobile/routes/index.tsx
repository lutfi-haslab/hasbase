import { AiProvider } from "@/context/AiProvider";
import { DbProvider } from "@/context/DbProvider";
import { App, NavbarBackLink } from "konsta/react";
import { Route, Routes } from "react-router";
import ChatBot from "../presenter/ChatBot";
import LearnAi from "../presenter/LearnAi";
import LiveChat from "../presenter/LiveChat";
import Translator from "../presenter/Translator";
import MobileHome from "../presenter/Home";
import React from "react";
import { MobileProvider } from "@/context/mobileProvider";


const MobileRoutes = () => {

    return (
        <React.Fragment>
            {/* <DbProvider> */}
            {/* <AiProvider> */}
            <MobileProvider>
                <Routes>
                    <Route path='/' element={<MobileHome />} />
                    <Route path="/translator" element={<Translator />} />
                    <Route path="/live-chat" element={<LiveChat />} />
                    <Route path="/learn-ai" element={<LearnAi />} />
                    <Route path="/chat" element={<ChatBot />} />
                </Routes>
            </MobileProvider>
            {/* </AiProvider> */}
            {/* </DbProvider> */}
        </React.Fragment>
    )
}

export default MobileRoutes;