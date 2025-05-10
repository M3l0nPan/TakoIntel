import browser from 'webextension-polyfill';
import { module } from '../types/module.interface';
import { logConsoleMessage } from './debug';
import { modulesPathList, privacySettings, troubleshootSettings } from './default_settings'
import { buildContextMenus } from './manage_context_menus';
import { generateId } from './tools';

/**
 * Load modules JSON object from files and store it in the browser's storage
 *
 */
async function storeDefaultModules() {
  const moduleList: module[] = [];

  for (const filePath of modulesPathList) {
    try {
      const url = browser.runtime.getURL(filePath);
      const response = await fetch(url);
      if (response.ok) {
        const moduleData = await response.json();
        moduleData.id = await generateId(moduleData.name)
        moduleList.push(moduleData);

      } else {
        logConsoleMessage('error', `Failed to JSON load ${filePath}: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        logConsoleMessage('error', `Error loading ${filePath}: ${error}`);
        logConsoleMessage('error', `Stack trace:\n${error.stack}`);
      }
    }
  }

  try {
    if (moduleList.length > 0) {
      await browser.storage.local.set({ 'moduleList': moduleList });
    }
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Failed to save module list in browser storage: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  }
}

/**
 * Initialize privacy settings in browser storage.
 *
 */
async function initializePrivacySettings() {

  try {
    await browser.storage.local.set({ 'privacySettings': privacySettings });
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Failed to save privacy settings in browser storage: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  }
}

/**
 * Initialize troubleshoot settings in browser storage.
 *
 */
async function initializeTroubleshootSettings() {

  try {
    await browser.storage.local.set({ 'troubleshootSettings': troubleshootSettings });
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Failed to save troubleshoot settings in browser storage: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  }
}


/**
 * Browser extension installation stages.
 *
 */
export async function installExtension() {

  await initializePrivacySettings();
  await initializeTroubleshootSettings();
  await storeDefaultModules();
  await buildContextMenus();

}