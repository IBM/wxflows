## Math tool

This is a math tool based on the Wolfram Alpha API.

## Getting started

- Import the tool:

    ```bash
    wxflows init --endpoint-name api/my-project \
        --import-name math  \
        --import-package https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/math.zip \
        --import-tool-name math \
        --import-tool-description "Performs mathematical calculations, date and unit conversions, formula solving, etc." \
        --import-tool-fields "wolframAlpha"
    ```

- Deploy the wxflows endpoint:

    ```
    wxflows deploy
    ```

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
