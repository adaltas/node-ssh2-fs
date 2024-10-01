[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / chown

# Function: chown()

> **chown**(`ssh`, `path`, `uid`, `gid`): `Promise`\<`void`\>

Asynchronously changes owner and group of a file.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the file.

• **uid**: `number`

User ID to set.

• **gid**: `number`

Group ID to set.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Throws

Error if neither uid nor gid is provided.

## Defined in

[src/index.ts:53](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L53)
