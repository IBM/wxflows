## Weather tool

This is a weather tool based on the Open Weather Map API. You need a (free) API Key for Open Weather Map to use this API.

## Get your API Key

[Get a free API Key](https://openweathermap.org/) for Open Weather Map.

## Getting started

To add your API key:

- Copy the file `.env.sample` to `.env` and add the API Key:

    ```bash
    STEPZEN_OPEN_WEATHER_MAP_APIKEY=
    ```

- Save the file.

- Install the [Node.js CLI](https://wxflows.ibm.stepzen.com/docs/installation?cli=node)

- Import the tool:

    ```bash
    wxflows import tool https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/weather.zip
    ```

- Deploy the wxflows endpoint:

    ```
    wxflows deploy
    ```

When deployed, the endpoint will pick up the API Key from your `.env` file.

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
