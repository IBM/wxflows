"use server";

import { WatsonXAI } from "@ibm-cloud/watsonx-ai";
import wxflows from "@wxflows/sdk/watsonx";

export type Message = {
  role: string;
  tool_call_id?: string;
  content?: string;
};
process.env.IBM_CREDENTIALS_FILE = process.cwd() + "/.env";

export async function message(messages: Message[]) {
  const watsonxAIService = WatsonXAI.newInstance({
    version: "2024-05-31",
    serviceUrl: "https://us-south.ml.cloud.ibm.com",
  });

  const modelParameters = {
    maxTokens: 200,
  };

  if (!process.env.WXFLOWS_ENDPOINT || !process.env.WXFLOWS_APIKEY) {
    return {
      role: "assistant",
      content: "missing credentials, please update the .env file",
    };
  }

  const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT,
    apikey: process.env.WXFLOWS_APIKEY,
  });

  const tools = await toolClient.tools;

  const chatResponse = await watsonxAIService.textChat({
    modelId: "mistralai/mistral-large",
    projectId: process.env.WATSONX_AI_PROJECT_ID,
    messages,
    tools,
    toolChoiceOption: "auto",
    ...modelParameters,
  });

  if (chatResponse.result.choices[0].message?.tool_calls) {
    const toolResponses = await toolClient.executeTools(chatResponse);

    if (toolResponses && toolResponses.length > 0) {
      return message([...messages, ...toolResponses]);
    }
  } else {
    return chatResponse.result.choices?.[0].message;
  }
}
