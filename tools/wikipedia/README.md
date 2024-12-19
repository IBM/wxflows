## Wikipedia tool

This is a Wikipedia tool based on the Wikimedia API.

## Getting started

- Import the tool:

    ```bash
    wxflows init --endpoint-name api/my-project \
        --import-name wikipedia \
        --import-package https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/wikipedia.zip \
        --import-tool-name wikipedia \
        --import-tool-description "Retrieve information from Wikipedia." \
        --import-tool-fields "search|page"
    ```

- Deploy the wxflows endpoint:

    ```
    wxflows deploy
    ```

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
