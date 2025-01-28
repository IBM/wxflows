## Create the Next.js chat application

1. Create a new next.js project

```bash
npx create-next-app@latest text-to-sql-agentå
```

follow all steps as directed

this will create a new directory called `text-to-sql-agent` with the boilerplate code for the next.hs applicaiton in it

2. move into the directory `text-to-sql-agent` and start the application:

```bash
cd text-to-sql-agent
npm run dev
```

3. we'll strip the contents of `src/app/page.tsx`

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
      <span className="sr-only">Text-to-SQL Agent</span>
      <img
        className="h-8 w-auto"
        src="http://localhost:3000/watsonx.svg"
        alt=""
      />
    </a>
    <h1 className="text-black font-bold">Text-to-SQL Agent</h1>
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
        <div>Tell me a joke about SQL</div>
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
        <div>
          A couple of relational databases walked into a NoSQL bar. They left
          because they couldn't find a table!
        </div>
      </div>
    </div>
  </div>
</div>
```

You could dissect this into seperate components if you want to.

also open `globals.css` and remove everything besides:

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Install ollama

there are a lot of different ways to use langgraph with different llm providers, for example, there's an extension to use it with watsonx.ai or the other big llm providers. for this tutorial however we'll be using a locally running model:

https://ollama.com/

download and install, you can run (in a seperate terminal tab or window) the command for ollama:

```
ollama run llama3.2
```

this wil use llama 3.2 which is also available on watsonx.ai when you want to bring your application into production.

## install langgraph

we'll be using langgraph as the agentic framework, to install it

1. kill the process running the application from your terminal (keep the terminal tab/window with ollama running), and install the sdk:

```bash
npm install @langchain/langgraph @langchain/core @langchain/ollama
```

2. Create a new file in `src/app` and call it `action.ts`. Place the following code in this file:

```ts
"use server";

export async function transcribe(videoUrl: string) {}
```

This is where we'll connect langgraph and build the business logic. first import the dependencies we've installed before:

```ts
"use server";

import { ChatOllama } from "@langchain/ollama";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "@langchain/core/messages";

export async function message(messages: StoredMessage[]) {
  const deserialized = mapStoredMessagesToChatMessages(messages);

  const agent = createReactAgent({
    llm: new ChatOllama({ model: "llama3.2", temperature: 0 }),
    tools: [],
  });

  const response = await agent.invoke({
    messages: deserialized,
  });

  return response.messages[response.messages.length - 1].content;
}
```

there's a lot of boilerplate code here, let me walk you through it.

let's connect this in the front side of the application.

we'll go back to the `src/app/page.tsx` file. We're going to set up some very simple state. You should use a state manager library if your app will become more complex:

```jsx
"use client";

import { useState } from "react";

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");

  // ...
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

next we are going to add a state variable for the message history at the top of the file. Also, we'll import the message function and message type we created earlier:

let's also add a system prompt here, which you can use to give the llm certain instructions. the system prompt is for internal use and will not be shown to the user:

```jsx
"use client";

import { useState } from "react";
import {
  HumanMessage,
  SystemMessage,
  BaseMessage,
  AIMessage,
  mapChatMessagesToStoredMessages
} from "@langchain/core/messages";
import { message } from "./actions";

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([
    new SystemMessage(`
      You're a text-to-sql agent.

      You should create a SQL query based on natural language
      and use it with the given tools to generate the output if possible
    `),
  ]);

  return (
      // ...
  )
}
```

the state variable will be used in a new function wich we'll call `sendMessage`. This will be used when you finished typing your question and want to submit it:

```jsx
export default function Home() {
  // ...

  async function sendMessage() {
    const messageHistory = [...messages, new HumanMessage(inputMessage)];

    const response = await message(mapChatMessagesToStoredMessages(messageHistory));

    if (response) {
      messageHistory.push(new AIMessage(response as string));
    }

    setMessages(messageHistory);
  }

  return ()
}
```

In this function we the `HumanMessage` type for the message coming from `inputMessage` state variable, this will be used to send to the llm by langgraph

the response of the `message` function should then be added to the state, it already includes the AIMessage type for its reponse.

let's link this new message to the button next to the input box:

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

7. if you ask a question nothing will happen yet as the rendered messages are hardcoded, let's take the state and render these messages instead. Remove the hardcoded messages and add the following:

```jsx
<div className="flex flex-col h-full">
{messages.length > 0 &&
    messages.map((message, index) => {
    if (message instanceof HumanMessage) {
        return (
        <div
            key={message.getType() + index}
            className="col-start-1 col-end-8 p-3 rounded-lg"
        >
            <div className="flex flex-row items-center">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-400 text-white flex-shrink-0 text-sm">
                Me
            </div>
            <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                <div>{message.content as string}</div>
            </div>
            </div>
        </div>
        );
    }

    if (message instanceof AIMessage) {
        return (
        <div
            key={message.getType() + index}
            className="col-start-6 col-end-13 p-3 rounded-lg"
        >
            <div className="flex items-center justify-start flex-row-reverse">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-400 flex-shrink-0 text-sm">
                AI
            </div>
            <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                <div>{message.content as string}</div>
            </div>
            </div>
        </div>
        );
    }
    })}
</div>
```

it's important we check for the type of message so it can be assigned to either the user or the agent responding.

Let's see if the agent can come up with a better joke:

```
tell me a joke about sql?
```

10. One final touch up, is to clear the input box when you have submitted your question:

```jsx
async function sendMessage() {
  // ...

  setInputMessage("");
}
```

you can now ask a follow up question and the box will be emptied.

11. Finally, we need to add a loading indicator:

- create the state variable:

```jsx
"use client";

// ...

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // ...
}
```

- In the `sendMessage` function the loading state should be set to `true` when the function is invoked and to `false` when it's finished

```jsx
async function sendMessage() {
  setIsLoading(true); // set to true

  // ...

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

## Connect to a database

we will use a local mysql database, which we'll swap out with a db running in the cloud later on.

First, we'll create a new file called `src/app/constants.ts` where we put the sql queries to seed the db:

```ts
export const customerTable = `
CREATE TABLE IF NOT EXISTS 'customer' (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'email' TEXT NOT NULL,
    'name' TEXT NOT NULL
);`;

export const orderTable = `
CREATE TABLE IF NOT EXISTS 'order' (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'createdate' TEXT NOT NULL,
    'shippingcost' REAL,
    'customerid' INTEGER NOT NULL,
    'carrier' TEXT NOT NULL,
    'trackingid' TEXT NOT NULL,
    FOREIGN KEY ('customerid') REFERENCES customer('id')
);
`;
```

these are exported as we're going to need these in a bit.

let's install the sqlite library for the inmemory database:

```bash
npm install sqlite3
```

next, we'll create a file called `src/app/database.ts`:

```ts
"use server";

import sqlite3 from "sqlite3";
import { customerTable, orderTable } from "./constants";

const db = new sqlite3.Database('":memory:"');

export async function seed() {
  db.serialize(() => {
    db.run(customerTable);
    db.run(orderTable);
  });
}
```

then we'll add the seed parts:

```ts
export async function seed() {
  db.serialize(() => {
    db.run(customerTable);
    db.run(orderTable);

    db.run(`
REPLACE INTO 'customer' ('id', 'email', 'name')  
VALUES  
    (1, 'lucas.bill@example.com', 'Lucas Bill'),  
    (2, 'mandy.jones@example.com', 'Mandy Jones'),  
    (3, 'salim.ali@example.com', 'Salim Ali'),  
    (4, 'jane.xiu@example.com', 'Jane Xiu'),  
    (5, 'john.doe@example.com', 'John Doe'),  
    (6, 'jane.smith@example.com', 'Jane Smith'),  
    (7, 'sandeep.bhushan@example.com', 'Sandeep Bhushan'),  
    (8, 'george.han@example.com', 'George Han'),  
    (9, 'asha.kumari@example.com', 'Asha Kumari'),  
    (10, 'salma.khan@example.com', 'Salma Khan');
    `);

    db.run(`
REPLACE INTO
    'order'
VALUES
    (1, '2024-08-05', 3, 4, '', ''),
    (2, '2024-08-02', 3, 6, '', ''),
    (3, '2024-08-04', 1, 10, '', ''),
    (4, '2024-08-03', 2, 8, '', ''),
    (5, '2024-08-10', 2, 10, '', ''),
    (6, '2024-08-01', 3, 3, '', ''),
    (7, '2024-08-02', 1, 4, '', ''),
    (8, '2024-08-04', 3, 2, '', ''),
    (9, '2024-08-07', 3, 8, '', ''),
    (10, '2024-08-09', 1, 9, '', ''),
    (11, '2024-08-07', 2, 7, '', ''),
    (12, '2024-08-03', 3, 9, '', ''),
    (13, '2024-08-06', 3, 5, '', ''),
    (14, '2024-08-01', 2, 2, '', ''),
    (15, '2024-08-05', 1, 3, '', ''),
    (16, '2024-08-02', 2, 5, '', ''),
    (17, '2024-08-03', 1, 7, '', ''),
    (18, '2024-08-06', 1, 6, '', ''),
    (19, '2024-08-04', 2, 1, '', ''),
    (20, '2024-08-01', 1, 1, '', '');    
    `);
  });
}
```

finally, in this doc we'll add the function to retrieve data from the database by executing a sql query:

```ts
export async function execute(sql: string) {
  return await new Promise((resolve, reject) => {
    try {
      db.all(sql, (error, result) => {
        if (error) {
           resolve(JSON.stringify(error));
        }

        resolve(result);
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}
```

see that I'm not rejecting the error, as it can be helpful for the agent to create a bette sql query based on the error message.

before we create a tool out of the database, we need to make sure the seed script is being executed.

we're opening the `src/app/page.tsx` file again

```tsx
import { seed } from "./database";

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([
    new SystemMessage(`
      You are an expert SQL assistant. Your task is to generate SQL queries based on user requests. Follow these strict formatting guidelines:
        
      You should create a SQLite query based on natural language. 
      Use the "getFromDB" tool to get data from a database.

      - Always enclose field names and table names in double quotes ("), even if they contain no special characters.
      - Ensure proper SQL syntax and use best practices for readability.
      - Maintain consistency in capitalization (e.g., SQL keywords in uppercase).
    `),
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    seed();
  });

  // ...
}
```

here we're importing the seed script, updaed the system prompt a little so it knows to use the database tool and we execute the seed script once the page renders -- yes, I know there are more sophisticated ways to do this. but frontend application optimization is a topic for another day.

in `src/app/actions.ts` we're already importing the tool and zod utilities from langchain, we need to import the database necessities as well

```ts
import { execute } from "./database";
import { customerTable, orderTable } from "./constants";
```

then we can define the database tool:

```ts
const getFromDB = tool(
  async (input) => {
    if (input?.sql) {
      const result = await execute(input.sql);
      console.log({ result, sql: input.sql });

      return JSON.stringify(result);
    }
    return null;
  },
  {
    name: "get_from_db",
    description: `Get data from a database, the database has the following schema:

    ${orderTable}
    ${customerTable}  
    `,
    schema: z.object({
      sql: z
        .string()
        .describe(
          "SQL query to get data from a SQL database. Put quotes around the field and table names."
        ),
    }),
  }
);
```

in there we have hte tool execution function and the tool definition, the execution will call the `execute` function with the sql query generated by the llm

the definition describes what the tool does, note that I input the database shcema here so the llm can use it to generate the SQL query.

finally, I need to hook this to the langgraph agent:

```ts
const agent = createReactAgent({
  llm: new ChatOllama({ model: "llama3.2", temperature: 0 }),
  tools: [getFromDB],
});
```

now we can start asking some questions like:

- how many order are there
- return all orders
- which customers placed the most orders

let's look at the sql generated.