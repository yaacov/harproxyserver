[harproxyserver](README.md) / Exports

# harproxyserver

## Table of contents

### Type Aliases

- [AppendEntryAndSaveHarFn](modules.md#appendentryandsaveharfn)
- [HarEntryParams](modules.md#harentryparams)
- [LoadHarDataFn](modules.md#loadhardatafn)

### Functions

- [createHarEntryFromText](modules.md#createharentryfromtext)
- [findHarEntry](modules.md#findharentry)
- [recordedHarMiddleware](modules.md#recordedharmiddleware)
- [recorderHarMiddleware](modules.md#recorderharmiddleware)

## Type Aliases

### AppendEntryAndSaveHarFn

Ƭ **AppendEntryAndSaveHarFn**: (`entry`: `Entry`, `filePath`: `string`) => `Promise`<`Har`\>

#### Type declaration

▸ (`entry`, `filePath`): `Promise`<`Har`\>

A type representing a function that sets a new HAR entry and saves it to a given file.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entry` | `Entry` | The new HAR entry to be added. |
| `filePath` | `string` | The path of the file to save the updated HAR data to. |

##### Returns

`Promise`<`Har`\>

A promise that resolves to the updated HAR object.

#### Defined in

[harUtils.ts:23](https://github.com/yaacov/harserver/blob/66b70bd/src/harUtils.ts#L23)

___

### HarEntryParams

Ƭ **HarEntryParams**: `Object`

Type for the parameter object of the createHarEntryFromText function.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseUrl` | `string` | The base URL of the request (example: 'https://example.com'). |
| `endpoint` | `string` | The endpoint of the request (example: '/book/story/?page=4'). |
| `headers?` | `Header`[] | The response headers (default: an empty array). Optional. |
| `mimeType?` | `string` | The MIME type of the response body (default: 'application/json'). Optional. |
| `requestMethod?` | `string` | The HTTP method used for the request (default: 'GET'). Optional. |
| `statusCode?` | `number` | The HTTP status code of the response (default: StatusCodes.OK). Optional. |
| `text` | `string` | The text of the response body. |

#### Defined in

[harUtils.ts:76](https://github.com/yaacov/harserver/blob/66b70bd/src/harUtils.ts#L76)

___

### LoadHarDataFn

Ƭ **LoadHarDataFn**: (`filePath`: `string`) => `Promise`<`Har`\>

#### Type declaration

▸ (`filePath`): `Promise`<`Har`\>

A type representing a function that retrieves a HAR object from a given file.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filePath` | `string` | The path of the file to read the HAR data from. |

##### Returns

`Promise`<`Har`\>

A promise that resolves to the HAR object.

#### Defined in

[harUtils.ts:12](https://github.com/yaacov/harserver/blob/66b70bd/src/harUtils.ts#L12)

## Functions

### createHarEntryFromText

▸ **createHarEntryFromText**(`params`): `Entry`

Creates a HAR (HTTP Archive) entry object from the given input parameters.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`HarEntryParams`](modules.md#harentryparams) | The parameters for creating the HAR entry. |

#### Returns

`Entry`

The generated HAR entry object.

#### Defined in

[harUtils.ts:105](https://github.com/yaacov/harserver/blob/66b70bd/src/harUtils.ts#L105)

___

### findHarEntry

▸ **findHarEntry**(`harLog`, `method`, `endpoint`, `endpointRegex?`, `ignoreSearch?`, `prefixToRemove?`): `Entry` \| ``null``

Finds the HAR entry in the given log with the matching HTTP method and endpoint.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `harLog` | `undefined` \| ``null`` \| `Log` | `undefined` | The HAR log to search through. |
| `method` | `string` | `undefined` | The HTTP method of the desired entry. |
| `endpoint` | `string` | `undefined` | The endpoint (pathname and search) of the desired entry, e.g., "/users?id=123". |
| `endpointRegex?` | `RegExp` | `undefined` | Optional regular expression to match the endpoint against. For example, to match endpoints that start with "/users" followed by a number, use `/^/users\d+/`. |
| `ignoreSearch?` | `boolean` | `false` | Optional flag to ignore the search part of the URL when matching endpoints. |
| `prefixToRemove?` | `string` | `undefined` | Optional prefix to remove from the beginning of the `entry.request.path` property before matching the endpoint. |

#### Returns

`Entry` \| ``null``

The matching HAR entry if found, or null if not found.

#### Defined in

[harUtils.ts:36](https://github.com/yaacov/harserver/blob/66b70bd/src/harUtils.ts#L36)

___

### recordedHarMiddleware

▸ **recordedHarMiddleware**(`harFilePath`, `getHar`, `prefix`): (`req`: `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\>, `res`: `Response`<`any`, `Record`<`string`, `any`\>\>, `next`: `NextFunction`) => `Promise`<`void`\>

A middleware factory that reads the HAR file and returns the body of the recorded request
based on the path and method.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `harFilePath` | `string` | The path of the HAR file to read |
| `getHar` | [`LoadHarDataFn`](modules.md#loadhardatafn) | - |
| `prefix` | `string` | - |

#### Returns

`fn`

Express middleware

▸ (`req`, `res`, `next`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> |
| `res` | `Response`<`any`, `Record`<`string`, `any`\>\> |
| `next` | `NextFunction` |

##### Returns

`Promise`<`void`\>

#### Defined in

[recordedHarMiddleware.ts:12](https://github.com/yaacov/harserver/blob/66b70bd/src/recordedHarMiddleware.ts#L12)

___

### recorderHarMiddleware

▸ **recorderHarMiddleware**(`harFilePath`, `appendEntryAndSaveHar`, `targetUrl`): (`proxyRes`: `IncomingMessage`, `req`: `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\>, `res`: `Response`<`any`, `Record`<`string`, `any`\>\>) => `void`

Middleware factory that records an HTTP request-response transaction and saves it in a HAR file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `harFilePath` | `string` | The file path to save the HAR file. |
| `appendEntryAndSaveHar` | [`AppendEntryAndSaveHarFn`](modules.md#appendentryandsaveharfn) | Function to append the new entry and save the HAR file. |
| `targetUrl` | `string` | The prefix for the HAR playback endpoint. |

#### Returns

`fn`

Custom proxy response handler.

▸ (`proxyRes`, `req`, `res`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `proxyRes` | `IncomingMessage` |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> |
| `res` | `Response`<`any`, `Record`<`string`, `any`\>\> |

##### Returns

`void`

#### Defined in

[recorderHarMiddleware.ts:17](https://github.com/yaacov/harserver/blob/66b70bd/src/recorderHarMiddleware.ts#L17)
