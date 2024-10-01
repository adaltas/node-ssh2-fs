[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / writeFile

# Function: writeFile()

> **writeFile**\<`T`\>(`ssh`, `target`, `data`, `options`): `Promise`\<`void`\>

Asynchronously writes data to a file, replacing the file if it already exists.

## Type Parameters

• **T** _extends_ `null` \| `Client`

## Parameters

• **ssh**: `T`

SSH client or null for local operation.

• **target**: `PathLike`

Path of the file to write.

• **data**: `string` \| `Buffer` \| `Readable`

The data to write to the file.

• **options**: [`WriteFileOptions`](../type-aliases/WriteFileOptions.md)\<`T`\> = `{}`

Options for writing the file.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:832](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L832)
