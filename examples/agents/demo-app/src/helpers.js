const ENDPOINT = import.meta.env.VITE_WXFLOWS_ENDPOINT;
const APIKEY = import.meta.env.VITE_WXFLOWS_APIKEY;
const AI_ENGINE = import.meta.env.VITE_WXFLOWS_AI_ENGINE || 'openai'

const AI_ENGINES = {
  'wx': {
    FLOW_NAME: 'wx_chatContent',
    MODEL: 'mistralai/mistral-large'
  },
  'openai': {
    FLOW_NAME: 'openAI_ChatContent',
    MODEL: 'gpt-4-turbo'
  }
}

export async function fetchTools() {
  let headers = {};
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = `apikey ${APIKEY}`;

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

  const result = await fetch(ENDPOINT, requestOptions)
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => console.log("error", error));

  return result?.data?.tc_tools;
}

async function callWxFlows(flowName, model, messages, tools) {
  let headers = {};
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = `APIKEY ${APIKEY}`;

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
    },
  });

  let requestOptions = {
    method: "POST",
    headers: headers,
    body: graphql,
  };

  const result = await fetch(ENDPOINT, requestOptions)
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => console.log("error", error));
  console.log("chat response: ", JSON.stringify(result));
  return result?.data?.[flowName];
}

export async function getAnswer(messages) {
  let tools = [];

  tools = await fetchTools();

  let result = await callWxFlows(AI_ENGINES[AI_ENGINE].FLOW_NAME, AI_ENGINES[AI_ENGINE].MODEL, messages, tools)

  if (
    result?.[0]?.finish_reason === "tool_calls" &&
    result[0].message?.role === "assistant"
  ) {
    messages.push({
      role: result[0].message.role,
      content: result[0].message.content,
      tool_calls: result[0].message.tool_calls,
    });

    if (result[0].message.tool_calls) {
      const toolCallMessages = result[0].message.tool_calls.map((tool_call) => {
        if (tool_call.id === undefined || tool_call.function === undefined) {
          return undefined;
        }

        return {
          role: "tool",
          tool_call_id: tool_call.id,
          content: [
            {
              type: "text",
              text: JSON.stringify(tool_call.function.result),
            },
          ],
        };
      });
      messages.push(...toolCallMessages.filter(Boolean));
    }

    return getAnswer(messages);
  }

  const message = result?.[0].message || {
    role: "assistant",
    content: "",
  };
  messages.push(message);

  return message;
}

export async function customSendMessage(request, options, instance, messages) {
  let message = "";
  const incoming = request?.input?.text;

  if (incoming) {
    messages.push({
      role: "user",
      content: incoming,
    });

    const result = await getAnswer(messages);

    const outcoming = result?.content;

    message = {
      output: {
        generic: [
          {
            response_type: "text",
            text: outcoming,
          },
        ],
      },
    };
  } else {
    message = {
      output: {
        generic: [
          {
            response_type: "text",
            text: "How can I help you?",
          },
        ],
      },
    };
  }

  instance.messaging.addMessage(message);
  return;
}
