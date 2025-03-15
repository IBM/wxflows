"use client";

import { useState } from "react";
import { message, type Message } from "./actions";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You're a helpful assistant who's going to use a set of tools to answer my questions",
    },
  ]);

  async function sendMessage() {
    setIsLoading(true);

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
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-screen justify-between">
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
          <h1 className="text-black font-bold">Chat application</h1>
        </div>
      </header>
      <div className="flex flex-col flex-auto justify-between bg-gray-100 p-6">
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

        <div className="top-[100vh] flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
          {/* <div>
            <button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                ></path>
              </svg>
            </button>
          </div> */}
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
        </div>
      </div>
    </div>
  );
}
