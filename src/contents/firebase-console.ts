import type { PlasmoCSConfig } from "plasmo";

// Define the type for the stored settings
type Settings = {
  [projectId: string]: string;
};

// Configure the content script to run on Firebase Console project pages
export const config: PlasmoCSConfig = {
  matches: ["https://console.firebase.google.com/project/*"],
};

console.log("Firebase Background Changer: Content script loaded.");

// Function to apply background color
const applyBackgroundColor = () => {
  const url = window.location.href;
  // Updated regex to handle optional /u/<number>/ segment
  const match = url.match(
    /console\.firebase\.google\.com(?:\/u\/\d+)?\/project\/([^/]+)/
  );
  const targetElements = document.querySelectorAll(".app-bar"); // Target elements with class 'app-bar'

  if (match?.[1]) {
    // Changed to optional chaining
    const currentProjectId = match[1];
    console.log(
      "Firebase Background Changer: Current Project ID:",
      currentProjectId
    );

    chrome.storage.sync.get(["projectColors"], (result) => {
      const storedSettings: Settings = result.projectColors || {};
      const color = storedSettings[currentProjectId];

      if (color) {
        console.log(
          `Firebase Background Changer: Applying color ${color} for project ${currentProjectId}`
        );
        // Apply to all elements with class 'app-bar'
        for (const element of targetElements) {
          if (element instanceof HTMLElement) {
            // Type check for safety
            element.style.backgroundColor = color;
          }
        }
      } else {
        console.log(
          `Firebase Background Changer: No color found for project ${currentProjectId}. Resetting background.`
        );
        // Reset background for target elements
        for (const element of targetElements) {
          if (element instanceof HTMLElement) {
            element.style.backgroundColor = ""; // Reset to default
          }
        }
      }
    });
  } else {
    console.log(
      "Firebase Background Changer: Not on a project page or Project ID not found. Resetting background."
    );
    // Reset background for target elements
    for (const element of targetElements) {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = "";
      }
    }
  }
};

// Apply color on initial load
applyBackgroundColor();

// Firebase Console is an SPA, so we need to re-apply the color on navigation changes.
// Using MutationObserver to detect URL changes (or changes in a key element).
// A simple approach is to observe the <title> element, which often changes during SPA navigation.
const observeTitleChanges = () => {
  const titleElement = document.querySelector("title");
  if (!titleElement) {
    console.error(
      "Firebase Background Changer: Could not find <title> element to observe."
    );
    // Fallback: Use setInterval as a less efficient alternative if title observation fails
    setInterval(applyBackgroundColor, 1000); // Check every second
    return;
  }

  const observer = new MutationObserver((mutations) => {
    // Check if the URL likely changed by observing title changes
    console.log(
      "Firebase Background Changer: Detected potential navigation (title changed). Re-applying background color."
    );
    applyBackgroundColor();
  });

  observer.observe(titleElement, {
    childList: true, // Observe changes to the title text node
    subtree: true, // Observe changes within the title element
  });

  console.log(
    "Firebase Background Changer: Observing title for navigation changes."
  );
};

// Start observing after the initial load
// Use requestAnimationFrame to ensure the observer starts after the initial rendering cycle
requestAnimationFrame(observeTitleChanges);

// Optional: Listen for hash changes as well, though title observation might be sufficient
// window.addEventListener('hashchange', applyBackgroundColor);
