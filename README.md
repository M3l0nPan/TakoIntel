# TakoIntel browser extension

## Summary 

A minimal tooling suite to help in daily SOC days

## Features 

- Context Menu Integration : Open URLs linked to selected text easily using customizable context menus, with regex support for precise matching.
- Module Library: Access a variety of pre-existing quick link modules, including:
    - Domain Reputation
    - IP Reputation
    - Hash Reputation
    - DNS Lookup
    - CVE Lookup
    - Windows Event Code Documentation 
    - ...
- Custom Module Creation: Tailor the extension to your needs by creating custom links modules directly from the options page,.

## Installation

TakoIntel browser extension is available on Chrome and Firefox extensions store :
- Chrome : https://chromewebstore.google.com/detail/takointel/eglogmobpahjfjfbllchfiloplgacocb
- Firefox : https://addons.mozilla.org/en-US/firefox/addon/takointel/

## How to use it

- Configuration: Begin by visiting the options page of the extension. Here, you can enable or disable existing modules according to your preferences.
- Creating Custom Modules: If you require additional functionality, you can create your own custom modules from the options page. This feature allows you to integrate specific URLs or resources that are important to your SOC operations.
- Using Context Menus: After configuring your modules, simply select any text in your browser, right-click to access

## Build extension locally for development 

Install dependencies : 

``` 
npm install
``` 

Build extension (Chrome) :

```
npm run build
``` 

Build extension (Firefox) :

```
npm run build:firefox
``` 


## License

This script is released under the [MIT License](https://opensource.org/licenses/MIT).