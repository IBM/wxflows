"use client"

import { createComponent } from '@lit/react';
import React from 'react';
import CLABSChat from '@carbon-labs/ai-chat/es/components/chat/chat.js';
import './chat.css'

export type ChatMessage = {
    origin: "user" | "bot";
    hasError: boolean;
    userSubmitted: boolean;
    time: string;
    index: number;
    elements: Array<TextElement>;
};

export type TextElement = {
    type: "text";
    content: string;
};

export const Chat = createComponent({
    tagName: 'clabs-chat',
    elementClass: CLABSChat,
    react: React,
    events: {
        onSubmit: 'on-submit',
    },
});