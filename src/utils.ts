/**
 * utils.ts
 * Owain Williams
 */
import { Correction } from './types';

const SUPABASE_FUNCTION_URL =
  'https://nigxexqjnqcnohpvbhes.supabase.co/functions/v1/corrector';
let correctionTimeout: number | null = null;

async function fetchCorrections(text: string): Promise<Correction[]> {
  const res = await fetch(SUPABASE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Edge function error: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as Correction[];
}

function scheduleCorrections(text: string, cb: (corrs: Correction[]) => void) {
  if (correctionTimeout !== null) {
    clearTimeout(correctionTimeout);
  }

  correctionTimeout = window.setTimeout(async () => {
    try {
      const corrections = await fetchCorrections(text);
      cb(corrections);
    } catch (err) {
      console.error("Correction failed", err);
    } finally {
      correctionTimeout = null;
    }
  }, 1000);
}

export function handleInput(e: KeyboardEvent) {
  console.log('input received');

  const el = e.target as HTMLElement;
  const text = el.textContent || "";

  chrome.runtime.sendMessage({
    type: "OPEN_SIDE_PANEL"
  });

  if (text === null || text.length === 0) {
    if (correctionTimeout !== null) {
      clearTimeout(correctionTimeout);
    }
    chrome.runtime.sendMessage({
      type: "EMPTY"
    });
    return;
  }

  if (text.length < 10) {
    if (correctionTimeout !== null) {
      clearTimeout(correctionTimeout);
    }
    chrome.runtime.sendMessage({
      type: "TOO_SHORT"
    });
    return;
  }

  chrome.runtime.sendMessage({
    type: "THINKING"
  });

  scheduleCorrections(text, (corrections: Correction[]) => {
    console.log("sending payload", corrections);

    const json = JSON.stringify(corrections)
    console.log("sending json", json);

    chrome.runtime.sendMessage({
      type: "WORDS_DETECTED",
      corrections: json
    })
  });
}

export function waitForElementById(id: string): Promise<HTMLElement> {
  return new Promise(resolve => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.getElementById(id);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
