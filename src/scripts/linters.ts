import { logConsoleMessage } from './debug';

/**
 * Validate the module name against various prerequisites, such as non-emptiness or maximum length.
 *
 * @param name - Module name to be checked.
 * @returns  An object that contains a boolean indicating whether the module name is valid or not along with a string message in case of invalidity.
 */
export function validateModuleName(name: string) {
  if (name.trim() === "") {
    logConsoleMessage('info', `Module name is not valid (empty)`);
    return { isValid: false, message: "Module name cannot be empty." };
  }

  if (name.length > 30) {
    logConsoleMessage('info', `Module name ${name} is not valid (too long)`);
    return { isValid: false, message: "Module name cannot exceed 30 characters." };
  }

  logConsoleMessage('debug', `Module name ${name} is valid`);
  return { isValid: true };
}

/**
 * Validate the module category against various prerequisites, such as non-emptiness or maximum length.
 *
 * @param category - Module category to be checked.
 * @returns  An object that contains a boolean indicating whether the module category is valid or not along with a string message in case of invalidity.
 */
export function validateModuleCategory(category: string) {
  if (category.trim() === "") {
    logConsoleMessage('info', `Module category is not valid (empty)`);
    return { isValid: false, message: "Module category cannot be empty." };
  }

  if (category.length > 30) {
    logConsoleMessage('info', `Module category ${category} is not valid (too long)`);
    return { isValid: false, message: "Module category cannot exceed 30 characters." };
  }

  logConsoleMessage('debug', `Module category ${category} is valid`);
  return { isValid: true };
}


/**
 * Validate the module description against various prerequisites, such as non-emptiness or maximum length.
 *
 * @param description - Module description to be checked.
 * @returns  An object that contains a boolean indicating whether the module description is valid or not along with a string message in case of invalidity.
 */
export function validateModuleDescription(description: string) {
  if (description.length > 500) {
    logConsoleMessage('info', `Module description is too long :\n${description}`);
    return { isValid: false, message: "Description cannot exceed 500 characters." };
  }

  logConsoleMessage('debug', `Module descrition is valid:\n${description}`);
  return { isValid: true };
}

/**
 * Validate the module regex list against various prerequisites, such as non-emptiness or Regex validity.
 *
 * @param regexPatterns - Module regex list to be checked.
 * @returns  An object that contains a boolean indicating whether the module regex list is valid or not along with a string message in case of invalidity.
 */
export function validateRegexPatterns(regexPatterns: string) {
  
  // Split value into an array by newline
  const regexPatternsList = regexPatterns.split('\n').map(pattern => pattern.trim()).filter(Boolean);

  if (!Array.isArray(regexPatternsList) || regexPatternsList.length === 0) {
    
    logConsoleMessage('info', `Module regex list is not valid (empty).`);
    return { isValid: false, message: "At least one regex pattern is required."};
  }

  // Validate each pattern as Regex object
  for (const pattern of regexPatternsList) {
    try {
      new RegExp(pattern);
    } catch (error) {

      if (error instanceof Error) {
        logConsoleMessage('info', `Error in module regex: ${error}`);
      }
      return {isValid: false, message: `Regex error: "${pattern}". ${(error as Error).message}` };
    }
  }

  logConsoleMessage('debug', `Module regex list is valid:\n${regexPatternsList}`);
  return { isValid: true };
}

/**
 * Validate the module URLs list against various prerequisites, such as non-emptiness or URL validity.
 *
 * @param urls - Module URLs to be checked.
 * @returns  An object that contains a boolean indicating whether the module URLs list is valid or not along with a string message in case of invalidity.
 */
export function validateUrls(urls: string) {
  // Split value into an array by newline
  const urlsList = urls.split('\n').map(pattern => pattern.trim()).filter(Boolean);

  if (!Array.isArray(urlsList) || urlsList.length === 0) {

    logConsoleMessage('info', `Module URLs list is not valid (empty).`);
    return {isValid: false, message: "At least one URL is required."};
  }

  // Define a regex pattern for validating URLs
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-.~:?#[\]@!$&'()*+,;={}]*)*\/?$/;

  // Check each URL against the URL regex pattern
  const invalidUrls = urlsList.filter(url => !urlRegex.test(url));

  if (invalidUrls.length > 0) {
    logConsoleMessage('info', `Some module URLs are not valid:\n${invalidUrls.join('\n')}`);
    return {isValid: false, message: `The following URLs are invalid:\n${invalidUrls.join('\n')}`};
  }

  logConsoleMessage('debug', `Module URLs list is valid:\n${urlsList}`);
  return { isValid: true };
}

/**
 * Validate the module PAP value (green or red).
 *
 * @param pap - Module URLs to be checked.
 * @returns  An object that contains a boolean indicating whether the module URLs list is valid or not along with a string message in case of invalidity.
 */
export function validatePAP(pap: string) {
  if (pap !== "green" && pap !== "red") {

    logConsoleMessage('info', `PAP value ${pap} is not valid`);
    return { isValid: false, message: "PAP value must be 'green' or 'red'." };
  }

  logConsoleMessage('debug', `Module pap value ${pap} is valid`);
  return { isValid: true };
}