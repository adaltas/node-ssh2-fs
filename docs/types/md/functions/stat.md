[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / stat

# Function: stat()

> **stat**\<`T`\>(`ssh`, `path`): `Promise`\<`T` _extends_ `null` ? `fs.Stats` : `ssh2.Stats`\>

Retrieves the Stats object for a file or directory.

## Type Parameters

• **T** _extends_ `null` \| `Client`

## Parameters

• **ssh**: `T`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the file or directory.

## Returns

`Promise`\<`T` _extends_ `null` ? `fs.Stats` : `ssh2.Stats`\>

Promise that resolves with the fs.Stats or ssh2.Stats object.

## Defined in

[src/index.ts:705](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L705)
