import { logs, logsType, errorType } from '../types/logs.interface';
import { fetchTroubleshootSettings } from './fetch_browser_storage';

/**
 * Check browser extension debug mode setting value.
 *
 * @returns troubleshootSettings.debugMode - Value of debug mode in browser storage.
 */
async function checkDebugModeEnabled() {
    const troubleshootSettings = await fetchTroubleshootSettings();

    return troubleshootSettings.debugMode
}

/**
 * Generate a message in browser console using console function.
 *
 * @param type - Type of message that will be displayed (debug, log, info, warn or error).
 * @param error - Error that will by displayed.
 */
export async function logConsoleMessage(type: logsType, error: errorType) {
    const logs: logs = {
        debug: console.debug,
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error
    };

    if (await checkDebugModeEnabled() && logs[type]) {
        logs[type](error);
    }
}
