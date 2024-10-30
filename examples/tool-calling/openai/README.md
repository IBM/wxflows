1. install wxflows cli

2. run

```
export STEPZEN_OPENAI_API_KEY=....
```

3. run:

```
wxflows init --endpoint-name api/langchain-toolcalling \
--import-name google_books  --import-package https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/google_books.zip \
  --import-tool-name google_books --import-tool-description "Retrieve information from Google Books. Find books by search string, for example to search for Daniel Keyes 'Flowers for Algernon' use q: 'intitle:flowers+inauthor:keyes'" --import-tool-fields "books|book" \
--import-name wikipedia  --import-package https://github.com/IBM/wxflows/raw/refs/heads/tools-example/tools/wikipedia.zip \
  --import-tool-name wikipedia --import-tool-description "Retrieve information from Wikipedia." --import-tool-fields "search|page"
```

4. run:

```
wxflows deploy
```

5. open `app` and run:

```
npm i
```

6. copy `.env.sample` to `.env` and add credentials

7. run:

```
node index.js
```

