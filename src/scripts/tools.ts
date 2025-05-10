import { module } from '../types/module.interface'
import { privacySettings } from '../types/settings.interface'
import { logConsoleMessage } from './debug';
import { fetchPrivacySettings } from './fetch_browser_storage';

/**
 * Used to check wether selected text contains an excluded regex.
 *
 * @param module - Module array object.
 * @param moduleList - Selected text from the browser web page. 
 */
export async function checkExcludedRegex(module: module, selectionText: string): Promise<boolean> {
  const privacySettings: privacySettings = await fetchPrivacySettings();

  // Return directly check pass if the module PAP is green 
  if (module.pap === 'green') {
    logConsoleMessage('debug', `The module ${module.name} has passed the excluded regex check (PAP is green)`);
    return true;
  }

  for (const pattern of privacySettings.excludedRegexPatternsonPAPred) {
    try {
      const regex = new RegExp(pattern);
      if (regex.test(selectionText)) {
        logConsoleMessage('info', `Module ${module.name} with PAP red matched excluded regex: ${regex}`);
        return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        logConsoleMessage('error', `Error loading or testing regex: ${error}`);
        logConsoleMessage('error', `Stack trace:\n${error.stack}`);
      }
    }
  }

  logConsoleMessage('debug', `The module ${module.name} has passed the excluded regex check (no excluded regex matched)`);
  return true;
}

/**
 * Used to check wether selected text contains a local IP.
 *
 * @param module - Module array object.
 * @param moduleList - Selected text from the browser web page. 
 */
export async function checkLocalIPonPAPredSetting(module: module, selectionText: string): Promise<boolean> {
  const privacySettings = await fetchPrivacySettings();

  if (module.pap === 'green' || privacySettings.allowLocalIPonPAPred) {

    logConsoleMessage('debug', `The module ${module.name} has passed the local ip check (PAP is green)`);
    return true;

  } else if (!isLocalIp(selectionText)) {

    logConsoleMessage('debug', `The module ${module.name} has passed the local check (selected text is not a local ip)`);
    return true;

  }

  logConsoleMessage('info', `Module ${module.name} with PAP red matched local ip check: ${selectionText}`);
  return false;
}

/**
 * Generate a unique SHA256 identifier using the module name and the current timestamp.
 *
 * @param moduleName - Module array object.
 * @returns hashHex - Module SHA256 generated id.
 */
export async function generateId(moduleName: string): Promise<string> {
  const timestamp = Date.now().toString();
  const combinedString = timestamp + moduleName;

  // Convert the combined string into an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(combinedString);

  // Hash the data using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert the ArrayBuffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * Check wether input string is a local IP address.
 *
 * @param ip - Input string to be tested againt local IP regex.
 */
export function isLocalIp(ip: string): boolean {
  const regexLocalIp = /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/;
  return regexLocalIp.test(ip);
}

/**
 * Check the selected text against each module's regex to return a list of modules that match.
 *
 * @param moduleList - Array of module that will be checked against regex. 
 * @param selectionText - Text selected on the browser page.
 * @returns Array of module with regex that matched selected text.
 */
export async function matchSelectionText(moduleList: module[], selectionText: string): Promise<module[]> {
  const matchedModule: module[] = [];
  let regex: RegExp;

  for (const module of moduleList) {
    for (const pattern of module.regexPatterns) {
      try {
        regex = new RegExp(pattern);
        if (regex.test(selectionText) && !matchedModule.includes(module)) {
          matchedModule.push(module);
        }
      } catch (error) {
        if (error instanceof Error) {
          logConsoleMessage('error', `Error loading regex: ${error}`);
          logConsoleMessage('error', `Stack trace:\n${error.stack}`);
        }
      }
    }
  }

  return matchedModule;
}