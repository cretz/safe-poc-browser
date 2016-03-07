'use strict';

import BrowserTab from './tab';
import Api from './api';
import { ipcRenderer } from 'electron';

export default class Browser {
  constructor() {
    this.tabs = [];
    this.api = new Api();
  }

  init() {
    // We have to auth first
    $('#pre-browser').html(`
      <div class="progress" style="margin-top: 60px; height: 40px">
        <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;">
          <h4>Attempting to authenticate with launcher. Please use the launcher app to approve this application.</h4>
        </div>
      </div>
    `);
    this.api.init(err => {
      if (err) {
        const errDiv = $('<div class="alert alert-danger" role="alert" style="margin-top: 60px"></div>').text(err).prepend('<strong>Error: </strong>');
        $('#pre-browser').empty().append(errDiv);
      } else this._showBrowser();
    });
    ipcRenderer.on('confirm', (evt, arg) => {
      const ok = confirm(arg.text);
      evt.sender.send('confirm-response', { ok: ok });
    });
  }

  _showBrowser() {
    $('#pre-browser').empty().hide();
    $('#browser').show();
    $('#newTabButton').click(_ => {
      // Add the tab link
      const tabLi = $('<li role="presentation"></li>');
      const tabAnchor = $('<a href="#" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">[Blank]</a>');
      tabLi.append(tabAnchor);
      const tab = new BrowserTab(t => tabAnchor.text(t));
      tabAnchor.click(e => {
        e.preventDefault();
        // Unshow previous if there
        const previous = $('#openTabUl li.active');
        if (previous.length == 1) {
          previous.removeClass('active');
          this.tabs[previous.index()].hide();
        }
        // Show this one
        tabLi.addClass('active');
        tab.show();
      });
      this.tabs.push(tab);
      $('#openTabUl').append(tabLi);
      tabAnchor.click();
      tab.focusAddress();
    });
    $('#newTabButton').click();
  }
}