import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
const icons = {
    control: (color, size) => (
        <FontAwesome5 name="temperature-high" size={24} color="black" />
    ),
    trends: (color, size) => (
        <SimpleLineIcons name="graph" size={24} color="black" />
    )
}

export default icons;