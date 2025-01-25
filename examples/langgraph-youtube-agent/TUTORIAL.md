# Building AI Agents with Langgraph

In this tutorial, you’ll learn how to build a YouTube transcription agent using Langgraph—an agentic framework that makes it easy to integrate large language models and tools into your application. We will build a Next.js chat application, integrate Langgraph with a locally running LLM, and further enhance our agent by adding tool calling via playwright and wxflows. Whether you’re new to AI agents or looking to expand your toolkit, this step-by-step guide has you covered.

## 1. Create the Next.js Chat Application

Start by creating a Next.js project that will serve as the front end for our agent. Follow these steps:

1. **Create a new Next.js project:**

   ```bash
   npx create-next-app@latest langgraph-youtube-agent
   ```

   Follow all steps as directed. This will create a new directory called `langgraph-youtube-agent` with the boilerplate code for the Next.js application.

2. **Move into the project directory and start the application:**

   ```bash
   cd langgraph-youtube-agent
   npm run dev
   ```

3. **Edit the homepage by stripping the contents of `src/app/page.tsx` and adding the following:**

   ```jsx
   export default function Home() {
     return <div className="flex flex-col h-full bg-gray-800"></div>;
   }
   ```

   This provides a blank slate to which we can add a header. Next, add a header component:

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

   Then add a bar to submit a YouTube video link:

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

   Next, add placeholder video transcription content using the following embed code:

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

   Finally, open `globals.css` and remove everything except:

   ```
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

This sets up a clean Next.js interface that we’ll enhance in the next sections.

---

## 2. Adding Langgraph

Langgraph is the agentic framework we will use to connect our UI with powerful LLM capabilities. In this tutorial, we use a locally running model provided by [Ollama](https://ollama.com/).

### Running Your Local Model

Download and install Ollama, then run the following command in a separate terminal tab or window:

```bash
ollama run llama3.2
```

This will start the model, which can also be accessed via watsonx.ai for production deployments.

### Installing Langgraph

1. Stop the running application from your terminal (keeping the Ollama terminal open) and install the SDK:

   ```bash
   npm install @langchain/langgraph @langchain/core @langchain/ollama
   ```

2. Create a new file in `src/app` named `action.ts` and add the following code:

   ```ts
   "use server";
   
   export async function transcribe(videoUrl: string) {}
   ```

This file will house the connection logic between Langgraph and our business logic. Continue by importing the necessary dependencies:

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

Next, connect this logic to the frontend:

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

And update the button click to trigger the transcription:

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

Finally, render the video based on the returned data:

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

Paste a YouTube video link (for example, [this video](https://www.youtube.com/watch?v=xBSMBEowLcY)) into the input and watch the embedded video render dynamically. You can also try another link like [this one](https://www.youtube.com/watch?v=qAF1NjEVHhY).

---

## 3. Adding More Tools with Langgraph

A popular pattern for building AI agents is tool calling, where the LLM can decide which function to call based on the conversation context. Here, we introduce a tool for scraping YouTube video details using the [playwright](https://playwright.dev/) library.

### Installing Playwright

Install the package:

```bash
npm i playwright
```

You might need to run `npx install playwright` the first time to download the necessary browsers.

### Adding a Playwright-Based Tool

In the `src/app/actions.ts` file, import playwright and create a tool that fetches the title and description:

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

Update the agent’s tool configuration and system prompt accordingly:

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

Update the frontend to use TypeScript type safety:

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

Finally, render the dynamic title and description:

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

---

## 4. Enhancing Tool Calling with wxflows

While building tools natively with Langgraph is powerful, it can be time-consuming. Instead, you can use wxflows for efficient tool calling. wxflows provides both a CLI and an SDK to streamline tool development.

### Setting Up wxflows

1. **Initialize a wxflows Project:**

   ```bash
   mkdir wxflows
   cd wxflows
   wxflows init
   ```

   You can set your own endpoint or use the autogenerated suggestion (e.g., `api/langgraph-youtube-agent`).

2. **Import an Existing Tool:**

   Import the `youtube_transcript` tool:

   ```bash
   wxflows import tool https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/youtube_transcript.zip
   ```

   This command creates necessary files, including `tools.graphql`, which contains the tool definitions.

3. **Deploy the Tools:**

   Deploy the tools to an endpoint with:

   ```bash
   wxflows deploy
   ```

   The printed endpoint will be needed later.

### Integrate Using the wxflows SDK

1. **Install the wxflows SDK in Your Project:**

   ```bash
   cd ../
   npm i @wxflows/sdk
   ```

2. **Create a `.env` File with the Required Variables:**

   ```bash
   WXFLOWS_APIKEY=
   WXFLOWS_ENDPOINT=
   ```

   Retrieve the API key by running:

   ```bash
   wxflows whoami --apikey
   ```

3. **Update `src/app/actions.ts` to Import and Configure wxflows:**

   ```ts
   import wxflows from "@wxflows/sdk/langchain";
   ```

   Set up the connection using environment variables:

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

   Then update the agent’s configuration and system prompt to include the imported tool:

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

4. **Update the Frontend to Render the Transcript**

   First, update the video type with a `captions` field:

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

   Then, render the transcript:

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

In addition to these steps, you might consider adding features such as streaming, loading and error messages, and authentication to further enhance your agent.

---

## Conclusion

In this tutorial, we walked through the process of creating a Next.js chat application, integrating Langgraph with a locally running model, and enhancing our AI agent using tool calling with both playwright and wxflows. This approach not only simplifies integrating multiple tools and LLMs into your application but also sets the stage for further enhancements like real-time streaming and robust error handling. Armed with these insights, you’re now ready to experiment further and build more sophisticated AI agents using Langgraph. Happy coding!