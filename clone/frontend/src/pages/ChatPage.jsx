import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import ChatSidebar from '../components/ChatSidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';
import { useChatStore } from '../store/useChatStore';

const ChatPage = () => {
  const queryClient=useQueryClient();
   const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();





  return (
    <div className='h-screen bg-base-200'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden '>
            <ChatSidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer/>}  
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage