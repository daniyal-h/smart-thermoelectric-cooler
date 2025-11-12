import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

const icons = {
  control: (colour = "black", size = 24) => (
    <FontAwesome5 name="temperature-high" size={size} color={colour} />
  ),
  trends: (colour = "black", size = 24) => (
    <SimpleLineIcons name="graph" size={size} color={colour} />
  ),

  power: (colour = "black", size = 24) => (
    <AntDesign name="poweroff" size={size} color={colour} />
  ),

  plus: (colour = "black", size = 24) => (
    <Feather name="plus" size={size} color={colour} />
  ),
  minus: (colour = "black", size = 24) => (
    <Feather name="minus" size={size} color={colour} />
  ),
  auto: (colour = "black", size = 24) => (
    <MaterialCommunityIcons name="fridge-outline" size={size} color={colour} />
  ),
};

export default icons;
