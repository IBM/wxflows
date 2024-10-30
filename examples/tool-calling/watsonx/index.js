import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { execTools, fetchTools } from './sdk.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    process.env.IBM_CREDENTIALS_FILE = './.env';

    const client = WatsonXAI.newInstance({
        version: '2024-05-31',
        serviceUrl: process.env.WATSONX_AI_ENDPOINT
    });

    const params = {
        modelId: 'mistralai/mistral-large',
        projectId: process.env.WATSONX_AI_PROJECT_ID,
        maxTokens: 100,
    };

    const messages = [
        {
            role: 'user',
            content: [{ type: 'text', text: 'Search information about the book escape from james patterson' }]
        }
    ]

    const tools = await fetchTools()
    const chatCompletion = await client.textChat({
        messages,
        tools,
        ...params
    })

    const toolMessages = await execTools(chatCompletion)

    const newMessages = [
        ...messages,
        ...toolMessages
    ]

    const chatCompleted = await client.textChat({
        messages: newMessages,
        tools,
        ...params
    })


    console.log(JSON.stringify(chatCompleted))
}

main();