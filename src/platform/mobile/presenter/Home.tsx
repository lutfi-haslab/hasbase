import AlertDialog from "@/components/AlertDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useModelStore } from "@/store/modelStore"
import { motion } from 'framer-motion'
import { App } from "konsta/react"
import { BookOpen, Bot, Globe, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
export default function MobileHome() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const { selectedModel } = useModelStore.getState();

  const features = [
    { title: 'Translator', icon: Globe, path: '/translator' },
    { title: 'Live Chat', icon: MessageCircle, path: '/live-chat' },
    { title: 'Learn with AI', icon: BookOpen, path: '/learn-ai' },
    { title: 'Chat', icon: Bot, path: '/chat' },
  ]

  return (
    <App safeAreas theme="ios">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-white text-white p-4">
        <div className="max-w-md mx-auto ">
          <header className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Avatar className="w-40 h-40 border-4 border-white shadow-lg">
                <AvatarImage src="/chatbot-icon.png" alt="AI Assistant" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            </motion.div>
            <motion.h1
              className="text-blue-700 text-2xl font-bold mt-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Hasbase AI
            </motion.h1>
            <motion.p className="text-blue-700 text-lg font-bold mt-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}>
              your personal AI assistant
            </motion.p>
          </header>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              feature.path === "/live-chat" ? (
                <AlertDialog title={feature.title} description="This feature is under development and will be available soon.">
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <Card
                      className="bg-white backdrop-blur-lg border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedFeature(feature.title)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 h-32">
                        <feature.icon className="w-8 h-8 mb-2" />
                        <h2 className="text-lg font-semibold text-center">{feature.title}</h2>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AlertDialog>
              ) : (
                <Link to={feature.path} key={feature.title}>
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <Card
                      className="bg-white backdrop-blur-lg border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedFeature(feature.title)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 h-32">
                        <feature.icon className="w-8 h-8 mb-2" />
                        <h2 className="text-lg font-semibold text-center">{feature.title}</h2>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              )))}
          </div>

          <motion.div
            className="mt-8 text-center text-blue-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl">Current Model: {selectedModel.name}</p>
            <p className="text-xl">from: {selectedModel.provider}</p>
          </motion.div>
        </div>
      </div>
    </App>
  )
}

