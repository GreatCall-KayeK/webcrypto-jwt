(function () {
// Adapted from https://chromium.googlesource.com/chromium/blink/+/master/LayoutTests/crypto/subtle/hmac/sign-verify.html
  var Base64URL = {
    stringify: function (a) {
      var base64string = btoa(String.fromCharCode.apply(0, a));
      return base64string.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    },
    parse: function (s) {
      s = s.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, '');
      return new Uint8Array(Array.prototype.map.call(atob(s), function (c) { return c.charCodeAt(0); }));
    }
  };

  function asciiToUint8Array(str) {
      var chars = [];
      for (var i = 0; i < str.length; ++i) {
        chars.push(str.charCodeAt(i));
      }
      return new Uint8Array(chars);
  }

  function hexStringToUint8Array(hexString) {
      if (hexString.length % 2 !== 0)
          throw "Invalid hexString";
      var arrayBuffer = new Uint8Array(hexString.length / 2);
      for (var i = 0; i < hexString.length; i += 2) {
          var byteValue = parseInt(hexString.substr(i, 2), 16);
          if (isNaN(byteValue)) {
            throw "Invalid hexString";
          }
          arrayBuffer[i/2] = byteValue;
      }
      return arrayBuffer;
  }

  function bytesToHexString(bytes) {
      if (!bytes)
          return null;
      bytes = new Uint8Array(bytes);
      var hexBytes = [];
      for (var i = 0; i < bytes.length; ++i) {
          var byteString = bytes[i].toString(16);
          if (byteString.length < 2)
              byteString = "0" + byteString;
          hexBytes.push(byteString);
      }
      return hexBytes.join("");
  }

  function bytesToASCIIString(bytes) {
      return String.fromCharCode.apply(null, new Uint8Array(bytes));
  }

  function isString(s) {
    return typeof s === 'string';
  }

  function isFunction(fn) {
    return typeof fn === 'function';
  }

  function isObject(arg) {
    return arg !== null && typeof arg === 'object';
  }

  window.verifyJWT = function signJWT(token, secret, alg, cb) {
    if (!isString(token)) {
      return cb(new Error('token must be a string'));
    }

    if (!isString(secret)) {
      return cb(new Error('secret must be a string'));
    }

    if (!isString(alg)) {
      return cb(new Error('alg must be a string'));
    }

    if (!isFunction(cb)) {
      throw new Error('cb must be a function');
    }

    var tokenParts = token.split('.');

    if (tokenParts.length !== 3) {
      return cb(new Error('token must have 3 parts'));
    }

    var algorithms = {
      HS256: {
        name: 'HMAC',
        hash: {
          name: 'SHA-256'
        }
      }
    };

    var importAlgorithm = algorithms[alg];

    if (!importAlgorithm) {
      return cb(new Error('algorithm not found'));
    }

    // TODO Test asciiToUint8Array function
    var keyData = asciiToUint8Array(secret);

    crypto.subtle.importKey(
      'raw',
      keyData,
      importAlgorithm,
      false,
      ['sign']
    ).then(function (key) {
      var partialToken = tokenParts.slice(0,2).join('.');
      var signaturePart = tokenParts[2];

      // TODO Test asciiToUint8Array function
      var messageAsUint8Array = asciiToUint8Array(partialToken);
      // TODO Test asciiToUint8Array function
      var signatureAsUint8Array = asciiToUint8Array(signaturePart);

      crypto.subtle.sign(
        importAlgorithm.name,
        key,
        messageAsUint8Array
      ).then(function (res) {
        // TODO Test
        var resBase64 = Base64URL.stringify(new Uint8Array(res));

        // TODO Time comparison
        cb(null, resBase64 === signaturePart);
      }, cb);

    }, cb);
  };

  window.signJWT = function signJWT(payload, secret, alg, cb) {
    if (!isObject(payload)) {
      return cb(new Error('payload must be an object'));
    }

    if (!isString(secret)) {
      return cb(new Error('secret must be a string'));
    }

    if (!isString(alg)) {
      return cb(new Error('alg must be a string'));
    }

    if (!isFunction(cb)) {
      throw new Error('cb must be a function');
    }

    var algorithms = {
      HS256: {
        name: 'HMAC',
        hash: {
          name: 'SHA-256'
        }
      }
    };

    var importAlgorithm = algorithms[alg];

    if (!importAlgorithm) {
      return cb(new Error('algorithm not found'));
    }

    var payloadAsJSON;

    try {
      payloadAsJSON = JSON.stringify(payload);
    } catch (err) {
      return cb(err);
    }

    var header = {alg: alg, typ: 'JWT'};
    var headerAsJSON = JSON.stringify(header);

    var partialToken = Base64URL.stringify(asciiToUint8Array(headerAsJSON)) + '.' +
       Base64URL.stringify(asciiToUint8Array(payloadAsJSON));

    // TODO Test asciiToUint8Array function
    var keyData = asciiToUint8Array(secret);

    crypto.subtle.importKey(
      'raw',
      keyData,
      importAlgorithm,
      false,
      ['sign']
    ).then(function (key) {
      // TODO Test asciiToUint8Array function
      var messageAsUint8Array = asciiToUint8Array(partialToken);

      crypto.subtle.sign(
        importAlgorithm.name,
        key,
        messageAsUint8Array
      ).then(function (signature) {
        // TODO Test
        var signatureAsBase64 = Base64URL.stringify(new Uint8Array(signature));

        var token = partialToken + '.' + signatureAsBase64;

        cb(null, token);
      }, cb);
    }, cb);
  };

}());