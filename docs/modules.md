[harproxyserver](README.md) / Exports

# harproxyserver

## Table of contents

### Type Aliases

- [AppendEntryAndSaveHarFn](modules.md#appendentryandsaveharfn)
- [HarEntryParams](modules.md#harentryparams)
- [LoadHarDataFn](modules.md#loadhardatafn)

### Functions

- [appendEntryAndSaveHar](modules.md#appendentryandsavehar)
- [createHarEntryFromText](modules.md#createharentryfromtext)
- [filterAndSaveHarLog](modules.md#filterandsaveharlog)
- [filterHarLog](modules.md#filterharlog)
- [findHarEntry](modules.md#findharentry)
- [getRecordedHarMiddleware](modules.md#getrecordedharmiddleware)
- [getRecorderHarMiddleware](modules.md#getrecorderharmiddleware)
- [loadHarData](modules.md#loadhardata)
- [requestBodyBufferMiddleware](modules.md#requestbodybuffermiddleware)

## Type Aliases

### AppendEntryAndSaveHarFn

Ƭ **AppendEntryAndSaveHarFn**: (`entry`: `Entry`, `filePath`: `string`) => `Promise`\<`Har`\>

A type representing a function that sets a new HAR entry and saves it to a given file.

#### Type declaration

▸ (`entry`, `filePath`): `Promise`\<`Har`\>

##### Parameters

| Name       | Type     | Description                                           |
| :--------- | :------- | :---------------------------------------------------- |
| `entry`    | `Entry`  | The new HAR entry to be added.                        |
| `filePath` | `string` | The path of the file to save the updated HAR data to. |

##### Returns

`Promise`\<`Har`\>

#### Defined in

[src/harUtils.ts:22](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harUtils.ts#L22)

---

### HarEntryParams

Ƭ **HarEntryParams**: `Object`

Type for the parameter object of the createHarEntryFromText function.

#### Type declaration

| Name             | Type       | Description                                                                 |
| :--------------- | :--------- | :-------------------------------------------------------------------------- |
| `baseUrl`        | `string`   | The base URL of the request (example: 'https://example.com').               |
| `endpoint`       | `string`   | The endpoint of the request (example: '/book/story/?page=4').               |
| `headers?`       | `Header`[] | The response headers (default: an empty array). Optional.                   |
| `mimeType?`      | `string`   | The MIME type of the response body (default: 'application/json'). Optional. |
| `requestMethod?` | `string`   | The HTTP method used for the request (default: 'GET'). Optional.            |
| `statusCode?`    | `number`   | The HTTP status code of the response (default: StatusCodes.OK). Optional.   |
| `text`           | `string`   | The text of the response body.                                              |

#### Defined in

[src/harUtils.ts:149](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harUtils.ts#L149)

---

### LoadHarDataFn

Ƭ **LoadHarDataFn**: (`filePath`: `string`) => `Promise`\<`Har`\>

A type representing a function that retrieves a HAR object from a given file.

#### Type declaration

▸ (`filePath`): `Promise`\<`Har`\>

##### Parameters

| Name       | Type     | Description                                     |
| :--------- | :------- | :---------------------------------------------- |
| `filePath` | `string` | The path of the file to read the HAR data from. |

##### Returns

`Promise`\<`Har`\>

#### Defined in

[src/harUtils.ts:11](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harUtils.ts#L11)

## Functions

### appendEntryAndSaveHar

▸ **appendEntryAndSaveHar**(`entry`, `filePath`): `Promise`\<`Har`\>

Appends the given HAR entry to the existing HAR log and saves it to the specified file.
If the file does not exist or cannot be read, a new HAR log will be created with the given entry.

#### Parameters

| Name       | Type     | Description                                 |
| :--------- | :------- | :------------------------------------------ |
| `entry`    | `Entry`  | The HAR entry to save                       |
| `filePath` | `string` | The path of the file to save the HAR log to |

#### Returns

`Promise`\<`Har`\>

The updated HAR object

#### Defined in

[src/harFileUtils.ts:84](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harFileUtils.ts#L84)

---

### createHarEntryFromText

▸ **createHarEntryFromText**(`params`): `Entry`

Creates a HAR (HTTP Archive) entry object from the given input parameters.

#### Parameters

| Name     | Type                                          | Description                                |
| :------- | :-------------------------------------------- | :----------------------------------------- |
| `params` | [`HarEntryParams`](modules.md#harentryparams) | The parameters for creating the HAR entry. |

#### Returns

`Entry`

The generated HAR entry object.

#### Defined in

[src/harUtils.ts:178](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harUtils.ts#L178)

---

### filterAndSaveHarLog

▸ **filterAndSaveHarLog**(`inputFilePath`, `outputFilePath`, `method`, `endpoint`, `endpointRegex?`, `ignoreSearch?`, `prefixToRemove?`, `sanitize?`): `Promise`\<`void`\>

Loads a HAR file, filters it, and saves the filtered result to a new file.

#### Parameters

| Name              | Type      | Default value | Description                                                                                                     |
| :---------------- | :-------- | :------------ | :-------------------------------------------------------------------------------------------------------------- |
| `inputFilePath`   | `string`  | `undefined`   | The path of the input HAR file to load and filter.                                                              |
| `outputFilePath`  | `string`  | `undefined`   | The path of the output file to save the filtered HAR log.                                                       |
| `method`          | `string`  | `undefined`   | The HTTP method to filter by.                                                                                   |
| `endpoint`        | `string`  | `undefined`   | The endpoint (pathname and search) to filter by, e.g., "/users?id=123".                                         |
| `endpointRegex?`  | `RegExp`  | `undefined`   | Optional regular expression to match the endpoint against.                                                      |
| `ignoreSearch?`   | `boolean` | `false`       | Optional flag to ignore the search part of the URL when matching endpoints.                                     |
| `prefixToRemove?` | `string`  | `undefined`   | Optional prefix to remove from the beginning of the `entry.request.path` property before matching the endpoint. |
| `sanitize?`       | `boolean` | `undefined`   | Optional remove headers and cookies from the har file.                                                          |

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the filtered HAR log is saved to the output file, or rejects if there's an error.

#### Defined in

[src/harFileUtils.ts:48](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harFileUtils.ts#L48)

---

### filterHarLog

▸ **filterHarLog**(`harLog`, `method`, `endpoint`, `endpointRegex?`, `ignoreSearch?`, `prefixToRemove?`, `sanitize?`): `Log`

Filters a HAR log and returns a filtered HAR log based on the specified inputs.

#### Parameters

| Name              | Type                           | Default value | Description                                                                                                     |
| :---------------- | :----------------------------- | :------------ | :-------------------------------------------------------------------------------------------------------------- |
| `harLog`          | `undefined` \| `null` \| `Log` | `undefined`   | The HAR log to filter.                                                                                          |
| `method`          | `string`                       | `undefined`   | The HTTP method to filter by.                                                                                   |
| `endpoint`        | `string`                       | `undefined`   | The endpoint (pathname and search) to filter by, e.g., "/users?id=123".                                         |
| `endpointRegex?`  | `RegExp`                       | `undefined`   | Optional regular expression to match the endpoint against.                                                      |
| `ignoreSearch?`   | `boolean`                      | `false`       | Optional flag to ignore the search part of the URL when matching endpoints.                                     |
| `prefixToRemove?` | `string`                       | `undefined`   | Optional prefix to remove from the beginning of the `entry.request.path` property before matching the endpoint. |
| `sanitize?`       | `boolean`                      | `undefined`   | Optional remove headers and cookies from the har file.                                                          |

#### Returns

`Log`

The filtered HAR log. If no matching entries are found, an empty log will be returned.

#### Defined in

[src/harUtils.ts:84](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harUtils.ts#L84)

---

### findHarEntry

▸ **findHarEntry**(`harLog`, `method`, `endpoint`, `endpointRegex?`, `ignoreSearch?`, `prefixToRemove?`): `Entry` \| `null`

Finds the HAR entry in the given log with the matching HTTP method and endpoint.

#### Parameters

| Name              | Type                           | Default value | Description                                                                                                                                                   |
| :---------------- | :----------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `harLog`          | `undefined` \| `null` \| `Log` | `undefined`   | The HAR log to search through.                                                                                                                                |
| `method`          | `string`                       | `undefined`   | The HTTP method of the desired entry.                                                                                                                         |
| `endpoint`        | `string`                       | `undefined`   | The endpoint (pathname and search) of the desired entry, e.g., "/users?id=123".                                                                               |
| `endpointRegex?`  | `RegExp`                       | `undefined`   | Optional regular expression to match the endpoint against. For example, to match endpoints that start with "/users" followed by a number, use `/^/users\d+/`. |
| `ignoreSearch?`   | `boolean`                      | `false`       | Optional flag to ignore the search part of the URL when matching endpoints.                                                                                   |
| `prefixToRemove?` | `string`                       | `undefined`   | Optional prefix to remove from the beginning of the `entry.request.path` property before matching the endpoint.                                               |

#### Returns

`Entry` \| `null`

The matching HAR entry if found, or null if not found.

#### Defined in

[src/harUtils.ts:35](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harUtils.ts#L35)

---

### getRecordedHarMiddleware

▸ **getRecordedHarMiddleware**(`harFilePath`, `getHar`, `prefix`): (`req`: `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\>, `res`: `Response`\<`any`, `Record`\<`string`, `any`\>\>, `next`: `NextFunction`) => `Promise`\<`void`\>

A middleware factory that reads the HAR file and returns the body of the recorded request
based on the path and method.

#### Parameters

| Name          | Type                                        | Description                      |
| :------------ | :------------------------------------------ | :------------------------------- |
| `harFilePath` | `string`                                    | The path of the HAR file to read |
| `getHar`      | [`LoadHarDataFn`](modules.md#loadhardatafn) | -                                |
| `prefix`      | `string`                                    | -                                |

#### Returns

`fn`

Express middleware

▸ (`req`, `res`, `next`): `Promise`\<`void`\>

##### Parameters

| Name   | Type                                                                                   |
| :----- | :------------------------------------------------------------------------------------- |
| `req`  | `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\> |
| `res`  | `Response`\<`any`, `Record`\<`string`, `any`\>\>                                       |
| `next` | `NextFunction`                                                                         |

##### Returns

`Promise`\<`void`\>

#### Defined in

[src/getRecordedHarMiddleware.ts:13](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/getRecordedHarMiddleware.ts#L13)

---

### getRecorderHarMiddleware

▸ **getRecorderHarMiddleware**(`harFilePath`, `appendEntryAndSaveHar`, `targetUrl`): (`proxyRes`: `IncomingMessage`, `req`: `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\>, `res`: `Response`\<`any`, `Record`\<`string`, `any`\>\>) => `void`

Creates a proxy response handler to be used as the `onProxyRes` callback in http-proxy-middleware.

The handler:

- Streams response chunks to the client immediately
- Accumulates chunks for HAR file recording
- Decompresses gzipped responses for HAR file

#### Parameters

| Name                    | Type                                                            | Description                                             |
| :---------------------- | :-------------------------------------------------------------- | :------------------------------------------------------ |
| `harFilePath`           | `string`                                                        | The file path to save the HAR file.                     |
| `appendEntryAndSaveHar` | [`AppendEntryAndSaveHarFn`](modules.md#appendentryandsaveharfn) | Function to append the new entry and save the HAR file. |
| `targetUrl`             | `string`                                                        | The prefix for the HAR playback endpoint.               |

#### Returns

`fn`

A event handler for http-proxy-middleware's `onProxyRes`.

▸ (`proxyRes`, `req`, `res`): `void`

##### Parameters

| Name       | Type                                                                                   |
| :--------- | :------------------------------------------------------------------------------------- |
| `proxyRes` | `IncomingMessage`                                                                      |
| `req`      | `Request`\<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`\<`string`, `any`\>\> |
| `res`      | `Response`\<`any`, `Record`\<`string`, `any`\>\>                                       |

##### Returns

`void`

#### Defined in

[src/getRecorderHarMiddleware.ts:29](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/getRecorderHarMiddleware.ts#L29)

---

### loadHarData

▸ **loadHarData**(`filePath`): `Promise`\<`Har`\>

Reads a HAR file and returns the parsed HAR object.
If the file doesn't exist, returns an empty HAR object.

#### Parameters

| Name       | Type     | Description                      |
| :--------- | :------- | :------------------------------- |
| `filePath` | `string` | The path of the HAR file to read |

#### Returns

`Promise`\<`Har`\>

The parsed HAR object or an empty HAR if file doesn't exist

**`Throws`**

Will throw an error if the HAR file exists but cannot be parsed

#### Defined in

[src/harFileUtils.ts:15](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/harFileUtils.ts#L15)

---

### requestBodyBufferMiddleware

▸ **requestBodyBufferMiddleware**(`req`, `res`, `next`): `void`

Express middleware that buffers the **client request body** stream.

HTTP request bodies are streams that can only be read once, creating a conflict:

- The proxy needs to forward the body to the upstream server
- The HAR recorder needs to save the body to the HAR file
- Streams can only be consumed once

This middleware uses express.raw() to:

1. Read all chunks from the incoming request stream
2. Concatenate them into a single Buffer
3. Store the buffer in req.rawBody for later use
4. Allow the proxy to forward the buffered body to upstream
5. Allow the HAR recorder to save the buffered body to the HAR file

Note: The response side uses a different approach - it streams chunks to the
client immediately while accumulating them for the HAR file in parallel.

#### Parameters

| Name   | Type                                  |
| :----- | :------------------------------------ |
| `req`  | `IncomingMessage`                     |
| `res`  | `ServerResponse`\<`IncomingMessage`\> |
| `next` | `NextFunction`                        |

#### Returns

`void`

#### Defined in

[src/getRecorderHarMiddleware.ts:204](https://github.com/yaacov/harproxyserver/blob/aff259cd0a893b4edeb942141688c6e1964fa413/src/getRecorderHarMiddleware.ts#L204)
