/**
 * Show confirmation alert box with two buttons "Yes" and "No"
 *
 * @param title - HTML notification box title.
 * @param message - HTML notification box message. 
 */
export function showConfirmationBox(title: string, message:string) {

  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-box-overlay';

    // Create confirmation box
    const confirmationBox = document.createElement('div');
    confirmationBox.className = 'notification-box';

    // Add title
    const titleElement = document.createElement('h2');
    titleElement.innerText = title;
    confirmationBox.appendChild(titleElement);

    // Add message
    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    confirmationBox.appendChild(messageElement);

    // Add confirm button
    const confirmButton = document.createElement('button');
    confirmButton.innerText = 'Yes';
    confirmButton.className = 'notification-box-confirm-button';
    confirmButton.addEventListener('click', () => {
      resolve(true); // Resolve the promise with "true" when confirmed
      document.body.removeChild(overlay);
    });
    confirmationBox.appendChild(confirmButton);

    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'No';
    cancelButton.className = 'notification-box-cancel-button';
    cancelButton.addEventListener('click', () => {
      resolve(false); // Resolve the promise with "false" when canceled
      document.body.removeChild(overlay);
    });
    confirmationBox.appendChild(cancelButton);

    // Append confirmation box to overlay
    overlay.appendChild(confirmationBox);

    // Append overlay to body
    document.body.appendChild(overlay);
  });
}

/**
 * Show notification alert box with a message and a "Close" button.
 *
 * @param message - HTML notification box message. 
 */
export function showMessageBox(messages: string[]) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'notification-box-overlay';

  // Create alert box
  const alertBox = document.createElement('div');
  alertBox.className = 'notification-box';

  // Add title
  const title = document.createElement('h2');
  title.innerText = 'Validation Errors';
  alertBox.appendChild(title);

  // Add messages as a list
  const messageList = document.createElement('ul');
  messages.forEach((message) => {
    const listItem = document.createElement('li');
    listItem.innerText = message;
    messageList.appendChild(listItem);
  });
  alertBox.appendChild(messageList);

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'notification-box-button';
  closeButton.innerText = 'Close';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  alertBox.appendChild(closeButton);

  // Append alert box to overlay
  overlay.appendChild(alertBox);

  // Append overlay to body
  document.body.appendChild(overlay);
}