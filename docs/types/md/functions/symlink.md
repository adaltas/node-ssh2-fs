[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / symlink

# Function: symlink()

> **symlink**(`ssh`, `srcpath`, `dstpath`): `Promise`\<`void`\>

Creates a symbolic link.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **srcpath**: `PathLike`

Path that the symlink should point to.

• **dstpath**: `PathLike`

Path where the symbolic link should be created.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:751](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L751)
