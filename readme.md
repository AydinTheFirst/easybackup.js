# easybackup.js

[Docs](https://easybackup-js.fristroop.com)
[Github](https://github.com/AydinTheFirst/easybackup.js)
[NPM](https://www.npmjs.com/package/easybackup.js)

This module is created for my Easybackup Project
[Github](https://github.com/AydinTheFirst/easybackup)
[Live](https://easybackup.fristroop.com)

## Easy to use

```js
import Easybackup from "easybackup.js";

await Easybackup.mongodb.verify();
const out = await Easybackup.mongodb.dump();
```

```js
import Easybackup from "easybackup.js";

await Easybackup[dbType][fnName]

- dbType => "mongodb" | "mariadb" | "mysql" | "postgres"
- fnName => "dump" | "restore" | "verfiy" |
```

### If you find any bugs or if you have any suggestions please create an issue and if you solved it you can also PR.

### If you want to add another database to project you can PR.
