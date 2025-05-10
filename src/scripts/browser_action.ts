import browser from 'webextension-polyfill';
import { module } from '../types/module.interface'
import { logConsoleMessage } from './debug';
import { checkLocalIPonPAPredSetting, checkExcludedRegex } from './tools';


/**
 * Show the status message when saving extension settings.
 *
 * @param moduleList - List of module that will be added to the container.
 * @param menuItemId - Unique ID assigned to menu item in browser right click menu.
 * @param selectionText - Selected text in the page. 
 */
export async function openModuleUrls(moduleList: module[], menuItemId: string, selectionText: string) {

  logConsoleMessage('debug', 'Function openModuleUrls');

  let buildedUrl = "";
 
  try {
    for (const module of moduleList) {
      if (module.id === menuItemId) {

        // Check selectionText against excluded regex and local IP regex (only for PAP red)
        const checkLocalIPonPAPred = await checkLocalIPonPAPredSetting(module, selectionText);
        const checkExcluded = await checkExcludedRegex(module, selectionText);

        if (checkLocalIPonPAPred && checkExcluded) {
          module.urls.forEach((url) => {
            if (url.includes('{SELECTION_TEXT_AREA}')) {
              buildedUrl = url.replace('{SELECTION_TEXT_AREA}', selectionText)
            } else {
              buildedUrl = url + selectionText;
            }
            browser.tabs.create({ url: buildedUrl });
          });      
        }
      }

      logConsoleMessage('info', `Opened URL : ${buildedUrl}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Error saving troubleshoot settings: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  }
}

