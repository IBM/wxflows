## Exchange tool

This is an exchange rate tool based on the Frankfurter API.

## Getting started

- Import the tool:

    ```bash
    wxflows init --endpoint-name api/my-project \
        --import-name exchange  \
        --import-package https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/exchange.zip \
        --import-tool-name exchange \
        --import-tool-description "Convert currency, supports historical rates. Provide dates in the format YYYY-MM-DD" \
        --import-tool-fields "exchangeRates"
    ```

- Deploy the wxflows endpoint:

    ```
    wxflows deploy
    ```

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
