"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var request_promise_1 = __importDefault(require("request-promise"));
var graphql_1 = require("graphql");
var swagger_1 = require("./swagger");
var typeMap_1 = require("./typeMap");
var resolver = function (endpoint, proxyUrl, customHeaders) {
    if (customHeaders === void 0) { customHeaders = {}; }
    return function (_, args, opts, info) { return __awaiter(_this, void 0, void 0, function () {
        var proxy, req, _a, host, otherHeaders, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    proxy = !proxyUrl
                        ? opts.GQLProxyBaseUrl
                        : typeof proxyUrl === 'function'
                            ? proxyUrl(opts)
                            : proxyUrl;
                    req = endpoint.request(args, proxy);
                    if (opts.headers) {
                        _a = opts.headers, host = _a.host, otherHeaders = __rest(_a, ["host"]);
                        req.headers = Object.assign(req.headers, otherHeaders, customHeaders);
                    }
                    else {
                        req.headers = Object.assign(req.headers, customHeaders);
                    }
                    return [4 /*yield*/, request_promise_1.default(req)];
                case 1:
                    res = _b.sent();
                    return [2 /*return*/, typeMap_1.parseResponse(res, info.returnType)];
            }
        });
    }); };
};
var getFields = function (endpoints, isMutation, gqlTypes, proxyUrl, headers) {
    return Object.keys(endpoints)
        .filter(function (operationId) {
        return !!endpoints[operationId].mutation === !!isMutation;
    })
        .reduce(function (result, operationId) {
        var _a;
        var endpoint = endpoints[operationId];
        var type = graphql_1.GraphQLNonNull(typeMap_1.jsonSchemaTypeToGraphQL(operationId, endpoint.response || { type: 'string' }, 'response', false, gqlTypes));
        var gType = {
            type: type,
            description: endpoint.description,
            args: typeMap_1.mapParametersToFields(endpoint.parameters, operationId, gqlTypes),
            resolve: resolver(endpoint, proxyUrl, headers),
        };
        return __assign({}, result, (_a = {}, _a[operationId] = gType, _a));
    }, {});
};
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var schemaFromEndpoints = function (endpoints, typeDefs) {
    var gqlTypes = {};
    var queryFields = getFields(endpoints, false, gqlTypes, null, null);
    if (!Object.keys(queryFields).length) {
        throw new Error('Did not find any GET endpoints');
    }
    var mutationFields = getFields(endpoints, true, gqlTypes, null, null);
    var getReturnValueString = function (itemName, itemType, items) {
        var localTypeDef = JSON.parse(JSON.stringify(typeDefs));
        if (!itemType) {
            return itemName;
        }
        itemType = JSON.stringify(itemType).replace('!', '').replace(' ', '').replace(/"/g, '');
        console.log('itemType', itemName, itemType, localTypeDef[itemType]);
        if (itemType.toLowerCase() === 'array') {
            if (items.type) {
                return itemName;
            }
            else {
                var defTypeName = items['$ref'].replace('#/definitions/', '');
                return getReturnValueString(itemName, defTypeName, {});
            }
        }
        if (!localTypeDef[itemType]) {
            if (!itemName.length) {
                return '{empty}';
            }
            return itemName;
        }
        var properties = localTypeDef[itemType].properties;
        var propertyKeys = Object.keys(properties);
        return itemName + "{" + propertyKeys.map(function (pKey) {
            return getReturnValueString(pKey, properties[pKey].type || properties[pKey]['$ref'].replace('#/definitions/', ''), properties[pKey].items);
        }).join(" ") + "}";
    };
    console.log('queryFields', mutationFields, JSON.stringify(typeDefs));
    var queryAndMutations = {};
    var queryKeys = Object.keys(queryFields);
    var _loop_1 = function (i) {
        var key = queryKeys[i];
        var args = queryFields[key].args;
        var argKeys = Object.keys(args);
        var paramsWithType = argKeys.map(function (argKey) { return "$" + argKey + ": " + args[argKey].type; }).join(', ');
        var params = argKeys.map(function (argKey) { return argKey + ": $" + argKey; }).join(', ');
        var returnValues = getReturnValueString('', queryFields[key].type, {});
        queryAndMutations[key] = "query " + capitalize(key) + "(" + paramsWithType + "){" + key + "(" + params + ") " + returnValues + "}";
    };
    for (var i = 0; i < queryKeys.length; i++) {
        _loop_1(i);
    }
    var mutationKeys = Object.keys(mutationFields);
    var _loop_2 = function (i) {
        var key = mutationKeys[i];
        var args = mutationFields[key].args;
        var argKeys = Object.keys(args);
        var paramsWithType = argKeys.map(function (argKey) { return "$" + argKey + ": " + args[argKey].type; }).join(', ');
        var params = argKeys.map(function (argKey) { return argKey + ": $" + argKey; }).join(', ');
        var returnValues = getReturnValueString('', mutationFields[key].type, {});
        queryAndMutations[key] = "mutation " + capitalize(key) + "(" + paramsWithType + "){" + key + "(" + params + ") " + returnValues + "}";
    };
    for (var i = 0; i < mutationKeys.length; i++) {
        _loop_2(i);
    }
    return queryAndMutations;
};
var build = function (swaggerPath) { return __awaiter(_this, void 0, void 0, function () {
    var swaggerSchema, refs, endpoints, queryAndMutations;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, swagger_1.loadSchema(swaggerPath)];
            case 1:
                swaggerSchema = _a.sent();
                return [4 /*yield*/, swagger_1.loadRefs(swaggerPath)];
            case 2:
                refs = _a.sent();
                endpoints = swagger_1.getAllEndPoints(swaggerSchema, refs);
                queryAndMutations = schemaFromEndpoints(endpoints, swaggerSchema.definitions);
                return [2 /*return*/, queryAndMutations];
        }
    });
}); };
module.exports = build;
exports.default = build;
