"use client";

import { useState } from 'react';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Chat, ChatMessage } from './components/Chat';
import { submitQuestion } from './lib/langgraph';

function App() {
  const [isLoading, setIsloading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  return (
    <div className="h-screen">
      <div className="h-full">
        <Chat
          loading={isLoading}
          disableHeaderButtons
          contentEditable
          conversation={messages}
          onSubmit={async (e: any) => {
            setIsloading(true)

            const message = e?.detail?.message

            const lcMessages = messages.length > 0 ? [
              new HumanMessage(message.text).toJSON(),
            ] : [
              new SystemMessage("Only use the tools available, don't answer the question based on pre-trained data").toJSON(),
              new HumanMessage(message.text).toJSON(),
            ]

            setMessages([...messages, e?.detail?.message])

            const res = await submitQuestion(lcMessages)

            if (res) {
              setMessages((messages) => [...messages, res as any])
              setIsloading(false)
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;