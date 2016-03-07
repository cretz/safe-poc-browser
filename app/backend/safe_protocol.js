'use strict';

import electron from 'electron';
import url from 'url';

export default class SafeProtocol {
  init() {
    electron.protocol.registerStandardSchemes(['safe', 'http']);
    electron.protocol.registerHttpProtocol('safe', (req, cb) => this._handler(req, cb), (err) => { console.log('Registered safe handler:', err); });
  }

  _handler(req, cb) {
    const parsed = url.parse(req.url);
    const tokens = parsed.host.split('.');
    // We pretend there are only 2 pieces
    // TODO: be more strict here
    const service = tokens.length === 2 ? tokens[0] : 'www';
    const domain = tokens.length === 2 ? tokens[1] : tokens[0];
    const path = parsed.pathname ? parsed.pathname.split('/').slice(1).join('/') : 'index.html';
    const newUrl = `http://localhost:8100/dns/${service}/${domain}/${encodeURIComponent(decodeURIComponent(path))}`;
    cb({ url: newUrl });
  }
}