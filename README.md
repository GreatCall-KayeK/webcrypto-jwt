### webcrypto-jwt

JSON Web Tokens (JWT) verify/sign implementation using W3C Web Cryptography (crypto.subtle).

#### Browser Support

The following browsers are supported without shims: IE TP, Firefox 35+ and Chrome 37+. Safari is not currently working. For more information about compatiblity check [web cryptography browser support](http://caniuse.com/#feat=cryptography).

#### Install

With npm:

```js
npm install webcrypto-jwt
```

or with bower:

```js
bower install webcrypto-jwt
```

and then add the following script tag:

```html
<script src="webcrypto-jwt/index.js"></script>
```

#### Usage

JWT verification:

```js
var verifyJWT = require('webcrypto-jwt').verifyJWT;

// token signed using 'secret' as secret
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.' +
  'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

verifyJWT(token, 'secret', 'HS256', function (err, isValid) {
  console.log(isValid); // true
});

verifyJWT(token, 'nosecret', 'HS256', function (err, isValid) {
  console.log(isValid); // false
});
```

JWT signing:

```js
var signJWT = require('webcrypto-jwt').signJWT;

signJWT({foo: 'bar'}, 'secret', 'HS256', function (err, token) {
  // ey...
  console.log(token);
});
```
