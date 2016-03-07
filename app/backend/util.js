'use strict';

export default class Util {
  static byteArrayToBase64(byteArray) {
    return new Buffer(byteArray).toString('base64');
  }

  static base64ToByteArray(str) {
    return new Uint8Array(new Buffer(str, 'base64'));
  }
}