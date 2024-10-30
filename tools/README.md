wxflows init --endpoint-name api/langchain-toolcalling \
--import-name google_books  --import-package google_books.zip \
  --import-tool-name google_books --import-tool-description "Retrieve information from Google Books. Find books by search string, for example to search for Daniel Keyes 'Flowers for Algernon' use q: 'intitle:flowers+inauthor:keyes'" --import-tool-fields "books|book" \
--import-name wikipedia  --import-package wikipedia.zip \
  --import-tool-name wikipedia --import-tool-description "Retrieve information from Wikipedia." --import-tool-fields "search|page"