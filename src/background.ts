import browser from "webextension-polyfill";
import { module } from './types/module.interface';
import { openModuleUrls } from './scripts/browser_action';
import { fetchEnabledModuleList } from './scripts/fetch_browser_storage';
import { installExtension } from './scripts/installation';
import { buildContextMenus, updateContextMenus } from './scripts/manage_context_menus';
import { matchSelectionText } from './scripts/tools';

let moduleList: module[] = [];

// Listen for when the extension is installed
browser.runtime.onInstalled.addListener(() => {
  installExtension();
});

// Listen on message from content.js (selectionText listener)
browser.runtime.onMessage.addListener(async (message) => {
  if (!Array.isArray(moduleList) || moduleList.length === 0) {
    moduleList = await fetchEnabledModuleList();
  }

  if (typeof message === 'string' && message) {
    const matchedModule = await matchSelectionText(moduleList, message);
    await updateContextMenus(moduleList, matchedModule, message);
  }
});

// Listen for click on an TakoIntel contentMenus element 
browser.contextMenus.onClicked.addListener((contextClick) => {
  if (contextClick.selectionText) {
    openModuleUrls(moduleList, String(contextClick.menuItemId), contextClick.selectionText);
  }
});

// Listen for modification of TakoIntel browser storage 
browser.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "local" && changes.moduleList) {
    // Reload or update the module settings as needed
    await buildContextMenus();
    await fetchEnabledModuleList();
  }
});