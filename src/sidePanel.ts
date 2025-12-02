import { CLASSIFICATION_COLORS, Correction } from './types';

const container = document.getElementById("corrections");

function createCorrection(correction: Correction): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "correction";

  const primary = CLASSIFICATION_COLORS[correction.classification].primary;
  const background = CLASSIFICATION_COLORS[correction.classification].background;

  div.innerHTML = `
    <details class="correction-dropdown" open>
      <summary class="correction-header">
        <span class="correction-pill" style="color:${primary}">${correction.classification}</span>
      </summary>

      <div class="correction-body">
        <p class="correction-description">
          ${correction.description}
        </p>

        <div class="correction-replacement" ${correction.classification === "role" ? 'style="display:none"' : ""}>
          <span class="label">Where</span>
          <span class="target" style="color:${primary};background:${background}">"${correction.target}"</span>
        </div>
        
        <div class="correction-replacement" ${correction.classification === "role" ? 'style="display:none"' : ""}>
          <span class="label">Suggestion</span>
          <span class="replacement">${correction.correction}</span>
        </div>
      </div>
    </details>
  `;

  return div;
}

function render(corrections: Correction[]) {
  container.innerHTML = "";
  corrections.forEach(correction => {
    const div = createCorrection(correction);
    container.appendChild(div);
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "WORDS_DETECTED") {
    console.log("received json", msg.corrections);

    const corrections: Correction[] = JSON.parse(msg.corrections);
    console.log("corrections parsed as", corrections);

    if (corrections.length === 0) {
      container.innerHTML = "<p style='margin-left: 16px'>Nothing to correct here &#128511;</p>";
      return;
    }

    render(corrections);
    return;
  }

  if (msg.type === "TOO_SHORT") {
    container.innerHTML = "<p style='margin-left: 16px'>Too short, I won't judge &#128521;</p>";
    return;
  }

  if (msg.type === "EMPTY") {
    container.innerHTML = "<p style='margin-left: 16px'>Start typing your prompt to get started &#128526;</p>";
    return;
  }

  if (msg.type === "THINKING") {
    container.innerHTML = "<p style='margin-left: 16px'>Thinking &#129325;</p>";
    return;
  }
});
