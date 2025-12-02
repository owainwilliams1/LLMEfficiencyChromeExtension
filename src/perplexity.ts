/**
 * perplexity.js
 * Owain Williams
 */

import { handleInput, waitForElementById } from './utils';

function attachListener() {
  console.log('listener attaching');

  waitForElementById("ask-input").then(el => {
    console.log('element found');
    el.addEventListener("keyup", handleInput as EventListener, { passive: true });
  });
}

attachListener();
