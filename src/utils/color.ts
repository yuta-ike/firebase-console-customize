/**
 * Helper function to determine contrast color (black or white) based on background hex color.
 * Calculates luminance using the WCAG formula and returns #000000 or #ffffff.
 * @param hex - The background color in hex format (e.g., "#RRGGBB" or "#RGB").
 * @returns The contrast color ("#000000" or "#ffffff").
 */
export const getContrastColor = (hex: string): string => {
  // Create a mutable copy and remove # if present
  let localHex = hex.replace(/^#/, "");

  // Handle shorthand hex (e.g., #03F) -> #0033FF
  if (localHex.length === 3) {
    localHex = localHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Ensure hex is valid 6-digit format before parsing
  if (localHex.length !== 6) {
    console.error(
      "Invalid hex color format provided to getContrastColor:",
      hex
    );
    return "#000000"; // Return default black for invalid format
  }

  // Parse r, g, b values using Number.parseInt
  const r = Number.parseInt(localHex.substring(0, 2), 16);
  const g = Number.parseInt(localHex.substring(2, 4), 16);
  const b = Number.parseInt(localHex.substring(4, 6), 16);

  // Calculate luminance (per WCAG formula)
  // Normalize RGB values to 0-1 range
  const [normR, normG, normB] = [r / 255, g / 255, b / 255].map((c) => {
    if (c <= 0.03928) {
      return c / 12.92;
    }
    // Use ** operator instead of Math.pow
    return ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * normR + 0.7152 * normG + 0.0722 * normB;

  // Adjusted threshold for better results with typical UI colors
  return luminance > 0.4 ? "#000000" : "#ffffff";
};
