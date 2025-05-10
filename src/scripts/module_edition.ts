import browser from 'webextension-polyfill';
import { module } from '../types/module.interface';
import { logConsoleMessage } from './debug';
import { showMessageBox } from './notification_box';
import { fetchModuleList } from './fetch_browser_storage';
import { validateModuleName, validateModuleCategory, validateModuleDescription, validateRegexPatterns, validateUrls, validatePAP } from './linters';
import { generateId } from './tools';

/**
 * A function to display an error message beneath the text area during editing.
 *
 * @param field - HTML object that contain textArea being edited editing.
 * @param message - Error message from linter to be displayed. 
 */
function showError(field: HTMLTextAreaElement, message: string) {
  field.classList.add('error');
  // Check if an error message already exists, if so, don't create a new one
  let errorElement = field.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('linter-error-message')) {
    errorElement = document.createElement('div');
    errorElement.className = 'linter-error-message';
    (errorElement as HTMLElement).innerText = message;
    field.insertAdjacentElement('afterend', errorElement);
  } else if (errorElement instanceof HTMLElement) {
    errorElement.innerText = message;
  }
}

/**
 * A function to display an error message beneath the text area during editing.
 *
 * @param field - HTML object that contain textArea under edition.
 */
function clearError(field: HTMLTextAreaElement) {
  const errorElement = field.nextElementSibling;
  field.classList.remove('error');
  if (errorElement && errorElement.classList.contains('linter-error-message')) {
    errorElement.remove();
  }
}

// HTML module edition page will be dynamically constructed
document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const moduleId = urlParams.get('id');
  let module: module | undefined;

  // Retrieve module list from browser storage
  const moduleList = await fetchModuleList();

  // Check that action is edit and the module id in URL parameter
  if (action === "edit" && moduleId) {
    module = moduleList.find(module => module.id === moduleId);
    if (!module) {
      throw new Error('Module id not found in browser local storage.');
    }

    // In case action parameter is create, generate an empty module object
  } else if (action === "create") {
    module = {
      id: '',
      name: '',
      category: '',
      description: '',
      regexPatterns: [],
      urls: [],
      pap: 'red',
      enabled: true,
    };
    moduleList.push(module);
  } else {
    return;
  }

  const moduleNameField = document.getElementById('module-name') as HTMLTextAreaElement | null;
  const moduleCategoryField = document.getElementById('module-category') as HTMLTextAreaElement | null;
  const moduleDescriptionField = document.getElementById('module-description') as HTMLTextAreaElement | null;
  const moduleRegexField = document.getElementById('module-regex') as HTMLTextAreaElement | null;
  const moduleUrlsField = document.getElementById('module-urls') as HTMLTextAreaElement | null;
  const modulePAPField = document.getElementById('module-pap') as HTMLTextAreaElement | null;

  if (moduleNameField) {
    // Initialize text area with existing value
    moduleNameField.value = module.name;

    // Listener that trigger when module name text area as lost focus
    moduleNameField.addEventListener('blur', function () {
      const result = validateModuleName(moduleNameField.value);
      if (!result.isValid && result.message) {
        showError(moduleNameField, result.message);
      } else {
        clearError(moduleNameField);
      }
    });
  }

  if (moduleCategoryField) {
    moduleCategoryField.value = module.category;

    moduleCategoryField.addEventListener('blur', function () {
      const result = validateModuleCategory(moduleCategoryField.value);
      if (!result.isValid && result.message) {
        showError(moduleCategoryField, result.message);
      } else {
        clearError(moduleCategoryField);
      }
    });
  }

  if (moduleDescriptionField) {
    moduleDescriptionField.value = module.description;

    moduleDescriptionField.addEventListener('blur', function () {
      const result = validateModuleDescription(moduleDescriptionField.value);
      if (!result.isValid && result.message) {
        showError(moduleDescriptionField, result.message);
      } else {
        clearError(moduleDescriptionField);
      }
    });
  }

  if (moduleRegexField) {
    // Initialize the module regex text area with existing values from a list of regex patterns, joined by line break delimiters
    moduleRegexField.value = module.regexPatterns ? module.regexPatterns.join('\n') : '';

    moduleRegexField.addEventListener('blur', function () {
      const result = validateRegexPatterns(moduleRegexField.value);
      if (!result.isValid && result.message) {
        showError(moduleRegexField, result.message);
      } else {
        clearError(moduleRegexField);
      }
    });
  }

  if (moduleUrlsField) {
    // Initialize the module regex text area with existing values from a list of URLs, joined by line break delimiters
    moduleUrlsField.value = module.urls ? module.urls.join('\n') : '';

    moduleUrlsField.addEventListener('blur', function () {
      const result = validateUrls(moduleUrlsField.value);
      if (!result.isValid && result.message) {
        showError(moduleUrlsField, result.message);
      } else {
        clearError(moduleUrlsField);
      }
    });
  }

  if (modulePAPField) {
    modulePAPField.value = module.pap;

    modulePAPField.addEventListener('blur', function () {
      const result = validatePAP(modulePAPField.value);
      if (!result.isValid && result.message) {
        showError(modulePAPField, result.message);
      } else {
        clearError(modulePAPField);
      }
    });
  }

  // Go back to settings page
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', function () {
      // Go back to settings without saving
      window.location.href = 'settings.html';
    });
  }

  // Apply changes and return to the settings page
  const applyChanges = document.querySelector('.apply-changes');
  if (applyChanges) {
    applyChanges.addEventListener('click', async function () {
      if (moduleNameField && moduleCategoryField && moduleDescriptionField && moduleRegexField && moduleUrlsField && modulePAPField) {
        // Validate each module fields
        const nameValidation = validateModuleName(moduleNameField.value);
        const categoryValidation = validateModuleCategory(moduleCategoryField.value);
        const descriptionValidation = validateModuleDescription(moduleDescriptionField.value);
        const regexValidation = validateRegexPatterns(moduleRegexField.value);
        const urlsValidation = validateUrls(moduleUrlsField.value);
        const papValidation = validatePAP(modulePAPField.value);

        const linterMessages: string[] = [];

        if (!nameValidation.isValid && nameValidation.message) {
          linterMessages.push(nameValidation.message);
        }
        if (!categoryValidation.isValid && categoryValidation.message) {
          linterMessages.push(categoryValidation.message);
        }
        if (!descriptionValidation.isValid && descriptionValidation.message) {
          linterMessages.push(descriptionValidation.message);
        }
        if (!regexValidation.isValid && regexValidation.message) {
          linterMessages.push(regexValidation.message);
        }
        if (!urlsValidation.isValid && urlsValidation.message) {
          linterMessages.push(urlsValidation.message);
        }
        if (!papValidation.isValid && papValidation.message) {
          linterMessages.push(papValidation.message);
        }

        // If there are any linter errors, alert them all at once
        if (linterMessages.length > 0) {
          showMessageBox(linterMessages);
          return;
        }

        if (!module.id) {
          module.id = await generateId(module.name)
        }

        module.name = moduleNameField.value;
        module.category = moduleCategoryField.value;
        module.description = moduleDescriptionField.value;
        module.regexPatterns = moduleRegexField.value.split('\n');
        module.urls = moduleUrlsField.value.split('\n');
        module.pap = modulePAPField.value as 'green' | 'red';

        // Save the updated module back to storage
        browser.storage.local.set({ 'moduleList': moduleList }).then(function () {
          // After saving, redirect back to the settings page
          window.location.href = 'settings.html';
        }).catch(function (error) {
          if (error instanceof Error) {
            logConsoleMessage('error', `Error saving edited module:: ${error}`);
            logConsoleMessage('error', `Stack trace:\n${error.stack}`);
          }
        });
      }
    });
  }
});