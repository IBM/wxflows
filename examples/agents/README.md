## Create customers endpoint

1. Create directory
```
mkdir customers
cd customers
```

2. Initiate new project
```
stepzen init --endpoint=api/basicdemo-customers
```

3. Import data source (REST API)
```
stepzen import curl "https://json2api-customers-zlwadjbovq-uc.a.run.app/customers?q=email+eq+john.doe@example.com" --query-name=customerBySearchQuery --query-type=Customer --name=customer
```

4. Open the file `customer/index.graphql` and add a description for the query field `customerBySearchQuery`

```
type Query {
  " you can get customer details if you have the email by defining... And this works for other fields like city too "
  customerBySearchQuery(q: String): [CustomerEntry]
```

5. Run the following command to create a new file `config.yaml` file to make the endpoint public:

```
echo "access:
  policies:
    - type: Query
      policyDefault:
        condition: \"true\"" >> config.yaml
```

6. Deploy endpoint

```
stepzen deploy
```

## Create orders endpoint

1. Create directory
```
cd ../

mkdir orders
cd orders
```

2. Initiate new project
```
stepzen init --endpoint=api/basicdemo-orders
```

3. Import data source (MySQL)
```
stepzen import mysql --non-interactive --db-database=valle --db-host=35.224.227.100 --db-user=testuservalle --db-password=GlueChompUntaintedTattered1022
```

4.  Run the following command to edit the below content to the file `config.yaml` to make the endpoint public:

```
echo "access:
  policies:
    - type: Query
      policyDefault:
        condition: \"true\"" >> config.yaml
```

5. Deploy endpoint

```
stepzen deploy
```

## Create exchange endpoint

1. Create directory

```
cd ../

mkdir exchange
cd exchange
```

2. Initiate new project
```
stepzen init --endpoint=api/basicdemo-exchange
```

3. Import data source (REST API)

```
stepzen import curl 'https://api.frankfurter.app/2023-09-27?amount=10&from=GBP&to=USD' --query-name exchangeRates --query-type Rates --name exchange --path-params='/$date'
```

4. Open the file `exchange/index.graphql` and return the response type for the field `rates` to JSON. This will enable converting different currencies.

```
type Rates {
  amount: Int
  base: String
  date: Date
  rates: JSON
}
```

5. Run the following command to create a new file `config.yaml` file to make the endpoint public:

```
echo "access:
  policies:
    - type: Query
      policyDefault:
        condition: \"true\"" >> config.yaml
```

6. Deploy endpoint

```
stepzen deploy
```

## Create the meta agent

1. Move into the root directory

```
cd ../
```

2. Authenticate to your LLM provider:

  - **OpenAI** 
  
    Create a new file called `.env` and fill it with your OpenAI API key:

    ```
    export STEPZEN_OPENAI_API_KEY=
    ```

  - **watsonx.ai**

    Create a new file called `.env` and fill it with your own credentials (see below):

    ```
    export STEPZEN_WATSONX_HOST=us-south.ml.cloud.ibm.com
    export STEPZEN_WATSONX_PROJECTID=
    export STEPZEN_WATSONX_AI_TOKEN=
    ```

    To get your credentials:

    `STEPZEN_WATSONX_PROJECTID`: IBM watsonx.ai data and models are stored in workspaces that are called projects. After the account activation process finishes, a sandbox project is created for you and your watsonx home page is displayed. You need the project ID for your API requests. To get your project ID, complete the following steps:
      - From your project, click the Manage tab.
      - Copy the project ID from the Details section of the General page.

    `STEPZEN_WATSONX_AI_TOKEN`: You authenticate to the watsonx.ai APIs by including an API key in your code. Use the IBM Cloud console UI to create the key.
      - In the IBM Cloud console, go to Manage > Access (IAM) > API keys.
      - Click Create an IBM Cloud API key.
      - Enter a name and description for your API key.
      - Click Create.
      - Click Copy to copy and save the API key, or click Download.

3. Register the endpoints as tools

  ```
  wxflows init --endpoint-name api/basicdemo-agents \
  --import-name customers  --import-url api/basicdemo-customers \
    --import-tool-name customers --import-tool-description "Retrieve customer information" --import-tool-fields "customerBySearchQuery" \
  --import-name orders  --import-url api/basicdemo-orders --import-prefix "MYSQL_"  \
    --import-tool-name orders --import-tool-description "Retrieve order information for customers" \
  --import-name exchange  --import-url api/basicdemo-exchange \
    --import-tool-name exchange --import-tool-description "Convert currency, supports historical rates" --import-tool-fields "exchangeRates"
  ```

4. Deploy the generated `wxflows.toml` file by running:

  ```bash
  wxflows deploy
  ```

  This will return an endpoint that you can use via the application in the `demo-app` directory in the next section.

## Questions

1. Use the `demo-app` app. Install the dependencies:

  ```
  cd demo-app
  npm i
  ```

2. Add the meta agent endpoint and apikey to `.env`:

  ```
  VITE_WXFLOWS_ENDPOINT=
  VITE_WXFLOWS_APIKEY=
  VITE_AI_ENGINE=
  ```
  To retrieve your API Key you can run the command `wxflows whoami --apikey` in your terminal. The value for `VITE_AI_ENGINE` is either `openai` or `wx` (for watsonx.ai).

3. Start the application:

```
npm run dev
```

3. Open the browser on `http://localhost:5174/`. (Note: check port given by the VITE app, one case was 5173). Use the following questions

- "show me the orders for john.doe@example.com" (customers + orders agent)
- "convert the total cost from USD to EUR, use the conversation rate at the time the order was placed" (exchange agents)

![Demo application](./demo-app/public/basicdemo-agents.png)