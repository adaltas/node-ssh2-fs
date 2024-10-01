[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / rename

# Function: rename()

> **rename**(`ssh`, `source`, `target`): `Promise`\<`void`\>

Renames a file or directory.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **source**: `PathLike`

Current path of the file or directory.

• **target**: `PathLike`

New path for the file or directory.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:630](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L630)
