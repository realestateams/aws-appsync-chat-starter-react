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

const GetUser = gql(`query GetUser($userId: String!, $userName: String!){
    getUser(body:{id: $userId, username: $userName}) {
        id
        username
    }
}`);

exports.handler = async (event) => {
    const param = {
        userId: "abc",
        userName: "aaa"
    };

    try {
        const result = await client.query({
            query: GetUser,
            variables: param
        });
        console.log(JSON.stringify(result));
        return result;
    } catch (err) {
        console.log(JSON.stringify(err));
        return err;
    }
};