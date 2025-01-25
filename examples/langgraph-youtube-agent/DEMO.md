## Create the Next.js chat application

1. Create a new next.js project

```bash
npx create-next-app@latest langgraph-youtube-agent
```

follow all steps as directed

this will create a new directory called `langgraph-youtube-agent` with the boilerplate code for the next.js applicaiton in it

2. move into the directory `langgraph-youtube-agent` and start the application:ß

```bash
cd langgraph-youtube-agent
npm run dev
```

3. we'll strip the contents of `src/app/page.tsx`

and add the following:

```jsx
export default function Home() {
  return <div className="flex flex-col h-full bg-gray-800"></div>;
}
```

this gives us a blank slate to which we can add a header:

```html
<header className="bg-indigo-500 p-2">
  <div className="flex lg:flex-1 items-center justify-center">
    <a href="#" className="m-1.5">
      <span className="sr-only">LangGraph YouTube Transcribe Agent</span>
      <img
        className="h-8 w-auto color-white"
        src="http://localhost:3000/video-player.svg"
        alt=""
      />
    </a>
    <h1 className="text-black font-bold">YouTube Transcribe Agent</h1>
  </div>
</header>
```

then let's add a bar to submit a youtube video link:

```html
<div>
  <div className="flex my-8 mx-40">
    <label htmlFor="email-address" className="sr-only"> Email address </label>
    <input
      id="video-link"
      name="vide-link"
      type="text"
      required
      className="w-full mr-4 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
      placeholder="Enter a YouTube video link"
    />
    <button
      type="submit"
      className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      Let's go
    </button>
  </div>
</div>
```

this gives us a nice template to build the application. Let's add some placholder video transcription that we'll replace with a submitted video later on.

let's try the following video. here we'll need to press the "share" button to get the embed code:

and put it into the application together with some styling:

```html
<div className="flex flex-col my-8 lg:mx-40 mx-8">
  <h1 className="text-2xl font-bold tracking-tight text-white mb-4">
    Retrieved video
  </h1>
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/xBSMBEowLcY?controls=0"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
  ></iframe>

  <div className="mt-4 text-white">
    <h2 className="font-bold text-lg mb-2">Description</h2>
    <p className="text-sm">Lorem ipsum...</p>
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


## Add langgraph

there are a lot of different ways to use langgraph with different llm providers, for example, there's an extension to use it with watsonx.ai or the other big llm providers. for this tutorial however we'll be using a locally running model:

https://ollama.com/

download and install, you can run (in a seperate terminal tab or window) the command for ollama:

```bash
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
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import playwright from "playwright";

export async function transcribe(videoUrl: string) {
  const getYouTubeDetails = tool(
    async (input) => {
      if (input?.videoId) {
        const browser = await playwright["chromium"].launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(`https://www.youtube.com/watch?v=${input.videoId}`);

        const title = await page.locator("h1.ytd-watch-metadata").innerText();
        const description = await page
          .locator("div#description-inner")
          .innerText();

        await browser.close();

        return {
          title,
          description,
        };
      } else {
        return "Not found";
      }
    },
    {
      name: "getYouTubeDetails",
      description: "Call to get the title and description of a YouTube video",
      schema: z.object({
        videoId: z.string().describe("The YouTube video id"),
      }),
    }
  );

  const agent = createReactAgent({
    llm: new ChatOllama({ model: "llama3.2", temperature: 0, format: "json" }),
    tools: [getYouTubeDetails],
  });

  const response = await agent.invoke({
    messages: [
      new SystemMessage(`
            You're a YouTube transcription agent.
        
            You should retrieve the video id for a given YouTube url.
            Use any tool at your disposal if needed.

            Return output in the following structure:

            {
                "videoId": "ID of the video"
            }
        `),
      new HumanMessage(`Here is the YouTube URL: ${videoUrl}.`),
    ],
  });

  return response.messages[response.messages.length - 1].content;
}
```

there's a lot of boilerplate code here, let me walk you through it.

let's connect this in the front side of the application.

```ts
"use client";

import { useState } from "react";
import { transcribe } from "./actions";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [video, setVideo] = useState();

  async function transcribeVideo() {
    const result = await transcribe(videoUrl);

    const parsedResult = JSON.parse(result as string);

    if (parsedResult?.videoId) {
      setVideo(parsedResult);
    }
  }

  //
}
```

And add the functionality when you click the button.

```jsx
<input
    id="video-link"
    name="vide-link"
    type="text"
    required
    value={videoUrl}
    onChange={(e) => setVideoUrl(e.target.value)}
    className="w-full mr-4 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
    placeholder="Enter a YouTube video link"
/>
<button
    type="submit"
    onClick={() => transcribeVideo()}
    className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
>
    Let's go
</button>
```

finally, render the video that was used in the input bar:

```jsx
{
  video ? (
    <div className="flex flex-col my-8 lg:mx-40 mx-8">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-4">
        Retrieved video
      </h1>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${video.videoId}?controls=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>

      <div className="mt-4 text-white">
        <h2 className="font-bold text-lg mb-2">Description</h2>
        <p className="text-sm">Lorem ipsum...</p>
      </div>
    </div>
  ) : null;
}
```

Paste a youtube video link in this box and see the embedded video being shown: https://www.youtube.com/watch?v=xBSMBEowLcY

Or try another:

https://www.youtube.com/watch?v=qAF1NjEVHhY

Hit enter and you'll see the video change.

## We now need to add some tools

one popular pattern is tool calling, where you give the llm the option to use a function to perform an action. the action won't be executed by the LLM but by your application, the llm will generate the function call your application should execute based on the tool definition.

for this we'll install `playwright` which is a linrary to retrieve information from a webpage:

```
npm i playwright
```

the first time you run it you might have to run `npx install playwright` as well to download browsers to the machine.

we're going to import playwright and create a tool to get the video details of the youtube vide in `src/app/actions.ts`:

```ts
import playwright from "playwright";

export async function transcribe(videoUrl: string) {
  const getYouTubeDetails = tool(
    async (input) => {
      if (input?.videoId) {
        const browser = await playwright["chromium"].launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(`https://www.youtube.com/watch?v=${input.videoId}`);

        const title = await page.locator("h1.ytd-watch-metadata").innerText();
        const description = await page
          .locator("div#description-inner")
          .innerText();

        await browser.close();

        return {
          title,
          description,
        };
      } else {
        return "Not found";
      }
    },
    {
      name: "getYouTubeDetails",
      description: "Call to get the title and description of a YouTube video",
      schema: z.object({
        videoId: z.string().describe("The YouTube video id"),
      }),
    }
  );

  //
}
```

and add the tools to the agent plus updating the system prompt:

```ts
const agent = createReactAgent({
  llm: new ChatOllama({ model: "llama3.2", temperature: 0, format: "json" }),
  tools: [getYouTubeDetails],
});

const response = await agent.invoke({
  messages: [
    new SystemMessage(`
            You're a YouTube transcription agent.
        
            You should retrieve the video id for a given YouTube url and return the title and description of the video. 
            Use any tool at your disposal if needed.

            Return output in the following structure:

            {
                "videoId": "ID of the video",
                "title": "video title",
                "description": "video description"
            }
        `),
    new HumanMessage(`Here is the YouTube URL: ${videoUrl}.`),
  ],
});
```

on the frontend we can now use the description and title to dynamicall render:

but first let's fix some typecript warnings and make this page type safe:

```jsx
type Video = {
  videoId: string;
  title: string;
  description: string;
};

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=xBSMBEowLcY"
  );
  const [video, setVideo] = useState<Video>();

  async function transcribeVideo() {
    const result = await transcribe(videoUrl);

    const parsedResult = JSON.parse(result as string) as Video;

    if (parsedResult?.videoId) {
      setVideo(parsedResult);
    }
  }

//
}
```

Now render the title and description:

```jsx
{
  video ? (
    <div className="flex flex-col my-8 lg:mx-40 mx-8">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-4">
        {video.title}
      </h1>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${video.videoId}?controls=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>

      <div className="mt-4 text-white">
        <h2 className="font-bold text-lg mb-2">Description</h2>
        <p className="text-sm">{video.description}</p>
      </div>
    </div>
  ) : null;
}
```

## add a more robust way to work with tools

you can build tools natively using langchain/langgraph, but this is very time consuming and requires a lot of coding. so instead we'll use wxflows for tool calling

it's free to use, and the sdk is open source. we'll need both the cli for development of the tools and the sdk for integrating the tools in our chat application

- sign up for a free account
- install the `wxflows` node.js cli

1. kill the process running the web application in the terminal and then initialize a new project. we'll do this from a fresh directory called `wxflows`:

```bash
mkdir wxflows
cd wxflows
wxflows init
```

you can set your own endpoint, or use then autogenerated suggestion. we'll use: `api/langgraph-youtube-agent`.

2. with wxflows you can create a tool out of a data source or import an existing tool. we've been building a very simple tool to scrape the title of a youtube video but can also import the `youtube_transcript` tool that wxflows has:

```bash
wxflows import tool https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/youtube_transcript.zip
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
cd ../
npm i @wxflows/sdk
```

2. In a new file called `.env` file you need to set two new variables:

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
import wxflows from "@wxflows/sdk/langchain";
```

and set the connection to wxflows using the env variables we've set before:

```ts
export async function transcribe(videoUrl: string) {
  if (!process.env.WXFLOWS_ENDPOINT || !process.env.WXFLOWS_APIKEY) {
    console.log("Something went wrong");
    return null;
  }

  const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT,
    apikey: process.env.WXFLOWS_APIKEY,
  });

  const wxflowsTools = await toolClient.lcTools;

  //
}
```

in here we've set a small notice that pops up when you miss the credentials

the tool definition are already in the format that langchain expects, as we use the langchain integration from the sdk

we need to update the tools we give to the agent, and update the system prompt to work with the imported tool:

```jsx
const agent = createReactAgent({
  llm: new ChatOllama({ model: "llama3.2", temperature: 0, format: "json" }),
  tools: wxflowsTools,
});

const response = await agent.invoke({
  messages: [
    new SystemMessage(`
            You're a YouTube transcription agent.
        
            You should retrieve the video id for a given YouTube url and return the title and description of the video. 
            Also retrieve the transcript for the youtube video using the transcript tool.
            Use all tools at your disposal.

            you have the following tools:
            1. youtube_transcript:
            - Query: { transcript(videoUrl: $videoUrl, langCode: $langCode) { title captions { text start dur } } }
            - Variables: { "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID", "langCode": "en" }

            Generate the description by summarizing the transcript.

            Return output in the following structure:

            {
                "videoId": "ID of the video",
                "title": "video title",
                "description": "video description",
                "transcript": "transcript of the video"
            }


            Do not return the data without populating all fields with data.
        `),
    new HumanMessage(`Here is the YouTube URL: ${videoUrl}.`),
  ],
});
```

as you can see we tell the agent to summarize the transcript to get the description. rather than using the description added to the youtube video. Of course, you could keep the previous tool in there as well, to get the user generated description.

to finish this off, we wil display the transcript:

- first add the captions to the video type:

```ts
"use client";

import { useState } from "react";
import { transcribe } from "./actions";

type Video = {
  videoId: string;
  title: string;
  description: string;
  captions: string;
};

export default function Home() {}
```

- and add the transcript

```jsx
<div className="mt-4 text-white">
  <h2 className="font-bold text-lg mb-2">Description</h2>
  <p className="text-sm">{video.description}</p>
</div>;

{
  video.captions && JSON.parse(video.captions).length > 0 ? (
    <div className="mt-4 text-white">
      <h2 className="font-bold text-lg mb-2">Transcript</h2>

      <ul>
        {JSON.parse(video.captions).map((caption: string) => {
          return <li>{caption}</li>;
        })}
      </ul>
    </div>
  ) : null;
}
```

what else can we add?

- streaming
- loading and error messages
- authentication
