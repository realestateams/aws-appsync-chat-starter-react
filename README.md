# ChatQLv2: An AWS AppSync Chat Starter App written in React

## How to use Swagger to graphql

1. Go to project root folder

2. run below command

```
npm i -g swagger-to-graphql
swagger-to-graphql --swagger=./swaggerdoc.yaml > ./swagger_gen_schema.graphql
```
It will generate graphql schema from swagger documentation.

## Deployment process

1. Go to serverless folder
2. Create graphql file from swagger file

```
npm i -g swagger-to-graphql
swagger-to-graphql --swagger=./swaggerdoc.yaml > ./swagger_gen_schema.graphql
```
3. Deploy graphql
```
npm i -g serverless
serverless deploy
```
4. Replace all endpoints' redirect function uri in swaggerdoc.yaml
Open text editor
Replace all `arn:aws:lambda:eu-west-2:180951574562:function:chatql-apsync-backend-dev-RedirectFunc` with `serverless-output.toml` file's RedirectFuncLambdaFunctionQualifiedArn
5. Replace graphqlEndpoint in `redirect-lambda/template.js`
6. Update `redirect-lambda/index.js` with updated `template.js` and `swaggerdoc.yaml` using redirect function modifier.
Commands
```
cd ../redirect-lamb-update
npm install
npm start
cd ../serverless
```
7. Deploy updated redirect-lambda and Api gateway using `serverless deploy`

## Using Deployed resources
All output data is available at `serverless/serverless-output.toml`.

- Api Gateway endpoint is available as ServiceEndpoint.
- Graphql endpoint is available as GraphQlApiUrl

## Redoc
Endpoint for documentation is added at `/doc`.
It is generated from `public/swaggerdoc.yaml` file.

## How to deploy