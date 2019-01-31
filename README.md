# spectron-window [![][npm_img]][npm_url] 


## Installation

```
npm install --save-dev spectron-window
```

## Usage

```javascript
import SpectronWindow from 'spectron-window'

export default class Login extends SpectronWindow {
  // require
  get path () {
    return 'login.html'
  }

  username (val) {
    if (val) {
      return this.browser.setValue('#username', val)
    } else {
      return this.browser.getValue('#username')
    }
  }

  password (val) {
    if (val) {
      return this.browser.setValue('#password', val)
    } else {
      return this.browser.getValue('#password')
    }
  }

  async login (u, p) {
    await this.username(u)
    await this.password(p)
    return this.submit()
  }

  async submit () {
    await this.click('#login-btn')
  }

  //...
}
```

```javascript
const Application = require('spectron').Application
const app = new Application({
  path: '....',
  startTimeout: 15000,
  quitTimeout: 10000,
  waitTimeout: 20000
})
await app.start()
await app.client.waitUntilWindowLoaded()


const loginWin = new LoginWin(app)
```

check full demo [spectron-window-demo](https://github.com/smildlzj/spectron-window-demo)

## Properties

### browser
wrap [spectron.client](https://github.com/electron/spectron#properties), but auto foucs window.

## API
### focus()
* focus to window

### isExist()
* check the window isExist

## License

MIT

[npm_img]: https://img.shields.io/npm/v/spectron-window.svg?style=flat-square
[npm_url]: https://www.npmjs.org/package/spectron-window
