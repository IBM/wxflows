## Google Books tool

This is a Google Books tool based on the Google Books API.

## Getting started

- Import the tool:

    ```bash
    wxflows init --endpoint-name api/my-project \
        --import-name google_books  \
        --import-package https://raw.githubusercontent.com/IBM/wxflows/refs/heads/main/tools/google_books.zip \
        --import-tool-name google_books \
        --import-tool-description "Retrieve information from Google Books. Find books by search string, for example to search for Daniel Keyes 'Flowers for Algernon' use q: 'intitle:flowers+inauthor:keyes'" \
        --import-tool-fields "books|book"
    ```

- Deploy the wxflows endpoint:

    ```
    wxflows deploy
    ```

## Support

Please [reach out to us on Discord](https://ibm.biz/wxflows-discord) if you have any questions or want to share feedback. We'd love to hear from you!
