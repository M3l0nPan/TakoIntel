import browser from 'webextension-polyfill';
import { module } from '../types/module.interface'
import { logConsoleMessage } from './debug';
import { fetchEnabledModuleList } from './fetch_browser_storage';

// Used to check whether the construction of the browser context menu is already in progress
let isBuildingContextMenus = false;


/**
 * Remove all entries from the browser context menu.
 *
 */
async function cleanContextMenus() {
  try {
    await browser.contextMenus.removeAll();
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Error during browser contextMenus reset: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  }
}

/**
 * Construct the browser context menu with entries for the enabled modules.
 *
 */
export async function buildContextMenus() {
  let moduleEnabledList: module[] | undefined;

  if (isBuildingContextMenus) {
    logConsoleMessage('debug', 'Function buildContextMenus is already running.');
    return;
  }

  // Set the flag to true to indicate that the function is running
  isBuildingContextMenus = true;

  try {
    moduleEnabledList = await fetchEnabledModuleList();
  } catch (error) {
    if (error instanceof Error) {
      logConsoleMessage('error', `Error loading enabled module list from storage: ${error}`);
      logConsoleMessage('error', `Stack trace:\n${error.stack}`);
    }
  }

  // Remove all entries before rebuilding the browser context menu
  await cleanContextMenus();

  if (Array.isArray(moduleEnabledList) && moduleEnabledList.length > 0) {
    const categoryCounts: Record<string, number> = {};
    const contextMenusList: string[] = [];

    // Utilized to organize modules by category, counting the number of occurrences of each category in the module list.
    for (const module of moduleEnabledList) {
      if (module.category) {
        categoryCounts[module.category] = (categoryCounts[module.category] || 0) + 1;
      }
    }

    for (const module of moduleEnabledList) {
      try {
        if (module.category) {

          // Create a parent menu entry only if at least two modules share the same category.
          if (!contextMenusList.includes(module.category) && categoryCounts[module.category] > 1) {
            browser.contextMenus.create({
              id: module.category,
              title: module.category,
              contexts: ['selection'],
              enabled: true
            });
            contextMenusList.push(module.category);
          }

        }
      } catch (error) {
        if (error instanceof Error) {
          logConsoleMessage('error', `Error building browser context menu parents: ${error}`);
          logConsoleMessage('error', `Stack trace:\n${error.stack}`);
        }
      }

    }

    for (const module of moduleEnabledList) {
      try {

        // Create a menu entry with the parent menu ID for modules that share the same category
        if (categoryCounts[module.category] > 1) {
          browser.contextMenus.create({
            parentId: module.category,
            id: module.id,
            title: module.name,
            contexts: ['selection'],
            enabled: false
          });
          contextMenusList.push(module.name);

        // Create a menu entry for modules that do not share a category
        } else if (categoryCounts[module.category] < 2) {
          browser.contextMenus.create({
            id: module.id,
            title: module.name,
            contexts: ['selection'],
            enabled: false
          });
          contextMenusList.push(module.name);
        }

      } catch (error) {
        if (error instanceof Error) {
          logConsoleMessage('error', `Error building browser context menu: ${error}`);
          logConsoleMessage('error', `Stack trace:\n${error.stack}`);
        }
      }
    }
  }

  // Set the flag to false to indicate that the function is not running anymore
  isBuildingContextMenus = false;
}

/**
 * Update browser context menu entries status (enabled or not).
 *
 * @param moduleList - Array that contains only enabled modules.
 * @param matchedModules - An array containing modules with a regex that matches the selected text on the browser page.
 * @param selectionText - Text selected on the browser page.
 */
export async function updateContextMenus(moduleList: module[], matchedModules: module[], selectionText: string) {
  if (selectionText) {
    
    logConsoleMessage('info', `Selected text on the page: ${selectionText}`);

    if (Array.isArray(matchedModules) && matchedModules.length > 0) {

      logConsoleMessage('debug', `Matched modules list:\n${JSON.stringify(matchedModules, null, 2)}`); 

      for (const module of matchedModules) {
        browser.contextMenus.update(module.id, {
          enabled: true
        });
      }

    // In case no regex module matched selected text, deactivate all browser context menu entries
    } else {
      for (const module of moduleList) {
        browser.contextMenus.update(module.id, {
          enabled: false
        });
      }
    }

  // In case no text has been selected, deactivate all browser context menu entries
  } else {
    for (const module of moduleList) {
      browser.contextMenus.update(module.id, {
        enabled: false
      });
    }
  }
}