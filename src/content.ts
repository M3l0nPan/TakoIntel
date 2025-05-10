import browser from 'webextension-polyfill';

// Listener used to forward selected text to background context
document.addEventListener("selectionchange", () => {
    const selection: Selection | null = document.getSelection();
    if (browser.runtime?.id && selection) {
        const selectionString = selection.toString();
        if (browser.runtime.sendMessage && selectionString) {
            browser.runtime.sendMessage(selectionString);
        } else if (browser.runtime.sendMessage) {
            browser.runtime.sendMessage(null);
        }
    }
});