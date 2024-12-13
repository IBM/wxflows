import { ChatAnthropic } from "@langchain/anthropic";
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import wxflows from "@wxflows/sdk/langchain";
import "dotenv/config";

export default async function main() {
  const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT,
    apikey: process.env.WXFLOWS_APIKEY,
  });

  const tools = await toolClient.lcTools;

  const model = new ChatAnthropic({
    model: "claude-3-5-sonnet-20240620",
    temperature: 0,
  }).bindTools(tools);

  // Create message thread
  const messages = [
    new SystemMessage(
      "You are a helpful assistant that will only use the tools available and doesn't answer the question based on pre-trained data. Only perform a single tool call to retrieve all the information you need."
    ),
    new HumanMessage(
      "Search information about the book escape from james patterson"
    ),
  ];

  const aiMessage = await model.invoke(messages);
  messages.push(aiMessage); // Add the LLM response incl. suggested tool call to the message thread

  // Check for suggested tool calls in the message thread
  for (const toolCall of aiMessage.tool_calls) {
    // Log the suggested tool call in terminal
    console.log("TOOL_CALL", { toolCall });

    // Call the tool using wxflows
    const toolResponse = await toolClient.invokeTool(toolCall);
    messages.push(toolResponse);

    // Log the tool call response in terminal
    console.log("TOOL_CALL RESULT", { toolResponse });
  }

  const result = await model.invoke(messages);

  return result?.content;
  // The rest of the implementation code
}

// Print result in the terminal
console.log(await main());
