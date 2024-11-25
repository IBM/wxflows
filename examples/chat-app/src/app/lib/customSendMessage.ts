import { ChatInstance, CustomSendMessageOptions, GenericItem, MessageRequest, StreamChunk } from '@carbon/ai-chat';
import { submitQuestion } from './langgraph'
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const WELCOME_TEXT = `Welcome to this example of a chat application with an AI Agent built with watsonx.ai Flows Engine (wxflows) and LangGraph.`;

async function customSendMessage(
  request: MessageRequest,
  requestOptions: CustomSendMessageOptions,
  instance: ChatInstance,
) {
  if (request.input.text === '') {
    const answer = await submitQuestion([new SystemMessage("Only use the tools available, don't answer the question based on pre-trained data").toJSON()]);

    instance.messaging.addMessage({
      output: {
        generic: [
          {
            response_type: 'text',
            text: WELCOME_TEXT,
          } as GenericItem,
        ],
      },
    });
  } else if (request.input.text) {
    switch (request.input.message_type) {
      case 'text':
        const answer = await submitQuestion([new HumanMessage(request.input.text).toJSON()]);

        instance.messaging.addMessage({
          output: {
            generic: [
              {
                response_type: 'text',
                text: answer
              } as GenericItem,
            ],
          },
        });
    }
  }
}

export { customSendMessage };