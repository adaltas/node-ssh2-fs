[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / unlink

# Function: unlink()

> **unlink**(`ssh`, `path`): `Promise`\<`void`\>

Removes a file.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path of the file to remove.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:785](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L785)
