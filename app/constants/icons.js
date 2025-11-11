import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Feather } from "@expo/vector-icons";

const icons = {
  control: (colour = "black", size = 24) => (
    <FontAwesome5 name="temperature-high" size={size} color={colour} />
  ),
  trends: (colour = "black", size = 24) => (
    <SimpleLineIcons name="graph" size={size} color={colour} />
  ),

  plus: (colour = "black", size = 24) => (
    <Feather name="plus" size={size} color={colour} />
  ),
  minus: (colour = "black", size = 24) => (
    <Feather name="minus" size={size} color={colour} />
  ),
};

export default icons;
