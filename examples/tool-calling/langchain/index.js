import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import wxflows from "@wxflows/sdk/langchain";
import "dotenv/config";

(async () => {
  const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT,
    apikey: process.env.WXFLOWS_APIKEY
  });

  const tools = await toolClient.lcTools;

  const model = new ChatAnthropic({
    model: "claude-3-5-sonnet-20240620",
    temperature: 0,
  }).bindTools(tools);

  const toolPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant who always needs to use a calculator.",
    ],
    ["human", "{input}"],
  ]);

  // Chain your prompt and model together
  const toolCallChain = toolPrompt.pipe(model);

  const chatCompleted = await toolCallChain.invoke({
    input: "Search information about the book escape from james patterson",
  });

  console.log(JSON.stringify(chatCompleted));

  // The rest of the implementation code
})();
