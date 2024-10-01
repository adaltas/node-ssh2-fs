[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / createReadStream

# Function: createReadStream()

> **createReadStream**\<`T`\>(`ssh`, `source`, `options`): `Promise`\<`T` _extends_ `null` ? `fs.ReadStream` : `ssh2.ReadStream`\>

Creates a readable stream for a file.

## Type Parameters

• **T** _extends_ `null` \| `Client`

## Parameters

• **ssh**: `T`

SSH client or null for local operation.

• **source**: `PathLike`

Path to the source file.

• **options**: `T` _extends_ `null` ? `undefined` \| `BufferEncoding` \| `ReadStreamOptions` : `ReadStreamOptions` = `{}`

Options for creating the read stream.

## Returns

`Promise`\<`T` _extends_ `null` ? `fs.ReadStream` : `ssh2.ReadStream`\>

Promise that resolves with a ReadStream.

## Example

```typescript
stream = await fs.createReadStream(sshOrNull, "hello");
stream.pipe(fs.createWriteStream("test.in"));
```

## Defined in

[src/index.ts:113](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L113)
