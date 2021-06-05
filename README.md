# json2type

Generate TypeScript Type Definition from JSON.

**NOT PROPERLY TESTED**, but should be suit for most cases.

## Requirement
* Runtime should support ES Module (*.mjs)
## Usage
```js
import {parseToTypes} from 'json2type'

parseToTypes("{ok:true,data:{illust:{id:1}}}",'APIResponse')
```