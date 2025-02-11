import * as React from "react"

import { SearchForm } from "@/components/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar"
import { useAiContext } from "@/context/AiProvider"
import { useDB } from "@/context/DbProvider"
import { useGetChatMemory } from "@/hooks/useGetChatMemrory"
import { GalleryVerticalEnd, Trash, X } from "lucide-react"
import { Link } from "react-router"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: chatLists, isLoading, refetch } = useGetChatMemory();
  const db = useDB();
  const [isSelect, setIsSelect] = React.useState("New Chat");
  const {createNewChat} = useAiContext();

  const removeChatHistories = async () => {
    const result = await db.query('DELETE FROM chat_memory');
    if (result) refetch();
  }

  const removeChatById = async (conversationId: string) => {
    const result = await db.query(`DELETE FROM chat_memory WHERE conversation_id = $1`, [conversationId]);
    if (result) refetch();
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar {...props} className="bg-gray-100 shadow-lg rounded-lg">
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <p>Hasbase</p>
        </SidebarMenuButton>
        <SearchForm className="mt-2" />
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <Link to="/chat" className="text-blue-600 hover:underline font-semibold" onClick={createNewChat}>New Chat</Link>
          <SidebarGroupLabel className="mt-4 text-gray-700 font-bold flex items-center gap-2 justify-between">
            <p>History</p>
            <Trash onClick={removeChatHistories} className="cursor-pointer size-4 hover:text-red-500" />
          </SidebarGroupLabel>
          {chatLists && chatLists?.rows.map((chat, index) => (
            <SidebarMenuItem key={index} onClick={() => setIsSelect(chat.conversation_id)} className={`flex items-center gap-2 ml-4 p-2 my-1  hover:bg-gray-200 rounded ${isSelect === chat.conversation_id ? 'bg-gray-200' : ''}`}>
              <Link to={`/chat/${chat.conversation_id}`} className={`${isSelect === chat.conversation_id ? 'text-blue-600' : 'text-gray-800'}  hover:text-blue-600`}>{chat.title}</Link>
              <X onClick={() => removeChatById(chat.conversation_id)} className="cursor-pointer size-6 hover:text-red-500" />
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
