import { PixelRatio } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const getScaledFont = (baseSize, maxScale = 1.5) => {
  // first make the size responsive to screen height
  const responsiveSize = RFValue(baseSize);

  // then apply a cap to system-wide font scaling
  const scale = Math.min(PixelRatio.getFontScale(), maxScale);

  return Math.round(responsiveSize * scale);
};

export default getScaledFont;
