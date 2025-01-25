"use client";

import { useState } from "react";
import { transcribe } from "./actions";

type Video = {
  videoId: string;
  title: string;
  description: string;
  captions: string;
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

  return (
    <div className="flex flex-col h-full bg-gray-800">
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
      <div className="flex my-8 lg:mx-40 mx-8">
        <label htmlFor="email-address" className="sr-only">
          YouTube video link
        </label>
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
      </div>
      {video ? (
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

          {video.captions && JSON.parse(video.captions).length > 0 ? (
            <div className="mt-4 text-white">
              <h2 className="font-bold text-lg mb-2">Transcript</h2>

              <ul>
                {JSON.parse(video.captions).map((caption: string) => {
                  return <li>{caption}</li>;
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
