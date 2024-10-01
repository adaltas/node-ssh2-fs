[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / exists

# Function: exists()

> **exists**(`ssh`, `path`): `Promise`\<`boolean`\>

Tests whether a file or directory exists.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path to test.

## Returns

`Promise`\<`boolean`\>

Promise that resolves with a boolean indicating existence.

## Defined in

[src/index.ts:262](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L262)
