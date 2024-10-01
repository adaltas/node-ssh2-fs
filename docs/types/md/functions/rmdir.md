[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / rmdir

# Function: rmdir()

> **rmdir**(`ssh`, `target`): `Promise`\<`void`\>

Removes a directory.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **target**: `PathLike`

Path of the directory to remove.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:667](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L667)
