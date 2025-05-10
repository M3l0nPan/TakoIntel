import browser from 'webextension-polyfill';
import { module } from '../types/module.interface'
import { logConsoleMessage } from './debug';
import { privacySettings, troubleshootSettings } from '../types/settings.interface'

/**
 * Fetch only enabled modules from moduleList in browser storage .
 *
 * @returns moduleList - Array that contains only enabled modules.
 */
export async function fetchEnabledModuleList(): Promise<module[]> {
  let moduleList: module[] | undefined;
  try {
    const result = await browser.storage.local.get('moduleList') as { moduleList?: module[] }
    moduleList = result.moduleList;
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Error loading module list: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  };

  if (!moduleList) {
    throw new Error('Module list not found in browser storage')
  }

  return moduleList.filter(module => module.enabled);;
}

/**
 * Fetch all modules from moduleList in browser storage .
 *
 * @returns moduleList - Array that contains modules.
 */
export async function fetchModuleList(): Promise<module[]> {
  let moduleList: module[] | undefined;
  try {
    const result = await browser.storage.local.get('moduleList') as { moduleList?: module[] }
    moduleList = result.moduleList;
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Error loading module list: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  };

  if (!moduleList) {
    throw new Error('Module list not found in browser storage')
  }

  return moduleList;
}

/**
 * Fetch privacySettings from browser storage .
 *
 * @returns loadedPrivacySettings - An array that contains privacy settings as key-value pairs.
 */
export async function fetchPrivacySettings(): Promise<privacySettings> {
  let loadedPrivacySettings: privacySettings | undefined;

  try {
    const result = await browser.storage.local.get('privacySettings') as { privacySettings?: privacySettings };
    loadedPrivacySettings = result.privacySettings;
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Error loading privacy settings: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  };

  if (!loadedPrivacySettings) {
    throw new Error('Privacy settings not found in browser storage')
  }

  return loadedPrivacySettings;
}

/**
 * Fetch troubleshoot settings from browser storage .
 *
 * @returns loadedTroubleshootSettings - An array that contains troubleshoot settings as key-value pairs.
 */
export async function fetchTroubleshootSettings(): Promise<troubleshootSettings> {
  let loadedTroubleshootSettings: troubleshootSettings | undefined;

  try {
    const result = await browser.storage.local.get('troubleshootSettings') as { troubleshootSettings?: troubleshootSettings };
    loadedTroubleshootSettings = result.troubleshootSettings;
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Error loading troubleshoot settings: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  };

  if (!loadedTroubleshootSettings) {
    throw new Error('Privacy settings not found in browser storage')
  }

  return loadedTroubleshootSettings;
}