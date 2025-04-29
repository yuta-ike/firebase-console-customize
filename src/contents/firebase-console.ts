import type { PlasmoCSConfig } from "plasmo";
import { getContrastColor } from "../utils/color.ts"; // Import the helper function

// Define the type for the stored settings
type Settings = {
  [projectId: string]: string;
};

// Configure the content script to run on Firebase Console project pages
export const config: PlasmoCSConfig = {
  matches: ["https://console.firebase.google.com/*"],
};

console.log("Firebase Background Changer: Content script loaded.");

// Function to apply background color and text contrast (uses imported getContrastColor)
const applyBackgroundColor = () => {
  const url = window.location.href;
  const match = url.match(
    /console\.firebase\.google\.com(?:\/u\/\d+)?\/project\/([^/]+)/
  );
  const targetElements = document.querySelectorAll(".app-bar");

  if (match?.[1]) {
    const currentProjectId = match[1];
    console.log(
      "Firebase Background Changer: Current Project ID:",
      currentProjectId
    );

    chrome.storage.sync.get(["projectColors"], (result) => {
      const storedSettings: Settings = result.projectColors || {};
      const color = storedSettings[currentProjectId];
      // Provide default empty string if color is null to avoid TS error
      const contrastColor = color ? getContrastColor(color) : "";

      if (color) {
        console.log(
          `Firebase Background Changer: Applying color ${color} (contrast: ${contrastColor}) for project ${currentProjectId}`
        );
        for (const element of targetElements) {
          if (element instanceof HTMLElement) {
            element.style.backgroundColor = color;
            const textElements = element.querySelectorAll(
              "[data-fire-popup-overlay-trigger]"
            );
            // biome-ignore lint/complexity/noForEach: NodeListOf doesn't have Symbol.iterator easily
            textElements.forEach((textEl) => {
              if (textEl instanceof HTMLElement) {
                textEl.style.color = contrastColor;
              }
            });
          }
        }
      } else {
        console.log(
          `Firebase Background Changer: No color found for project ${currentProjectId}. Resetting background and text.`
        );
        for (const element of targetElements) {
          if (element instanceof HTMLElement) {
            element.style.backgroundColor = "";
            const textElements = element.querySelectorAll(
              "[data-fire-popup-overlay-trigger]"
            );
            // biome-ignore lint/complexity/noForEach: NodeListOf doesn't have Symbol.iterator easily
            textElements.forEach((textEl) => {
              if (textEl instanceof HTMLElement) {
                textEl.style.color = ""; // Reset text color
              }
            });
          }
        }
      }
    });
  } else {
    console.log(
      "Firebase Background Changer: Not on a project page or Project ID not found. Resetting background and text."
    );
    for (const element of targetElements) {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = "";
        const textElements = element.querySelectorAll(
          "[data-fire-popup-overlay-trigger]"
        );
        // biome-ignore lint/complexity/noForEach: NodeListOf doesn't have Symbol.iterator easily
        textElements.forEach((textEl) => {
          if (textEl instanceof HTMLElement) {
            textEl.style.color = ""; // Reset text color
          }
        });
      }
    }
  }
};

// Apply color on initial load
applyBackgroundColor();

// Firebase Console is an SPA, so we need to re-apply the color on navigation changes.
const observeTitleChanges = () => {
  const titleElement = document.querySelector("title");
  if (!titleElement) {
    console.error(
      "Firebase Background Changer: Could not find <title> element to observe."
    );
    setInterval(applyBackgroundColor, 1000);
    return;
  }

  const observer = new MutationObserver((mutations) => {
    console.log(
      "Firebase Background Changer: Detected potential navigation (title changed). Re-applying background color."
    );
    applyBackgroundColor();
  });

  observer.observe(titleElement, {
    childList: true,
    subtree: true,
  });

  console.log(
    "Firebase Background Changer: Observing title for navigation changes."
  );
};

// Start observing after the initial load
requestAnimationFrame(observeTitleChanges);
