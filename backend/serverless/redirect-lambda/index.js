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

const queriesAndMutations = {"getConvo":"query GetConvo($id: String!){getConvo(id: $id) {id name createdAt messages{id content createdAt owner chatbot isSent file{bucket region key} conversationId} associatedConverLinkId}}","getUser":"query GetUser($id: String!){getUser(id: $id) {id username registered userConversations{id name createdAt messages{id content createdAt owner chatbot isSent file{bucket region key} conversationId} associatedConverLinkId}}}","detectCelebs":"query DetectCelebs($bucket: String!, $key: String!){detectCelebs(bucket: $bucket, key: $key) {bucket key bot text language voice response}}","detectLabels":"query DetectLabels($bucket: String!, $key: String!){detectLabels(bucket: $bucket, key: $key) {bucket key bot text language voice response}}","detectLanguage":"query DetectLanguage($text: String!){detectLanguage(text: $text) {bucket key bot text language voice response}}","detectEntities":"query DetectEntities($language: String!, $text: String!){detectEntities(language: $language, text: $text) {bucket key bot text language voice response}}","detectSentiment":"query DetectSentiment($bucket: String!, $key: String!, $voice: String!, $text: String!){detectSentiment(bucket: $bucket, key: $key, voice: $voice, text: $text) {bucket key bot text language voice response}}","translate":"query Translate($language: String!, $text: String!){translate(language: $language, text: $text) {bucket key bot text language voice response}}",
"createConvo":"mutation CreateConvo($body: ConversationInput!){createConvo(body: $body) {empty}}","createMessage":"mutation CreateMessage($body: MessageInput!){createMessage(body: $body) {id content createdAt owner chatbot isSent file{bucket region key} conversationId}}","registerUser":"mutation RegisterUser($body: UserInput!){registerUser(body: $body) {empty}}","createConvoLink":"mutation CreateConvoLink($body: ConvoLinkInput!){createConvoLink(body: $body) {empty}}","updateConvoLink":"mutation UpdateConvoLink($body: ConvoLinkInput!){updateConvoLink(body: $body) {empty}}"};

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