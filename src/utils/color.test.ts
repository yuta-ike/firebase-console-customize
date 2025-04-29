import { test } from "node:test";
import assert from "node:assert"; // Still use assert for assertions
import { getContrastColor } from "./color.ts"; // Explicitly add .js extension for Node resolution

// Test cases for getContrastColor
const tests = [
  // Light backgrounds -> should return black (#000000)
  { input: "#ffffff", expected: "#000000", label: "White" },
  { input: "#FFFFFF", expected: "#000000", label: "White (uppercase)" },
  { input: "#FFF", expected: "#000000", label: "White (shorthand)" },
  { input: "#ffff00", expected: "#000000", label: "Yellow" },
  { input: "#00ff00", expected: "#000000", label: "Lime" },
  { input: "#00ffff", expected: "#000000", label: "Aqua" },
  { input: "#c0c0c0", expected: "#000000", label: "Silver" },
  { input: "#add8e6", expected: "#000000", label: "Light Blue" },

  // Dark backgrounds -> should return white (#ffffff)
  { input: "#000000", expected: "#ffffff", label: "Black" },
  { input: "#000", expected: "#ffffff", label: "Black (shorthand)" },
  { input: "#ff0000", expected: "#ffffff", label: "Red" }, // Luminance might be tricky for pure colors
  { input: "#0000ff", expected: "#ffffff", label: "Blue" },
  { input: "#800080", expected: "#ffffff", label: "Purple" },
  { input: "#008000", expected: "#ffffff", label: "Green" },
  { input: "#800000", expected: "#ffffff", label: "Maroon" },
  { input: "#000080", expected: "#ffffff", label: "Navy" },

  // Edge cases / Invalid
  { input: "#12345", expected: "#000000", label: "Invalid length" },
  { input: "invalid", expected: "#000000", label: "Invalid string" },
];

// Describe the suite of tests
test("getContrastColor", async (t) => {
  for (const { input, expected, label } of tests) {
    // Define an individual test case using t.test()
    await t.test(`should return ${expected} for ${label} (${input})`, () => {
      const result = getContrastColor(input);
      assert.strictEqual(result, expected);
    });
  }
});
