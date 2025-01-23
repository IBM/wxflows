## Create the Next.js chat application

1. Create a new next.js project

```bash
npx create-next-app@latest watsonx-chat-app
```

follow all steps as directed

this will create a new directory called `watsonx-chat-app` with the boilerplate code for the next.hs applicaiton in it

2. move into the directory `watsonx-chat-app` and start the application:ß

```bash
cd watsonx-chat-app
npm run dev
```

3. we'll strip the contents of `src/app/page.tsx`

and add the following:

```jsx
export default function Home() {
  return <div className="flex flex-col h-screen justify-between"></div>;
}
```

this gives us a blank slate to which we can add a header:

```html
<header className="bg-white p-2">
  <div className="flex lg:flex-1 items-center justify-center">
    <a href="#" className="m-1.5">
      <span className="sr-only">watsonx Chat application</span>
      <img
        className="h-8 w-auto"
        src="http://localhost:3000/watsonx.svg"
        alt=""
      />
    </a>
    <h1 className="font-bold">Chat application</h1>
  </div>
</header>
```

then let's add a bar to ask a question:

```html
<div className="flex flex-col flex-auto justify-between bg-gray-100 p-6">
  <div
    className="top-[100vh] flex flex-row items-center h-16 rounded-xl bg-white w-full px-4"
  >
    <div className="flex-grow ml-4">
      <div className="relative w-full">
        <input
          type="text"
          className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
        />
      </div>
    </div>
    <div className="ml-4">
      <button
        className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-2 flex-shrink-0"
      >
        <span>Send</span>
      </button>
    </div>
  </div>
</div>
```

this gives us a nice template to build the application. Let's add some placholder messages that we'll replace with realtime messages later on:

```html
<div className="flex flex-col h-full">
  <div className="col-start-1 col-end-8 p-3 rounded-lg">
    <div className="flex flex-row items-center">
      <div
        className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-400 text-white flex-shrink-0 text-sm"
      >
        Me
      </div>
      <div
        className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
      >
        <div>Hey How are you today?</div>
      </div>
    </div>
  </div>
  <div className="col-start-6 col-end-13 p-3 rounded-lg">
    <div className="flex items-center justify-start flex-row-reverse">
      <div
        className="flex items-center justify-center h-8 w-8 rounded-full bg-green-400 flex-shrink-0 text-sm"
      >
        AI
      </div>
      <div
        className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
      >
        <div>I'm ok what about you?</div>
      </div>
    </div>
  </div>
</div>
```

You could dissect this into seperate components if you want to.

## Install the watsonx.ai sdk

there are multiple ways to use the watsonx.ai sdk, we'll be using the node.js sdk in this case

we'll use the instructions on the watsonx.ai developer hub for this: https://www.ibm.com/watsonx/developer/get-started/quick-start

1. kill the process running the terminal, and install the sdk:

```bash
npm install @ibm-cloud/watsonx-ai
```

2. Create a file in the project root and name it `.env`. Add the following code to the file and replace {apikey} with your IBM Cloud API key and {project_id} with your watsonx.ai project id:

```bash
WATSONX_AI_AUTH_TYPE=iam
WATSONX_AI_APIKEY={apikey}
WATSONX_AI_PROJECT_ID={project_id}
```

3. Create a new file in `src/app` and call it `action.ts`. Place the following code in this file:

```ts
"use server";

export async function message() {}
```

This is where we'll connect to the watsonx.ai SDK and create the functions to enable chat functionality:

```ts
"use server";

import { WatsonXAI } from "@ibm-cloud/watsonx-ai";

export type Message = {
  role: string;
  content?: string;
};
process.env.IBM_CREDENTIALS_FILE = process.cwd() + "/.env";
```

we just created a type and loaded the credentials file, now we can create logic in the message function:

```ts
export async function message(messages: Message[]) {
  const watsonxAIService = WatsonXAI.newInstance({
    version: "2024-05-31",
    serviceUrl: "https://us-south.ml.cloud.ibm.com",
  });

  const modelParameters = {
    maxTokens: 200,
  };

  const chatResponse = await watsonxAIService.textChat({
    modelId: "mistralai/mistral-large",
    projectId: process.env.WATSONX_AI_PROJECT_ID,
    messages,
    ...modelParameters,
  });

  return chatResponse.result.choices?.[0].message;
}
```

we use the model mistral-large, you can use all models available on watsonx.ai

4. we'll go back to the `src/app/page.tsx` file. We're going to set up some very simple state. You should use a state manager library if your app will become more complex:

```jsx
"use client";

import { useState } from "react";

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
}
```

this state is to make the input field a controlled component. we need to add a onchange event to the input field so this state variable will be updated when you type in the box:

```jsx
<div className="flex-grow ml-4">
  <div className="relative w-full">
    <input
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
    />
  </div>
</div>
```

5. next we are going to add a state variable for the message history at the top of the file. Also, we'll import the message function and message type we created earlier:

```jsx
"use client";

import { useState } from "react";
import { message, type Message } from "./actions";

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
}
```

the state variable will be used in a new function wich we'll call `sendMessage`. This will be used when you finished typing your question and want to submit it:

```jsx
export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  async function sendMessage() {
    const messageHistory = [
      ...messages,
      {
        role: "user",
        content: inputMessage,
      },
    ];

    const response = await message(messageHistory);

    if (response) {
      messageHistory.push(response);
    }

    setMessages(messageHistory);
  }

  return ()
}
```

In this function we the role `user` for the message coming from `inputMessage` state variable, this will be used to send to the llm from watsonx.ai

the response of the `message` function should then be added to the state, it already includes the role `assistant` for its reponse.

6. let's link this new message to the button next to the input box:

```jsx
<div className="ml-4">
  <button
    onClick={sendMessage}
    className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-2 flex-shrink-0"
  >
    <span>Send</span>
  </button>
</div>
```

we can also add the function to the input box, so it fires when you press enter:

```jsx
<div className="flex-grow ml-4">
  <div className="relative w-full">
    <input
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
    />
  </div>
</div>
```

7. if you ask a question nothing will happen yet as the rendered messages are hardcoded, let's take hte state and render these messages instead. Remove the hardcoded messages and add the following:

```jsx
<div className="flex flex-col h-full">
  {messages.length > 0 &&
    messages.map(({ role, content }, index) => {
      if (role === "user")
        return (
          <div
            key={role + index}
            className="col-start-1 col-end-8 p-3 rounded-lg"
          >
            <div className="flex flex-row items-center">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-400 text-white flex-shrink-0 text-sm">
                Me
              </div>
              <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                <div>{content}</div>
              </div>
            </div>
          </div>
        );

      if (role === "assistant")
        return (
          <div
            key={role + index}
            className="col-start-6 col-end-13 p-3 rounded-lg"
          >
            <div className="flex items-center justify-start flex-row-reverse">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-400 flex-shrink-0 text-sm">
                AI
              </div>
              <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                <div>{content}</div>
              </div>
            </div>
          </div>
        );
    })}
</div>
```

8. Save it. And we can now ask a question:

- "hi who are you?"
- "what do you know about tool calling?"

9. The text is cut off at the end, to prevent this we can change the value for `maxTokens` in the `src/app/actions.ts` file:

```ts
const modelParameters = {
  maxTokens: 400,
};
```

10. One final touch up, is to clear the input box when you have submitted your question:

```jsx
async function sendMessage() {
  const messageHistory = [
    ...messages,
    {
      role: "user",
      content: inputMessage,
    },
  ];

  setInputMessage("");
}
```

you can now ask a follow up question and the box will be emptied.

11. Finally, we need to add a loading indicator:

- create the state variable:

```jsx
"use client";

import { useState } from "react";
import { message, type Message } from "./actions";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
}
```

- In the `sendMessage` function the loading state should be set to `true` when the function is invoked and to `false` when it's finished

```jsx
async function sendMessage() {
  setIsLoading(true); // set to true

  const messageHistory = [
    ...messages,
    {
      role: "user",
      content: inputMessage,
    },
  ];

  setInputMessage("");

  const response = await message(messageHistory);

  if (response) {
    messageHistory.push(response);
  }

  setMessages(messageHistory);
  setIsLoading(false); // set to false
}
```

- then disable the input box and show it's loading:

```jsx
<div className="flex-grow ml-4">
    <div className="relative w-full">
    <input
        type="text"
        disabled={isLoading}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
    />
    </div>
</div>
<div className="ml-4">
    <button
    onClick={sendMessage}
    className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-2 flex-shrink-0"
    >
    <span>{isLoading ? "Loading..." : "Send"}</span>
    </button>
</div>
```

In the same way you can set an error state as well.

## OPTIONAL: ask questions about image
https://github.com/IBM/watsonx-ai-node-sdk/blob/main/examples/src/sdk/example_chat_image.ts

switch to a model that supports images: `meta-llama/llama-3-2-11b-vision-instruct`

## Use tools

one popular patter is tool calling, where you give the llm the option to use a function to perform an action. the action won't be executed by the LLM but by your application, the llm will generate the function call your application should execute based on the tool definition.

1. let's start by adding a tool definition for a sum tool:

```ts
const tools = [
  {
    type: "function",
    function: {
      name: "add",
      description: "Adds the values a and b to get a sum.",
      parameters: {
        type: "object",
        properties: {
          a: {
            description: "A number value",
            type: "float",
          },
          b: {
            description: "A number value",
            type: "float",
          },
        },
        required: ["a", "b"],
      },
    },
  },
];

const chatResponse = await watsonxAIService.textChat({
  modelId: "mistralai/mistral-large",
  projectId: process.env.WATSONX_AI_PROJECT_ID,
  messages,
  tools,
  toolChoiceOption: "auto",
  ...modelParameters,
});
```

we pass the tools to the chat sdk, together with setting the toolchoiceoption, allowing the llm to decide what tool to use.

2. now that we have tools there's a third role available: `tool`. we need to change the function a bit so it can look for tool calls:

```ts
if (chatResponse.result.choices[0].message?.tool_calls) {
  const { tool_calls } = chatResponse.result.choices[0].message;
} else {
  return chatResponse.result.choices?.[0].message;
}
```

3. the tool call message contains all the informaitoin we need to call a tool. we can use this for example to add two numbers, which is what the `add` tool does:

```ts
const toolResponses = tool_calls
  .map(({ id, function: toolCall }) => {
    if (toolCall.name === "add") {
      const args = JSON.parse(toolCall.arguments);

      const result = args.a + args.b; // add two numbers

      return {
        role: "tool",
        tool_call_id: id,
        content: result.toString(),
      };
    }
  })
  .filter((value) => value !== undefined);
```

for this, we also need to update the `Message` type a bit so it includes the `tool_call_id`:

```ts
export type Message = {
  role: string;
  tool_call_id?: string;
  content?: string;
};
```

4. the result for the tool should be fed back to the llm so it can use the tool response to return a message in the application.

```ts
if (chatResponse.result.choices[0].message?.tool_calls) {
  //

  if (toolResponses.length > 0) {
    return message([
      ...messages,
      chatResponse.result.choices?.[0].message,
      ...toolResponses,
    ]);
  }
} else {
  return chatResponse.result.choices?.[0].message;
}
```

as you can see this will get complicated real quick, as you need to define logic for every tool. so instead we'll install `wxflows` a tool platform by IBM.

## use wxflows for tool calling

it's free to use, and the sdk is open source. we'll need both the cli for development of the tools and the sdk for integrating the tools in our chat application

- sign up for a free account
- install the `wxflows` node.js cli

1. kill the process running in then terminal and then initialize a new project. we'll do this from a fresh directory called `wxflows`:

```bash
mkdir wxflows
cd wxflows
wxflows init
```

you can set your own endpoint, or use then autogenerated suggestion. we'll use: `api/watsonx-chat-app`.

2. with wxflows you can create a tool out of a data source or import an existing tool. we've been building a very simple `sum` tool but can also import the `math` tool that wxflows has:

```bash
wxflows import tool https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/math.zip
```

this will create a set of files, the `tools.graphql` file is important as it contains the tool definitions. these have been imported as well.

3. the tools set in wxflows are deployed to an endpoint for remote execution. to deploy the tools to an endpoint run the following:

```bash
wxflows deploy
```

the endpoint it has been deployed to is printed in your terminal. you'll need it later.

## Integrate using the SDK

1. move back into the project root and install the sdk for wxflows

```bash
npm i @wxflows/sdk
```

2. In the `.env` file you need to set two new variables:

```bash
WXFLOWS_APIKEY=
WXFLOWS_ENDPOINT=
```

the apikey can be retrieved by running the command:

```bash
wxflows whoami --apikey
```

the api endpoint was printed in your terminal a few moments ago.

3. in the file `src/app/actions.ts` we'll import the wxflows sdk

```ts
import wxflows from "@wxflows/sdk/watsonx";
```

and set the connection to wxflows using the env variables we've set before:

```ts
if (!process.env.WXFLOWS_ENDPOINT || process.env.WXFLOWS_APIKEY) {
  return "missing credentials";
}

const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT,
  apikey: process.env.WXFLOWS_APIKEY,
});

const tools = await toolClient.tools;

const chatResponse = await watsonxAIService.textChat({
  //
});
```

the tool we set before should be deleted and instead the wxflows endpoint becomes the single source of truth for tools.

4. the tool execution will also happen via wxflows. this requires a change to the final section of this file where tool is executed:

```ts
if (chatResponse.result.choices[0].message?.tool_calls) {
  const toolResponses = await toolClient.executeTools(chatResponse);

  if (toolResponses && toolResponses.length > 0) {
    return message([...messages, ...toolResponses]);
  }
} else {
  return chatResponse.result.choices?.[0].message;
}
```

You can now ask every math related question. Not just a sum but for example:

- "what is the square root of third decimal of pi times 10"