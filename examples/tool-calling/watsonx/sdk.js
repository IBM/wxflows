import * as dotenv from 'dotenv';

dotenv.config();

export async function execTools(input) {
    let headers = {};
    headers["Content-Type"] = "application/json";
    headers["Authorization"] = `apikey ${process.env.WXFLOWS_APIKEY}`;

    // for watsonx, the response is slightly different formatted
    input = input?.result

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
            content: choice.message.content || ''
        }))

        return [...inputMessages, ...responses];
    }
}

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