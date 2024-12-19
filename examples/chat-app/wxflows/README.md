This setup imports two tools: `google_books` for retrieving information from Google Books, and `wikipedia` for Wikipedia queries.

Run the following command to initialize the project with these tools:

```bash
wxflows init --endpoint-name api/wxflows-toolcalling \
--import-name google_books --import-package https://github.com/IBM/wxflows/raw/refs/heads/main/tools/google_books.zip \
--import-tool-name google_books --import-tool-description "Retrieve information from Google Books. Find books by search string, for example to search for Daniel Keyes 'Flowers for Algernon' use q: 'intitle:flowers+inauthor:keyes'" --import-tool-fields "books|book" \
--import-name wikipedia --import-package https://github.com/IBM/wxflows/raw/refs/heads/main/tools/wikipedia.zip \
--import-tool-name wikipedia --import-tool-description "Retrieve information from Wikipedia." --import-tool-fields "search|page"
```

This command does the following:

- **Defines an endpoint** `api/wxflows-langgraph` for the project.
- **Imports `google_books` tool** with a description for searching books and specifying fields `books|book`.
- **Imports `wikipedia` tool** with a description for Wikipedia searches and specifying fields `search|page`.
