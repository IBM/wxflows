from pydantic import BaseModel, Field, create_model
from typing import Any
from langchain_core.tools import StructuredTool
import requests

# Define a strict mapping between JSON schema types and Python types
JSON_TO_PYTHON_TYPE = {
    "string": str,
    "object": dict,
    "integer": int,
    "number": float,
    "boolean": bool,
    "array": list,
}

class WxFlows:
    def __init__(self, endpoint: str, apikey: str):
        """
        Initialize the WxFlows class with the endpoint and API key.
        
        :param endpoint: The base URL of the API endpoint.
        :param apikey: The API key for authentication.
        """
        self.endpoint = endpoint
        self.apikey = apikey

    # Generates a list of StructuredTool instances from the provided tc_tools JSON structure.
    def lcTools(self):
        tcToolsQuery = """
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
        """

        tools = execute(self.endpoint, self.apikey, {"query": tcToolsQuery})

        tool_list = []

        for tool in tools['data']['tc_tools']:
           # Extract tool information
            function_data = tool.get('function', {})
            tool_name = function_data.get('name', 'unknown_function')
            description = function_data.get('description', 'No description provided.')
            parameters = function_data.get('parameters', {})
            
            # Create a dynamic Pydantic model for the tool's arguments
            model_name = f"{tool_name.capitalize()}Args"
            ArgsSchema = create_dynamic_model(parameters, model_name)

            # Define the tool function
            def tool_function(**kwargs):
                return execute(self.endpoint, self.apikey, kwargs)
            
            # Create the StructuredTool
            structured_tool = StructuredTool(
                name=tool_name,
                description=description,
                args_schema=ArgsSchema,
                func=tool_function
            )
            tool_list.append(structured_tool)

        return tool_list

# executes a custom GraphQL query to a GraphQL endpoint.
def execute(endpoint, apikey, query):
    # Provide an apikey to the endpoint
    # If an apikey is passed, it is compliant with the stepzen apikey structure.
    headers = {}
    if apikey:
        headers = {"Authorization": f"apikey {apikey}"}
    else:
        headers = {}

    try:
        r = requests.post(endpoint, json=query, headers=headers)

        data = r.json()

        return data
    except KeyError as e:
        return e
    
#  Creates a Pydantic model dynamically based on a JSON schema.
def create_dynamic_model(schema: dict, model_name: str) -> BaseModel:
    """
    :param schema: JSON schema describing the model fields.
    :param model_name: Name of the dynamically created model.
    :return: A Pydantic BaseModel representing the schema.
    """
    fields = {}
    for key, details in schema.get("properties", {}).items():
        # Map JSON types to Python types, fallback to Any if type is unsupported
        field_type = JSON_TO_PYTHON_TYPE.get(details.get("type", ""), Any)
        description = details.get("description", "")
        fields[key] = (field_type, Field(..., description=description))
    
    # Create the model with the specified fields
    return create_model(model_name, **fields)
