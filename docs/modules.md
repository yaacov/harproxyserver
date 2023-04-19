[harproxyserver](README.md) / Exports

# harproxyserver

## Table of contents

### Type Aliases

- [AppendEntryAndSaveHarFn](modules.md#appendentryandsaveharfn)
- [LoadHarDataFn](modules.md#loadhardatafn)

### Functions

- [findHarEntry](modules.md#findharentry)

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

[harLogger.ts:22](https://github.com/yaacov/harproxyserver/blob/951f420/src/harLogger.ts#L22)

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

[harLogger.ts:11](https://github.com/yaacov/harproxyserver/blob/951f420/src/harLogger.ts#L11)

## Functions

### findHarEntry

▸ **findHarEntry**(`harLog`, `method`, `baseUrl`): `Entry` \| ``null``

Finds the HAR entry in the given log with the matching HTTP method, base URL, and query parameters.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `harLog` | `Log` | The HAR log to search through. |
| `method` | `string` | The HTTP method of the desired entry. |
| `baseUrl` | `string` | The base URL of the desired entry. |

#### Returns

`Entry` \| ``null``

The matching HAR entry if found, or null if not found.

#### Defined in

[harLogger.ts:32](https://github.com/yaacov/harproxyserver/blob/951f420/src/harLogger.ts#L32)
