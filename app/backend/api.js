'use strict';

import { app } from 'electron';
import sodium from 'libsodium-wrappers';
import Util from './util';
import request from 'request';
import jetpack from 'fs-jetpack';

const userDataDir = jetpack.cwd(app.getPath('userData'));
const userDataFilename = 'poc-browser-data.json';
const launcherServer = 'http://localhost:8100/';

export default class Api {
  constructor() {
    this.token = null;
    this.key = null;
    this.nonce = null;
  }

  init(cb) {
    // First attempt to load
    this._load();
    // Now assert it is valid or attempt to reauthorize
    this._assertValidToken(err => {
      if (!err) return cb(null, this);
      console.log('Token invalid, reauthorizing', err);
      this._clear();
      this._reauthorize(err => { cb(err, this); });
    });
  }

  _clear() {
    userDataDir.remove(userDataFilename);
    this.token = null;
    this.key = null;
    this.nonce = null;
  }

  _persist() {
    userDataDir.write(userDataFilename, {
      token: this.token,
      key: Util.byteArrayToBase64(this.key),
      nonce: Util.byteArrayToBase64(this.nonce)
    });
  }

  _load() {
    const loaded = userDataDir.read(userDataFilename, 'json');
    if (loaded) {
      this.token = loaded.token;
      this.key = Util.base64ToByteArray(loaded.key);
      this.nonce = Util.base64ToByteArray(loaded.key);
    }
  }

  _assertValidToken(cb) {
    if (!this.token) return cb('No token');
    const requestOpts = {
      url: launcherServer + 'auth',
      method: 'GET',
      headers: { authorization: 'Bearer ' + this.token }
    }
    request(requestOpts, (err, msg, resp) => {
      if (err) return cb(err);
      if (msg.statusCode != 200) return cb('Not authorized');
      cb(null);
    });
  }

  _reauthorize(cb) {
    const keys = sodium.crypto_box_keypair();
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const requestOpts = {
      url: launcherServer + 'auth',
      method: 'POST',
      json: true,
      body: {
        app: {
          name: 'POC Browser',
          id: 'pocbrowser.cretz.github.com',
          version: '0.0.1',
          vendor: 'cretz'
        },
        permissions: [],
        publicKey: Util.byteArrayToBase64(keys.publicKey),
        nonce: Util.byteArrayToBase64(nonce)
      }
    };
    request(requestOpts, (err, msg, resp) => {
      if (err) {
        if (err.code == 'ECONNREFUSED') return cb('Launcher not running. Please make sure launcher is running and restart application.');
        if (err.code == 'ECONNRESET') return cb('Launcher closed. Restart launcher and restart application.');
        if (err.code) return cb('Internal error - ' + err.code);
        return cb(err);
      }
      if (msg.statusCode != 200) {
        if (msg.statusCode == 401) return cb('Launcher denied authorization. Application failure.');
        return cb('Internal error - ' + msg.statusMessage);
      }
      this.token = resp.token;
      const cipher = Util.base64ToByteArray(resp.encryptedKey);
      const publicKey = Util.base64ToByteArray(resp.publicKey);
      const data = sodium.crypto_box_open_easy(cipher, nonce, publicKey, keys.privateKey);
      this.key = data.slice(0, sodium.crypto_secretbox_KEYBYTES);
      this.nonce = data.slice(sodium.crypto_secretbox_KEYBYTES);
      this._persist();
      cb(null);
    });
  }
}