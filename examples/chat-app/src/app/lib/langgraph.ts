"use server"

import {
  AIMessage,
  BaseMessage
} from "@langchain/core/messages";
import { ChatWatsonx } from "@langchain/community/chat_models/ibm";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import { ChatMessage } from "../components/Chat";
import { Serialized } from "@langchain/core/load/serializable";

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

// Connect to wxflows
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || '',
  apikey: process.env.WXFLOWS_APIKEY,
});

// Retrieve the tools 
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

// Connect to the LLM provider 
const model = new ChatWatsonx({
  model: "mistralai/mistral-large",
  projectId: process.env.WATSONX_AI_PROJECT_ID,
  serviceUrl: process.env.WATSONX_AI_ENDPOINT,
  version: '2024-05-31',
}).bindTools(tools);

// Define the function that determines whether to continue or not
// We can extract the state typing via `StateAnnotation.State`
function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    console.log('TOOL_CALL', JSON.stringify(lastMessage.tool_calls))
    return "tools";
  }
  // Otherwise, we stop (reply to the user)
  return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

const app = workflow.compile({ checkpointer });

export async function submitQuestion(messages: Serialized[]): Promise<ChatMessage> {
  const finalState = await app.invoke(
    { messages },
    { configurable: { thread_id: "42" } }
  );

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    origin: "bot",
    hasError: false,
    userSubmitted: true,
    time: currentTime,
    index: finalState.messages.length - 1,
    elements: [
      {
        type: "text",
        content: finalState?.messages[finalState?.messages.length - 1].content || "Something went wrong"
      }
    ]
  };
}
