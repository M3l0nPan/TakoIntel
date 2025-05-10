import browser from 'webextension-polyfill';
import { module } from '../types/module.interface';
import { logConsoleMessage } from './debug';
import { showConfirmationBox } from './notification_box';
import { fetchModuleList, fetchPrivacySettings, fetchTroubleshootSettings } from './fetch_browser_storage';

/**
 * Show the status message when saving extension settings.
 *
 * @param statusMessageContainer - HTML alert popup object.
 * @param message - Message in the popup.
 * @param status - A specific CSS style is applied to the popup for each status.
 * @param duration - Through this function popup opacity is set to 1 (visible) for a time duration. 
 * @returns statusMessageContainer - Updated alert popup object with a specified status and an opacity set to 1 for a period of time.
 */
function showStatusMessage(statusMessageContainer: HTMLDivElement, message: string, status: 'error' | 'info' | 'success', duration: number) {

  logConsoleMessage('debug', 'Function showStatusMessage');

  // Set the message and color based on the status
  statusMessageContainer.textContent = message;
  statusMessageContainer.classList.remove('error', 'info', 'success');
  statusMessageContainer.classList.add(status);

  logConsoleMessage('debug', `Set statusMessageContainer to ${status}`);

  // Show the message
  statusMessageContainer.style.opacity = '1';

  // After 4 seconds, fade out the message
  setTimeout(() => {
    statusMessageContainer.style.transition = 'opacity 1s';
    statusMessageContainer.style.opacity = '0';
  }, duration);

  logConsoleMessage('debug', 'Timeout of 4000 milliseconds and opacity of 1 set on statusMessageContainer');

  return statusMessageContainer
}

/**
 * Used to update modules grid list render.
 *
 * @param container - HTML object that contain modules grid.
 * @param moduleList - Array of module that will be added to the container. 
 * @returns container - HTML container object as been updated with a new list of modules.
 */
async function renderModuleList(container: HTMLElement, moduleList: module[]) {

  logConsoleMessage('debug', 'Function renderModuleList');

  // Select all .module-box objects (modules) in container and removed them before importing a new list of modules
  const currentModuleBoxes = container.querySelectorAll('.module-box');
  currentModuleBoxes.forEach(moduleBox => moduleBox.remove());

  logConsoleMessage('debug', `Module list that will be rendered :\n${JSON.stringify(moduleList, null, 2)}`);

  // Sort module list in alphabetical order (case insensitive)
  moduleList.sort((moduleA, moduleB) => {
    const nameA = moduleA.name.toLowerCase();
    const nameB = moduleB.name.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  // Iterate through each module object of the list to build module box object 
  moduleList.forEach(module => {

    const moduleBox = document.createElement('div');
    moduleBox.classList.add('module-box');

    // Add an id to each module box HTML object to allow it to be identified and linked to the module it contains.
    moduleBox.setAttribute('data-id', module.id);

    // Module info object will contains name, category, description, regex/URls list and PAP value
    const moduleInfo = document.createElement('div');
    moduleInfo.classList.add('module-info');

    // Module name as title
    const moduleName = document.createElement('h3');
    moduleName.textContent = module.name;
    moduleInfo.appendChild(moduleName);

    const moduleCategory = document.createElement('p');
    moduleCategory.textContent = module.category;
    moduleCategory.classList.add('module-info-category');
    moduleInfo.appendChild(moduleCategory);

    const moduleDescription = document.createElement('p');
    moduleDescription.textContent = module.description || 'No description available.';
    const descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('module-info-description');
    descriptionContainer.appendChild(moduleDescription);
    moduleInfo.appendChild(descriptionContainer);

    // Module regex list join with line breaks
    const regexPatterns = document.createElement('div');
    regexPatterns.classList.add('module-info-detail');
    regexPatterns.innerHTML = `<strong>Regex Patterns:</strong><br><pre><code>${module.regexPatterns.join('\n')}</code></pre>`;
    moduleInfo.appendChild(regexPatterns);

    // Module URLs list join with line breaks
    const urls = document.createElement('div');
    urls.classList.add('module-info-detail');
    urls.innerHTML = `<strong>URLs:</strong><br><pre><code>${module.urls.join('\n')}</code></pre>`;
    moduleInfo.appendChild(urls);

    const pap = document.createElement('div');
    pap.classList.add('module-info-detail');
    pap.innerHTML = `<strong>PAP:</strong> <span class="pap-badge ${module.pap === 'green' ? 'good' : 'bad'}">${module.pap}</span>`;
    moduleInfo.appendChild(pap);

    // Toggle container (slider)
    const toggleContainer = document.createElement('div');
    toggleContainer.classList.add('toggle-container');

    const toggle = document.createElement('label');
    toggle.classList.add('switch');

    // Create the checkbox input for the slider
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = module.enabled;

    // Append the input to the label and the label to the toggle container
    toggle.appendChild(checkbox);
    const slider = document.createElement('span');
    slider.classList.add('slider');
    toggle.appendChild(slider);
    toggleContainer.appendChild(toggle);

    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = '🗑️';

    // Add edit button
    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.innerHTML = '✏️';

    moduleBox.appendChild(moduleInfo);
    moduleBox.appendChild(toggleContainer);
    moduleBox.appendChild(deleteButton);
    moduleBox.appendChild(editButton);

    // Append the module box to the container module grid object
    container.appendChild(moduleBox);
  });

  logConsoleMessage('debug', 'Returned container object that encapsulates the module grid. :\n' + container);

  return container;
}

// HTML settings page will be dynamically constructed
document.addEventListener('DOMContentLoaded', async function () {
  let pendingChanges = false;
  let container = document.getElementById('module-settings-container');
  let moduleBox: HTMLElement | null;

  // Import moduleList, privacySettings and troubleshootSettings from browser storage
  let moduleList = await fetchModuleList();
  const privacySettings = await fetchPrivacySettings();
  const troubleshootSettings = await fetchTroubleshootSettings();

  // Add module search bar to the setting page
  const searchInput = document.getElementById('module-search');

  if (container) {
    container = await renderModuleList(container, moduleList);

    // Add event listener for all buttons on the module grid
    container.addEventListener('click', async function (element) {
      if (element.target && element.target instanceof HTMLElement) {
        moduleBox = element.target.closest('.module-box');
      }

      if (moduleBox) {
        const moduleId = moduleBox.getAttribute('data-id');
        const module = moduleList.find((module) => module.id === moduleId);

        // A module box delete button has been clicked
        if (container && module && element.target && element.target instanceof HTMLElement && element.target.classList.contains('delete-button')) {
          if (await showConfirmationBox('Confirmation Required', `Are you sure you want to delete the module "${module.name}" ?`)) {
            // Remove the module from the moduleList array
            moduleList = moduleList.filter((module) => module.id !== moduleId);
            pendingChanges = true;

            // Remove the module box from the DOM
            container.removeChild(moduleBox);

            logConsoleMessage('debug', 'A module have been removed from container box: ' + JSON.stringify(module, null, 2));
          }
        } else if (module && element.target && element.target instanceof HTMLElement && element.target.classList.contains('edit-button')) {
          window.location.href = `module_edition.html?action=edit&id=${module.id}`;

          logConsoleMessage('debug', 'Module edition page has been opened for module: ' + JSON.stringify(module, null, 2));
        }
      }
    });

    container.addEventListener('change', function (element) {
      if (element.target && element.target instanceof HTMLElement) {
        moduleBox = element.target.closest('.module-box');
      }

      if (moduleBox) {
        const moduleId = moduleBox.getAttribute('data-id');
        const module = moduleList.find((module) => module.id === moduleId);

        // Handle module checkbox slider changes
        if (module && element.target && element.target instanceof HTMLInputElement && element.target.type === 'checkbox') {
          module.enabled = element.target.checked;
          pendingChanges = true;

          logConsoleMessage('debug', `Setting enabled of module ${module.name} has been set to ${element.target.checked}`);
        }
      }
    });

    // Retrieve and display the current value of other settings elements from the browser's storage
    let allowLocalIPCheckbox = document.getElementById('allow-local-ip-pap-red');
    if (allowLocalIPCheckbox instanceof HTMLInputElement) {
      allowLocalIPCheckbox.checked = privacySettings.allowLocalIPonPAPred;
    }

    let excludedRegexTextarea = document.getElementById('excluded-regex-pap-red');
    if (excludedRegexTextarea instanceof HTMLInputElement) {
      excludedRegexTextarea.value = privacySettings.excludedRegexPatternsonPAPred.join('\n') || "";
    }

    let debugMode = document.getElementById('enable-debug-mode');
    if (debugMode instanceof HTMLInputElement) {
      debugMode.checked = troubleshootSettings.debugMode;
    }

    // Create add module button
    const addModuleButton = document.createElement('button');
    addModuleButton.textContent = 'Add module';
    addModuleButton.classList.add('add-module-button');
    container.appendChild(addModuleButton);

    // Create button to persist changes
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save settings';
    saveButton.classList.add('save-button');
    container.appendChild(saveButton);

    // Create the status message container
    let statusMessageContainer = document.createElement('div');
    statusMessageContainer.classList.add('status-message-container');
    container.appendChild(statusMessageContainer);

    // Search bar listener
    if (searchInput instanceof HTMLInputElement) {
      searchInput.addEventListener('input', async function () {
        const searchQuery = searchInput.value.toLowerCase();
        const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);
        const filteredModules = moduleList.filter(module => {
          return searchWords.every(word =>
            module.name.toLowerCase().includes(word) ||
            module.description.toLowerCase().includes(word) ||
            module.urls.some(url => url.toLowerCase().includes(word))
          );
        });
        if (container) {
          container = await renderModuleList(container, filteredModules);
        }
      });
    }

    // Handling the "Allow Local IP on PAP Red" checkbox
    if (allowLocalIPCheckbox instanceof HTMLInputElement) {
      allowLocalIPCheckbox.addEventListener('change', function () {
        allowLocalIPCheckbox = document.getElementById('allow-local-ip-pap-red');
        if (allowLocalIPCheckbox instanceof HTMLInputElement) {
          privacySettings.allowLocalIPonPAPred = allowLocalIPCheckbox.checked;
          pendingChanges = true;
        }
      });
    }

    // Handling the "Excluded Regex" textarea
    if (excludedRegexTextarea instanceof HTMLInputElement) {
      excludedRegexTextarea.addEventListener('input', function () {
        excludedRegexTextarea = document.getElementById('excluded-regex-pap-red');
        if (excludedRegexTextarea instanceof HTMLInputElement) {
          privacySettings.excludedRegexPatternsonPAPred = excludedRegexTextarea.value.split('\n').map(item => item.trim()).filter(Boolean);
          pendingChanges = true;
        }
      });
    }

    // Handling the "Enable debug mode" checkbox
    if (debugMode instanceof HTMLInputElement) {
      debugMode.addEventListener('change', function () {
        debugMode = document.getElementById('enable-debug-mode');
        if (debugMode instanceof HTMLInputElement) {
          troubleshootSettings.debugMode = debugMode.checked;
          pendingChanges = true;
        }
      });
    }

    // Handling the "Add module" button to redirect on module_edition HTML page
    addModuleButton.addEventListener('click', function () {
      window.location.href = `module_edition.html?action=create`;
    });

    // Handline the "Save settings"
    saveButton.addEventListener('click', function () {
      if (pendingChanges) {
        // Save the updated module list to browser storage
        browser.storage.local.set({ 'moduleList': moduleList }).then(function () {
          logConsoleMessage('info', 'Module settings saved');
        }).catch(function (error) {
          logConsoleMessage('error', `Error saving module settings: ${error}`);
          logConsoleMessage('error', `Stack trace:\n${error.stack}`);
          statusMessageContainer = showStatusMessage(statusMessageContainer, 'Error saving settings!', 'error', 4000);
        });

        // Save privacySettings value
        browser.storage.local.set({ 'privacySettings': privacySettings }).then(function () {
          logConsoleMessage('info', 'Privacy settings saved');
        }).catch(function (error) {
          logConsoleMessage('error', `Error saving privacy settings: ${error}`);
          logConsoleMessage('error', `Stack trace:\n${error.stack}`);
          statusMessageContainer = showStatusMessage(statusMessageContainer, 'Error saving settings!', 'error', 4000);
        });

        // Save troubleshootSettings value
        browser.storage.local.set({ 'troubleshootSettings': troubleshootSettings }).then(function () {
          logConsoleMessage('info', 'Troubleshoot settings saved');
        }).catch(function (error) {
          logConsoleMessage('error', `Error saving troubleshoot settings: ${error}`);
          logConsoleMessage('error', `Stack trace:\n${error.stack}`);
          statusMessageContainer = showStatusMessage(statusMessageContainer, 'Error saving settings!', 'error', 4000);
        });

        // Show save settings status
        statusMessageContainer = showStatusMessage(statusMessageContainer, 'Settings saved successfully!', 'success', 4000);
        pendingChanges = false;
      } else {
        logConsoleMessage('info', 'No changes to save.');
        statusMessageContainer = showStatusMessage(statusMessageContainer, 'No changes to save!', 'info', 4000);
      }
    });
  }
});
