import * as dotenv from 'dotenv';

dotenv.config();


const chatData = {
    "id": "chatcmpl-ANuNDuQQAolXCgk6ZqMyRdY86WSJ9",
    "object": "chat.completion",
    "created": 1730261607,
    "model": "gpt-3.5-turbo-0125",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": null,
                "tool_calls": [
                    {
                        "id": "call_VUnUJs0H2Dozuq23mAAI0Pxg",
                        "type": "function",
                        "function": {
                            "name": "google_books",
                            "arguments": "{\"query\":\"{\\n  books(q:\\\"escape+james+patterson\\\") {\\n    title\\n    authors\\n    description\\n    publishedDate\\n    pageCount\\n    infoLink\\n  }\\n}\"}"
                        }
                    }
                ],
                "refusal": null
            },
            "logprobs": null,
            "finish_reason": "tool_calls"
        }
    ],
    "usage": {
        "prompt_tokens": 601,
        "completion_tokens": 52,
        "total_tokens": 653,
        "prompt_tokens_details": {
            "cached_tokens": 0
        },
        "completion_tokens_details": {
            "reasoning_tokens": 0
        }
    },
    "system_fingerprint": null
};



export async function execTools(input) {
    let headers = {};
    headers["Content-Type"] = "application/json";
    headers["Authorization"] = `apikey ${process.env.WXFLOWS_APIKEY}`;

    if (input?.choices?.length > 0) {
        const tool_calls = input.choices
            .filter(choice => choice?.finish_reason === "tool_calls" && choice?.message?.tool_calls?.length > 0)
            .map(choice => choice.message.tool_calls)
            .flat()

        const toolCalls = tool_calls
            .filter(tool_call => tool_call?.function?.arguments)
            .map(tool_call => {
                if (tool_call?.function?.arguments) {
                    console.log(tool_call?.function?.arguments)
                    const operation = JSON.parse(tool_call.function.arguments)

                    return {
                        id: tool_call.id,
                        operation
                    }
                } else return undefined
            })
            .filter(Boolean);

        const responses = await Promise.all(toolCalls.map(async (toolCall) => {
            const toolResponse = {
                role: "tool",
                tool_call_id: toolCall.id
            }

            try {
                let requestOptions = {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(toolCall.operation),
                };

                const result = await fetch(process.env.WXFLOWS_ENDPOINT, requestOptions)
                    .then((response) => response.json())
                    .then((result) => result)
                    .catch((error) => console.log("error", error));

                toolResponse.content = JSON.stringify(result.data) || ''
            } catch (e) {
                toolResponse.content = ''
            } finally {
                return toolResponse
            }
        }))

        const inputMessages = input.choices.map((choice) => ({
            ...choice.message,
            content: choice.message.content || '' // openai sdk returns null for content but expects a string when used as message for text completion
        }))

        return [...inputMessages, ...responses];
    }
}

execTools()


export async function fetchTools() {
    let headers = {};
    headers["Content-Type"] = "application/json";
    headers["Authorization"] = `apikey ${process.env.WXFLOWS_APIKEY}`;

    let graphql = JSON.stringify({
        query: `
  query {
    tc_tools {
      ...T
    }
  }
  
  fragment T on TC_Tool {
    type
    ... on TC_FunctionTool {
      function {
        name
        description
        parameters {
          type
          properties
          required
        }
      }
    }
  }
          `,
        variables: {},
    });

    let requestOptions = {
        method: "POST",
        headers: headers,
        body: graphql,
    };

    const result = await fetch(process.env.WXFLOWS_ENDPOINT, requestOptions)
        .then((response) => response.json())
        .then((result) => result)
        .catch((error) => console.log("error", error));

    return result?.data?.tc_tools;
}