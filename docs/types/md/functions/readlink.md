[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / readlink

# Function: readlink()

> **readlink**(`ssh`, `path`): `Promise`\<`string`\>

Reads the value of a symbolic link.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the symbolic link.

## Returns

`Promise`\<`string`\>

Promise that resolves with the link's string value.

## Defined in

[src/index.ts:597](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L597)
