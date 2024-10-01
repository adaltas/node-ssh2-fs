[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / futimes

# Function: futimes()

> **futimes**(`ssh`, `path`, `atime`, `mtime`): `Promise`\<`void`\>

Sets the access and modification times of a file.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the file.

• **atime**: `TimeLike`

Access time to set.

• **mtime**: `TimeLike`

Modification time to set.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:300](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L300)
