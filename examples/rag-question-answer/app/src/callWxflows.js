import { ChatWXFlows } from 'chatwxflows'
import { calculatorTool } from './tools';

export async function getAnswer(question) {
    const chatModel = new ChatWXFlows({ 
        n: 4, 
        endpoint: import.meta.env.VITE_WXFLOWS_ENDPOINT,
        apikey: import.meta.env.VITE_WXFLOWS_APIKEY,
        flowName: 'myRag',
        variables: {
            n: 5,
            aiEngine: 'WATSONX',
            model: 'ibm/granite-13b-chat-v2',
            collection: 'watsonxdocs',
            parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                stop_sequences: ['\n\n'],
            },
            searchEngine: 'GETTINGSTARTED',
        }
    });

    const llmWithTools = chatModel.bindTools([calculatorTool]);

    const res = await llmWithTools.invoke(question);
    
    return res.content
}