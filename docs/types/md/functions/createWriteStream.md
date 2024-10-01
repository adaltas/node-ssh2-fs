[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / createWriteStream

# Function: createWriteStream()

> **createWriteStream**\<`T`\>(`ssh`, `path`, `options`): `Promise`\<`T` _extends_ `null` ? `fs.WriteStream` : `ssh2.WriteStream`\>

Creates a writable stream for a file.

In the original `fs` API, `createWriteStream` is directly return instead of being available on a promise completion. The reason is due to the internal nature where we need to create an SFTP instance asynchronously before returning the the writable stream..

## Type Parameters

• **T** _extends_ `null` \| `Client`

## Parameters

• **ssh**: `T`

SSH client or null for local operation.

• **path**: `PathLike`

Path to the destination file.

• **options**: `T` _extends_ `null` ? `undefined` \| `BufferEncoding` \| `WriteStreamOptions` : `WriteStreamOptions` = `{}`

Options for creating the write stream.

## Returns

`Promise`\<`T` _extends_ `null` ? `fs.WriteStream` : `ssh2.WriteStream`\>

Promise that resolves with a WriteStream.

## Example

```javascript
stream = await fs.createWriteStream sshOrNull, 'test.out'
fs.createReadStream('test.in').pipe stream
```

## Defined in

[src/index.ts:204](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L204)
