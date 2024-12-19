"use client";

import { ChatCustomElement, PublicConfig } from '@carbon/ai-chat';
import { customSendMessage } from './lib/customSendMessage';

function App() {
  const config: PublicConfig = {
    messaging: {
      customSendMessage,
    },
    debug: false,
    openChatByDefault: true,
    layout: {
      showFrame: false,
      hasContentMaxWidth: true
    },
    headerConfig: {
      hideMinimizeButton: true
    }
  } as PublicConfig;

  return (
    <div>
      <ChatCustomElement className="chat" config={config} />
    </div>
  )
}

export default App;