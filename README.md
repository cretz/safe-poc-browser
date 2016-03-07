SAFE POC Browser
================

Simple proof of concept for browsing SAFE websites. This uses a `safe://` style protocol instead of a system-wide proxy.
It also takes care to block all unsafe HTTP links while still being backwards compatible with existing HTTP links and
allowing the user to open HTTP links in their browser.

**NOTE: This is a proof-of-concept. I am not really supporting it and I definitely don't advise using it.**

# Quick Start

Prequisites:

* [SAFE Launcher](https://maidsafe.readme.io/docs/install-launcher) installed (and it must be running)
* [Node.js](https://nodejs.org/) installed
* [Bower](http://bower.io/) installed (can just do an `npm install -g bower` if not there)

Then clone this repo somewhere and run `npm install` once to download all of the requirements (ignore warnings). To
start the app each time, run `npm start`.

# Notes

Implementation:

* This uses Electrons protocol handlers to trap calls for certain protocols
* A popup is provided to users if they want to open HTTP links in their browser
* Dev tools can be opened on any "tab" with F12
* Very rudimentary impl, doesn't even have the ability to close a tab, refresh, etc
* I didn't even clean up the code to remove things that came with the boilerplate
* While it doesn't even really use it, it demonstrates the registration process of an app with the launcher
* Leverages Electron's `<webview>` with very limited features

Pros of this approach:

* Keeps SAFE browsing users off of the public internet and greatly reduces fingerprint abilities
* Does not require system-wide proxy
* Can have custom JS injected that would allow devs to access SAFE APIs from their pages (of course asking the user if
  it's ok first)
* Don't have to maintain a browser fork

Cons of this approach:

* Lose almost all of the features of a browser (which is a ton, e.g. bookmarks, auto complete, keyboard shortcuts, etc)
* Lose auto update features (though Electron has solutions for this)

# License

The MIT License (MIT)

Copyright (c) 2016 Chad Retz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
