[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / readdir

# Function: readdir()

> **readdir**(`ssh`, `path`): `Promise`\<`string`[]\>

Reads the contents of a directory.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the directory.

## Returns

`Promise`\<`string`[]\>

Promise that resolves with an array of file names in the directory.

## Defined in

[src/index.ts:467](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L467)
