# Testing

Initial test framework for flow templates.

# Running

Must have one environment variable set:

 * `WXFLOWS_ENDPOINT` - wxflows endpoint all the tests will be deployed to (one at a time). For example:
   ```
   export WXFLOWS_ENDPOINT=https://YOUR_ACCOUNT.YOUR_REGION.stepzen.net/test/snippets/graphql
   ```

You can also set this environment variable in a `.env` file in the `tests` folder. By copying the `.env.example` file.

Must be logged into your wxflows account (matching `YOUR_ACCOUNT` in `WXFLOWS_ENDPOINT`):

```
wxflows login
```

Execute at the root of the snippets repo:

```
cd tests
npm ci
npm test
```

