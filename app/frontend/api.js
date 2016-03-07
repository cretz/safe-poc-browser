'use strict';

import { ipcRenderer } from 'electron';

export default class Api {
  init(cb) {
    // We do this over IPC
    ipcRenderer.once('init-api-complete', (e, arg) => {
      if (arg.err) return cb(err);
      cb(null);
    });
    ipcRenderer.send('init-api', true);
  }
}