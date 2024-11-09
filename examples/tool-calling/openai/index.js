import OpenAI from 'openai';
import wxflows from 'wxflows/openai'
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_APIKEY
    })

    const toolClient = new wxflows({
        endpoint: process.env.WXFLOWS_ENDPOINT,
        apikey: process.env.WXFLOWS_APIKEY,
    })

    const messages = [
        { role: 'system', content: 'When using a GraphQL tool inly use fields that are available for the tool response type, dont try and use fields from other response types' },
        { role: 'user', content: 'Search information about the book escape from james patterson' }
    ]

    const tools = await toolClient.fetchTools()
    const chatCompletion = await client.chat.completions.create({
        messages,
        model: 'gpt-4',
        tools
    })

    const toolMessages = await toolClient.execTools(chatCompletion)

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