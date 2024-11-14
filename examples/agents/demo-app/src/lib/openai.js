import { fetchTools } from "./helpers";

const endpoint = import.meta.env.VITE_WXFLOWS_ENDPOINT
const apikey = import.meta.env.VITE_WXFLOWS_APIKEY

async function callWxFlows(flowName = 'openAI_ChatContent', model = 'gpt-4-turbo', messages, tools) {
    let headers = {};
    headers["Content-Type"] = "application/json";
    headers['Authorization'] = `apikey ${apikey}`

    let graphql = JSON.stringify({
        query: `  
query AgentCalling($messages: InputMessages, $tools: [TC_ToolInput]) {
    ${[flowName]}(
      max_tokens: 500
      model: "${model}"
      messages: $messages
      tools: $tools
    ) {
      finish_reason
      message {
        role
        content
        tool_calls {
          id
          type
          function {
            arguments
            name
            result {
              data
            }
          }
        }
      }
    }
  }
        `,
        variables: {
            messages,
            tools,
        }
    })

    let requestOptions = {
        method: 'POST',
        headers: headers,
        body: graphql
    };

    const result = await fetch(endpoint, requestOptions)
        .then(response => response.json())
        .then(result => result)
        .catch(error => console.log('error', error));

    return result?.data?.openAI_ChatContent
}

export default async function getAnswerFromOpenAI(messages) {
    let tools = []

    tools = await fetchTools()

    let result = await callWxFlows('openAI_ChatContent', 'gpt-4-turbo', messages, tools)

    if (result?.[0]?.finish_reason === 'tool_calls' && result?.[0]?.message?.role === 'assistant') {
        // Append latest message to message history
        messages = [
            ...messages,
            result[0].message,
            ...result[0].message?.tool_calls.map((tool_call) => ({
                role: "tool",
                tool_call_id: tool_call.id,
                content: [{ type: "text", text: JSON.stringify(tool_call.function.result) }]
            }))
        ]

        return getAnswerFromOpenAI(messages)
    }

    return result?.[0].message
}