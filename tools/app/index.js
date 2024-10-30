import OpenAI from 'openai';
import { execTools, fetchTools } from './sdk.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_APIKEY
    })
    const messages = [
        { role: 'system', content: 'When using a GraphQL tool inly use fields that are available for the tool response type, dont try and use fields from other response types' },
        { role: 'user', content: 'Search information about the book escape from james patterson' }
    ]

    const tools = await fetchTools()
    const chatCompletion = await client.chat.completions.create({
        messages,
        model: 'gpt-4',
        tools
    })

    const toolMessages = await execTools(chatCompletion)

    const newMessages = [
        ...messages,
        ...toolMessages
    ]

    const chatCompleted = await client.chat.completions.create({
        messages: newMessages,
        model: 'gpt-4',
        tools
    })

    console.log(JSON.stringify(chatCompleted))
}

main();