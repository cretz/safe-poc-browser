'use strict';

export default class BrowserTab {
  constructor(titleUpdater) {
    this.div = $('<div style="height: 100vh"></div>').hide();
    
    const header = $(`
      <nav class="navbar navbar-default navbar-static-top" style="min-height: 38px; margin: 0px">
        <div class="container-fluid" style="padding: 0px;">
          <div class="input-group" style="width: 100%">
            <div class="input-group-addon" style="width: 1%">safe://</div>
            <input type="text" class="form-control" placeholder="Path" style="style: 100%">
          </div>
        </div>
      </nav>
    `);
    const urlInput = header.find('input.form-control');
    const webview = $('<webview src="about:blank" style="display:inline-block; height: calc(100% - 43px); width: 100%"></webview>');
    const errorDiv = $('<div class="alert alert-danger" role="alert"></div>');

    header.find('input.form-control').keypress(e => {
      if (e.which == 13) {
        webview[0].loadURL('safe://' + urlInput.val());
      }
    });
    webview[0].addEventListener('page-title-updated', e => titleUpdater(e.title));
    webview[0].addEventListener('load-commit', e => {
      if (e.isMainFrame && e.url != 'about:blank') {
        errorDiv.hide();
        webview.show();
        let newUrl = e.url;
        if (newUrl.startsWith('safe://')) newUrl = newUrl.substr(7);
        urlInput.val(newUrl);
      }
    });
    webview[0].addEventListener('did-fail-load', e => {
      // If this is BLOCKED_BY_CLIENT, just ignore
      if (e.errorCode != -20) {
        webview.hide();
        errorDiv.empty().text(e.errorDescription).prepend('<strong>Load Failed:</strong>').show();
      }
    });
    // Handle F12 for opening dev tools
    webview.keydown(e => {
      if (e.keyCode == 123) {
        if (webview[0].isDevToolsOpened()) webview[0].closeDevTools();
        else webview[0].openDevTools();
      }
      return true;
    });

    this.div.append(header, webview, errorDiv);
    $('#tabBodyDiv').append(this.div);
  }

  show() {
    this.div.show();
  }

  hide() {
    this.div.hide();
  }

  focusAddress() {
    this.div.find('input.form-control').focus();
  }
}