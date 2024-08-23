require("dotenv").config();
const fetch = require("node-fetch");
const { expect } = require("chai");
const { execSync } = require("child_process");
const { URL } = require("url");
const path = require("node:path");

const authTypes = {
  adminKey: 1,
  apiKey: 2,
  jwt: 3,
  noAuth: 4,
};
Object.freeze(authTypes);

// We use admin key to test because there is a cache optimization for apikey's that is not conducive
// to rapid deploy and run cycles that occur with this type of testing
const adminKey =
  `apikey ` + execSync(`wxflows whoami --adminkey`).toString().trim();
const apiKey =
  `apikey ` + execSync(`wxflows whoami --apikey`).toString().trim();

const endpoint = process.env.WXFLOWS_ENDPOINT;

// deploys the schema in a directory to a wxflows endpoint.
// endpoint is the full URL.
function deployEndpoint(endpoint, dirname) {
  console.log(`deploying ${endpoint} from ${dirname}`);
  const url = new URL(endpoint);
  const endpointPath = url.pathname
    .replace(/^\//, "")
    .replace(/\/__graphql$/, "");

  const configFilePath = dirname
    .replace(/\/__tests$/, "");

  const cmd = `wxflows deploy --configuration-file=${configFilePath}/wxflows.toml`;

  // simple retry with backoff to avoid a deploy error
  // when another client (typically a test) has deployed
  // causing a 'Conflict: content has changed' error.
  const stdout = execSync(
    `${cmd} || (sleep 1; ${cmd}) || (sleep 3; ${cmd})`
  ).toString();
  console.log(stdout);
}

// Runs a GraphQL request against the endpoint
// as a test returning the response.
// The test will fail if the request does not
// have status 200 or has any GraphQL errors.
function runGqlOk(authType, endpoint, query, variables, operationName) {
  switch (authType) {
    case authTypes.adminKey:
      authValue = adminKey;
      break;
    case authTypes.apiKey:
      authValue = apiKey;
      break;
    //  Have not  implemented jwt and noAuth yet
    case authTypes.jwt:
    case authTypes.noAuth:
    default:
      authValue = "";
  }
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authValue,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
      operationName: operationName,
    }),
  })
    .then(function (result) {
      expect(result.status).to.equal(200);
      return result;
    })
    .then(function (result) {
      return result.json();
    })
    .then(function (response) {
      expect(response.errors, `no errors should exist: ${JSON.stringify(response.errors)}`).to.be.undefined;
      return response;
    });
}

// tests that the data in a GraphQL response exists
function expectData(response, value, assert) {
  expect(response.data).to[assert](value);
}

// tests that the key in a GraphQL response exists
function expectField(response, field) {
  expect(response.data).to.have.nested.property(field);
}

// deploys graphql schema located in dirname to the test endpoint provided by the environment (process.env.WXFLOWS_ENDPOINT),
// and then runs through all fo the field selection tests.
function deployAndRun(dirname, tests) {
  it("deploy", function () {
    // deployEndpoint will try up to three times to deploy
    // the schema with a backoff that can total four seconds.
    // So set the timeout to be (3*10)+4 seconds to cover a worst case scenario.
    this.timeout(34000);
    return deployEndpoint(endpoint, dirname);
  });

  tests.forEach(
    ({ label, query, variables, operationName, expectedResponse, expectedFields, authType, assert = 'equal' }) => {
      it(label, function () {
        this.timeout(8000); // Occasional requests take > 2s

        return runGqlOk(
          authType,
          endpoint,
          query,
          variables,
          operationName
        ).then(function (response) {
          if (expectedResponse) {
            expectData(response, expectedResponse, assert);
          }
          if (expectedFields && expectedFields.length > 0) {
            expectedFields.forEach((field) => expectField(response, field))
          }
        });
      });
    }
  );
}

function getTestDescription(testRoot, fullDirName) {
  segments = fullDirName.split(path.sep);
  rootIndex = segments.findIndex((element) => element == testRoot);
  // Construct the test description from the unique path from testRoot, which is likely the root of the git repo.
  // Intentionally not using `path.sep` as this is not a path to a file now, but a test description.
  return segments.slice(rootIndex + 1, -1).join("/");
}

exports.runGqlOk = runGqlOk;
exports.expectData = expectData;
exports.deployAndRun = deployAndRun;
exports.authTypes = authTypes;
exports.getTestDescription = getTestDescription;
