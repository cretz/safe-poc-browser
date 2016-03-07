'use strict';

import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import devHelper from './vendor/electron_boilerplate/dev_helper';
import windowStateKeeper from './vendor/electron_boilerplate/window_state';
import Api from './backend/api';
import SafeProtocol from './backend/safe_protocol';
import url from 'url';

// Special module holding environment variables which is declared
// in config/env_xxx.json file.
import env from './env';

// Preserve window state
const mainWindowState = windowStateKeeper('main', {
  width: 1000,
  height: 600
});

const api = new Api();

app.on('ready', () => {

  // TODO: meh, this isn't really needed anymore, but I have it anyways
  ipcMain.once('init-api', evt => {
    api.init(err => {
      if (!err) new SafeProtocol().init();
      evt.sender.send('init-api-complete', { err: err });
    });
  });

  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    autoHideMenuBar: true
  });

  if (mainWindowState.isMaximized) mainWindow.maximize();

  if (env.name === 'test') mainWindow.loadURL('file://' + __dirname + '/spec.html');
  else mainWindow.loadURL('file://' + __dirname + '/app.html');

  if (env.name !== 'production') {
    devHelper.setDevMenu();
    // We don't even want this open by default in dev
    // mainWindow.openDevTools();
  }

  mainWindow.on('close', () => { mainWindowState.saveState(mainWindow); });

  // Trap all URLs
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*'] }, (det, cb) => {
    const parsed = url.parse(det.url);
    // Prevent non-proxied HTTP calls (TODO: make this a whitelist not a blacklist)
    if ((parsed.protocol == 'http:' || parsed.protocol == 'https:') && parsed.host != 'localhost:8100') {
      // If this is a safenet URL, just redirect to the safe:// form
      if (parsed.host.endsWith('.safenet')) {
        parsed.protocol = 'safe:';
        parsed.host = parsed.host.substr(0, parsed.host.length - 8);
        cb({redirectURL: url.format(parsed)});
      } else {
        // Otherwise, cancel
        cb({cancel: true});
        console.log('Blocked access to ' + det.url);
        // If it's for the top level window, allow them to load in regular browser
        if (det.resourceType == 'mainFrame') {
          ipcMain.once('confirm-response', (evt, arg) => {
            if (arg.ok) shell.openExternal(det.url);
          });
          mainWindow.webContents.send('confirm', { text: `This page is trying to navigate to ${det.url}. Continue loading this in regular browser?` });
        }
      }
    } else {
      // All good, call back as normal
      cb({});
    }
  });
});

app.on('window-all-closed', () => { app.quit(); });
