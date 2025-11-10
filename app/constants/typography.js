import getScaledFont from "../utils/fonts";
import { colours } from "./colours";

export const typography = {
  // Main titles (screen titles, key headers)
  title: {
    fontSize: getScaledFont(24, 1.4),
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    color: colours.textPrimary,
  },

  // Section headers (submodules, card headers)
  subtitle: {
    fontSize: getScaledFont(18, 1.3),
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.25,
    color: colours.textPrimary,
  },

  // Sub-section headers (labels, module sub-titles)
  subsection: {
    fontSize: getScaledFont(16, 1.3),
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.15,
    color: colours.textPrimary,
  },

  // Default text (body content, descriptions)
  body: {
    fontSize: getScaledFont(14, 1.5),
    fontFamily: "Inter_400Regular",
    lineHeight: getScaledFont(20),
    color: colours.textPrimary,
  },

  // Emphasized body text (important labels or highlighted data)
  boldBody: {
    fontSize: getScaledFont(14, 1.5),
    fontFamily: "Inter_600SemiBold",
    color: colours.textPrimary,
  },

  // Caption / supportive text (tooltips, secondary info)
  caption: {
    fontSize: getScaledFont(12, 1.3),
    fontFamily: "Inter_400Regular",
    color: colours.textSecondary,
  },

  // Buttons (consistent center-aligned text)
  button: {
    fontSize: getScaledFont(14, 1.2),
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Temperature or live numeric readings (technical displays)
  display: {
    fontSize: getScaledFont(36, 1.1),
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 1,
    color: colours.textPrimary,
  },

  // Secondary numeric displays (small readouts, set points)
  smallDisplay: {
    fontSize: getScaledFont(20, 1.2),
    fontFamily: "Rajdhani_600SemiBold",
    letterSpacing: 0.5,
  },
};
