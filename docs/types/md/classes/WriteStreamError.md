[**ssh2-fs**](../README.md) • **Docs**

---

[ssh2-fs](../README.md) / WriteStreamError

# Class: WriteStreamError

Rejected error by `createReadStream`.

## Extends

- `Error`

## Constructors

### new WriteStreamError()

> **new WriteStreamError**(`message`?): [`WriteStreamError`](WriteStreamError.md)

#### Parameters

• **message?**: `string`

#### Returns

[`WriteStreamError`](WriteStreamError.md)

#### Inherited from

`Error.constructor`

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1082

### new WriteStreamError()

> **new WriteStreamError**(`message`?, `options`?): [`WriteStreamError`](WriteStreamError.md)

#### Parameters

• **message?**: `string`

• **options?**: `ErrorOptions`

#### Returns

[`WriteStreamError`](WriteStreamError.md)

#### Inherited from

`Error.constructor`

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1082

## Properties

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

`Error.cause`

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

---

### code?

> `optional` **code**: `string` \| `number`

#### Defined in

[src/index.ts:176](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L176)

---

### errno?

> `optional` **errno**: `number`

#### Defined in

[src/index.ts:177](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L177)

---

### message

> **message**: `string`

#### Inherited from

`Error.message`

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

---

### name

> **name**: `string`

#### Inherited from

`Error.name`

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

---

### path?

> `optional` **path**: `string`

#### Defined in

[src/index.ts:179](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L179)

---

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

---

### syscall?

> `optional` **syscall**: `string`

#### Defined in

[src/index.ts:178](https://github.com/adaltas/node-ssh2-fs/blob/d3bd0a05ed430bf829c995be339898786e60a46c/src/index.ts#L178)

---

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Optional override for formatting stack traces

#### Parameters

• **err**: `Error`

• **stackTraces**: `CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

#### Defined in

node_modules/@types/node/globals.d.ts:28

---

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`Error.stackTraceLimit`

#### Defined in

node_modules/@types/node/globals.d.ts:30

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

Create .stack property on a target object

#### Parameters

• **targetObject**: `object`

• **constructorOpt?**: `Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`

#### Defined in

node_modules/@types/node/globals.d.ts:21
