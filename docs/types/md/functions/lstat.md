[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / lstat

# Function: lstat()

> **lstat**(`ssh`, `path`): `Promise`\<`fs.Stats` \| `ssh2.Stats`\>

Retrieves the fs.Stats object for a symbolic link.

The function returns the fs.Stats object. lstat() is identical to stat(), except that if path is a symbolic link, then the link itself is stat-ed, not the file that it refers to.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the symbolic link.

## Returns

`Promise`\<`fs.Stats` \| `ssh2.Stats`\>

Promise that resolves with the fs.Stats or ssh2.Stats object.

## Defined in

[src/index.ts:347](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L347)
