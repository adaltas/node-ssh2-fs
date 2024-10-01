[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / mkdir

# Function: mkdir()

> **mkdir**(`ssh`, `path`, `options`?): `Promise`\<`void`\>

Creates a directory.

## Parameters

• **ssh**: `null` \| `Client`

SSH client or null for local operation.

• **path**: `PathLike`

Path of the directory to create.

• **options?**: `Mode` \| [`FsMkdirOptions`](../type-aliases/FsMkdirOptions.md) \| `InputAttributes`

Options for directory creation.

## Returns

`Promise`\<`void`\>

Promise that resolves when the operation is complete.

## Defined in

[src/index.ts:397](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L397)
