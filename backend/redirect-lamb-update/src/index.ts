import rp from 'request-promise';
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
} from 'graphql';
import {
  Endpoint,
  Endpoints,
  GraphQLParameters,
  RootGraphQLSchema,
  SwaggerToGraphQLOptions,
} from './types';
import { getAllEndPoints, loadRefs, loadSchema } from './swagger';
import {
  jsonSchemaTypeToGraphQL,
  mapParametersToFields,
  parseResponse,
} from './typeMap';

const resolver = (
  endpoint: Endpoint,
  proxyUrl: Function | string | null,
  customHeaders = {},
) => async (
  _,
  args: GraphQLParameters,
  opts: SwaggerToGraphQLOptions,
  info: GraphQLResolveInfo,
) => {
  const proxy = !proxyUrl
    ? opts.GQLProxyBaseUrl
    : typeof proxyUrl === 'function'
    ? proxyUrl(opts)
    : proxyUrl;
  const req = endpoint.request(args, proxy);
  if (opts.headers) {
    const { host, ...otherHeaders } = opts.headers;
    req.headers = Object.assign(req.headers, otherHeaders, customHeaders);
  } else {
    req.headers = Object.assign(req.headers, customHeaders);
  }
  const res = await rp(req);
  return parseResponse(res, info.returnType);
};

const getFields = (
  endpoints: Endpoints,
  isMutation: boolean,
  gqlTypes,
  proxyUrl,
  headers,
): GraphQLFieldConfigMap<any, any> => {
  return Object.keys(endpoints)
    .filter((operationId: string) => {
      return !!endpoints[operationId].mutation === !!isMutation;
    })
    .reduce((result, operationId) => {
      const endpoint: Endpoint = endpoints[operationId];
      const type = GraphQLNonNull(
        jsonSchemaTypeToGraphQL(
          operationId,
          endpoint.response || { type: 'string' },
          'response',
          false,
          gqlTypes,
        ),
      );
      const gType: GraphQLFieldConfig<any, any> = {
        type,
        description: endpoint.description,
        args: mapParametersToFields(endpoint.parameters, operationId, gqlTypes),
        resolve: resolver(endpoint, proxyUrl, headers),
      };
      return { ...result, [operationId]: gType };
    }, {});
};

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const schemaFromEndpoints = (endpoints: Endpoints, typeDefs) => {
  const gqlTypes = {};
  const queryFields = getFields(endpoints, false, gqlTypes, null, null);
  if (!Object.keys(queryFields).length) {
    throw new Error('Did not find any GET endpoints');
  }

  const mutationFields = getFields(
    endpoints,
    true,
    gqlTypes,
    null,
    null,
  );

  const getReturnValueString = function (itemName, itemType, items) {
    let localTypeDef = JSON.parse(JSON.stringify(typeDefs));
    if (!itemType) {
      return itemName;
    }
    
    itemType = JSON.stringify(itemType).replace('!', '').replace(' ', '').replace(/"/g, '');
    if (itemType.toLowerCase() === 'array') {
      if (items.type) {
        return itemName
      } else {
        let defTypeName = items['$ref'].replace('#/definitions/', '')
        return getReturnValueString(itemName, defTypeName, {})
      }
    }
    if (!localTypeDef[itemType]) {
      if (!itemName.length) {
        return '{empty}';
      }
      return itemName;
    }
    let properties = localTypeDef[itemType].properties;
    let propertyKeys = Object.keys(properties);
    
    return `${itemName}{${propertyKeys.map(pKey => {
        return getReturnValueString(pKey, properties[pKey].type || properties[pKey]['$ref'].replace('#/definitions/', ''), properties[pKey].items)
      }).join(" ")}}`;
  }

  let queryAndMutations = {}
  let queryKeys = Object.keys(queryFields);
  for (let i = 0; i < queryKeys.length; i ++) {
    let key = queryKeys[i];
    let args = queryFields[key].args;
    let argKeys = Object.keys(args);
    let paramsWithType = argKeys.map(argKey => `$${argKey}: ${args[argKey].type}`).join(', ');
    let params = argKeys.map(argKey => `${argKey}: $${argKey}`).join(', ');

    let returnValues = getReturnValueString('', queryFields[key].type, {});
    queryAndMutations[key] = `query ${capitalize(key)}(${paramsWithType}){${key}(${params}) ${returnValues}}`;
  }

  let mutationKeys = Object.keys(mutationFields);
  for (let i = 0; i < mutationKeys.length; i ++) {
    let key = mutationKeys[i];
    let args = mutationFields[key].args;
    let argKeys = Object.keys(args);
    let paramsWithType = argKeys.map(argKey => `$${argKey}: ${args[argKey].type}`).join(', ');
    let params = argKeys.map(argKey => `${argKey}: $${argKey}`).join(', ');

    let returnValues = getReturnValueString('', mutationFields[key].type, {});
    queryAndMutations[key] = `mutation ${capitalize(key)}(${paramsWithType}){${key}(${params}) ${returnValues}}`;
  }

  return queryAndMutations;
};

const build = async (
  swaggerPath: string
) => {
  const swaggerSchema = await loadSchema(swaggerPath);
  const refs = await loadRefs(swaggerPath);
  const endpoints = getAllEndPoints(swaggerSchema, refs);
  const queryAndMutations = schemaFromEndpoints(endpoints, swaggerSchema.definitions);
  return queryAndMutations;
};

module.exports = build;
export default build;
