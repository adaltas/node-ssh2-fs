[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / readFile

# Function: readFile()

> **readFile**\<`T`\>(`ssh`, `path`, `options`): `Promise`\<`string` \| `Buffer`\>

Reads the entire contents of a file.

## Type Parameters

• **T** _extends_ `null` \| `Client`

## Parameters

• **ssh**: `T`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the file.

• **options**: `T` _extends_ `null` ? `undefined` \| `null` \| `BufferEncoding` \| `ObjectEncodingOptions` & `Abortable` & `object` : `BufferEncoding` \| `ReadFileOptions` = `{}`

Options for reading the file.

## Returns

`Promise`\<`string` \| `Buffer`\>

Promise that resolves with the file contents as a string or Buffer.

## Params

options.encoding - Encoding used to convert a buffer into a string.

## Params

options.flag - File system flag, default is `r`.

## Defined in

[src/index.ts:521](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L521)
