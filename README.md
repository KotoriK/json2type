# json2type

Generate TypeScript Type Definition from JSON.

Should be suit for most cases. Be free to feedback.

**TRY ONLINE**: https://utils-kotorik.vercel.app/json2type

## Requirement

* Runtime should support ES Module (*.mjs)

## Usage

```js
import {parseToTypes} from 'json2type'

parseToTypes("{ok:true,data:{illust:{id:1}}}",'APIResponse')
```