[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / chmod

# Function: chmod()

> **chmod**(`ssh`, `path`, `mode`): `Promise`\<`void`\>

Asynchronously changes the permissions of a file.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the file.

• **mode**: `number`

File mode to set.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:18](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L18)
