[harproxyserver](README.md) / Exports

# harproxyserver

## Table of contents

### Functions

- [convertToHarHeaders](modules.md#converttoharheaders)
- [findHarEntry](modules.md#findharentry)
- [readHarFile](modules.md#readharfile)
- [recordedHarMiddleware](modules.md#recordedharmiddleware)
- [recorderHarMiddleware](modules.md#recorderharmiddleware)
- [saveHarLog](modules.md#saveharlog)

## Functions

### convertToHarHeaders

▸ **convertToHarHeaders**(`incomingHeaders`): `Header`[]

Converts the given incoming headers to HAR format.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `incomingHeaders` | `IncomingHttpHeaders` | The incoming headers to convert. |

#### Returns

`Header`[]

An array of headers in HAR format.

#### Defined in

[harLogger.ts:33](https://github.com/yaacov/harproxyserver/blob/3536410/src/harLogger.ts#L33)

___

### findHarEntry

▸ **findHarEntry**(`harLog`, `method`, `path`): `Entry` \| ``null``

Finds the HAR entry in the given log with the matching HTTP method and path.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `harLog` | `Log` | The HAR log to search through. |
| `method` | `string` | The HTTP method of the desired entry. |
| `path` | `string` | The path of the desired entry. |

#### Returns

`Entry` \| ``null``

The matching HAR entry if found, or null if not found.

#### Defined in

[recordedHarMiddleware.ts:14](https://github.com/yaacov/harproxyserver/blob/3536410/src/recordedHarMiddleware.ts#L14)

___

### readHarFile

▸ **readHarFile**(`harFilePath`): `Promise`<`Har`\>

Reads a HAR file and returns the parsed HAR object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `harFilePath` | `string` | The path of the HAR file to read |

#### Returns

`Promise`<`Har`\>

The parsed HAR object

#### Defined in

[recordedHarMiddleware.ts:29](https://github.com/yaacov/harproxyserver/blob/3536410/src/recordedHarMiddleware.ts#L29)

___

### recordedHarMiddleware

▸ **recordedHarMiddleware**(`harFilePath`): (`req`: `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\>, `res`: `Response`<`any`, `Record`<`string`, `any`\>\>, `next`: `NextFunction`) => `Promise`<`void`\>

A middleware factory that reads the HAR file and returns the body of the recorded request
based on the path and method.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `harFilePath` | `string` | The path of the HAR file to read |

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

[recordedHarMiddleware.ts:55](https://github.com/yaacov/harproxyserver/blob/3536410/src/recordedHarMiddleware.ts#L55)

___

### recorderHarMiddleware

▸ **recorderHarMiddleware**(`targetUrl`, `HARFileName`): (`proxyRes`: `IncomingMessage`, `req`: `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\>) => `void`

Middleware factory that records an HTTP request-response transaction and saves it in a HAR file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `targetUrl` | `string` | The target URL to proxy. |
| `HARFileName` | `string` | The file path to save the HAR file. |

#### Returns

`fn`

Custom proxy response handler.

▸ (`proxyRes`, `req`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `proxyRes` | `IncomingMessage` |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> |

##### Returns

`void`

#### Defined in

[recorderHarMiddleware.ts:17](https://github.com/yaacov/harproxyserver/blob/3536410/src/recorderHarMiddleware.ts#L17)

___

### saveHarLog

▸ **saveHarLog**(`request`, `fileName`): `void`

Appends the given HAR entry to the existing HAR log and saves it to the specified file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | `Entry` | The HAR entry to save. |
| `fileName` | `string` | The name of the file to save the HAR log to. |

#### Returns

`void`

#### Defined in

[harLogger.ts:21](https://github.com/yaacov/harproxyserver/blob/3536410/src/harLogger.ts#L21)
