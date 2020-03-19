require('isomorphic-fetch');

// Require AppSync module
const env = require('process').env;
const AWS = require('aws-sdk');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

AWS.config.update({
    region: env.AWS_REGION,
    credentials: new AWS.Credentials(env.AWS_ACCESS_KEY_ID, env.AWS_SECRET_ACCESS_KEY, env.AWS_SESSION_TOKEN)
});

const graphqlEndpoint = "https://go7u5q3ckfbdbatu3gh3zajnoy.appsync-api.eu-west-2.amazonaws.com/graphql";

const AppSyncConfig = {
    url: graphqlEndpoint,
    region: env.AWS_REGION,
    auth: {
        type: AUTH_TYPE.AWS_IAM,
        credentials: AWS.config.credentials,
    },
    disableOffline: true,
};

const options = {
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
    },
};


// Set up Apollo client
const client = new AWSAppSyncClient(AppSyncConfig, options);

const queriesAndMutations = $QUERIES_AND_MUTATIONS;

exports.handler = async (event) => {
    console.log('event -------', JSON.stringify(event))
    let qm = queriesAndMutations[event.fun];
  
    let query = gql(qm);
    let params = event.params;
    let result;

    try {
      if (qm.indexOf('mutation') === 0) {
        result = await client.mutate({
          mutation: query,
          variables: params
        })
        console.log('success:', result);
        return {
          success: true
        }
      } else {
        result = await client.query({
          query,
          variables: params
        });
        console.log('success:', result);
        return result.data[event.fun];
      }
    } catch (err) {
      console.log('error:', err);
      return {
        success: false,
        err
      };
    }
};