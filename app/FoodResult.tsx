import { useNavigation } from "@react-navigation/native";
import { AlertCircle, ArrowLeft, Candy, CheckCircle, Droplet, Flame } from "lucide-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LanguageSelector } from "./components/language-selector";
import { useLocalization } from "./utils/LocalizationProvider";

export default function FoodResult() {
  const navigation = useNavigation<any>();
  const { t } = useLocalization();

  const foodData = {
    name: "Nasi Lemak",
    image:
      "https://images.unsplash.com/photo-1638328740227-1c4b1627614d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMG51dHJpdGlvbiUyMGNvbG9yZnVsfGVufDF8fHx8MTc3NTAxNjM5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "moderate" as const,
    nutrition: {
      calories: 420,
      sugar: 8,
      fat: 22,
      protein: 12,
      carbs: 45,
    },
  };

  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: "#6BCB77",
      bgColor: "#EAF7F0",
      label: t("healthyChoice"),
      emoji: "✅",
      description: t("nutritiousDescription"),
    },
    moderate: {
      icon: AlertCircle,
      color: "#FFD166",
      bgColor: "#FFF9E6",
      label: t("moderate"),
      emoji: "⚠️",
      description: t("moderateDescription"),
    },
    unhealthy: {
      icon: AlertCircle,
      color: "#FF8C8C",
      bgColor: "#FFE8E8",
      label: t("highSugarFat"),
      emoji: "❌",
      description: t("unhealthyDescription"),
    },
  };

  const config = statusConfig[foodData.status];
  const Icon = config.icon;

  const nutritionInfo = [
    {
      icon: Flame,
      label: "Calories",
      value: `${foodData.nutrition.calories} kcal`,
      color: "#FF9F6E",
      bgColor: "#FFE8DC",
    },
    {
      icon: Candy,
      label: "Sugar",
      value: `${foodData.nutrition.sugar}g`,
      color: "#FF8C8C",
      bgColor: "#FFE8E8",
    },
    {
      icon: Droplet,
      label: "Fat",
      value: `${foodData.nutrition.fat}g`,
      color: "#7EC8E3",
      bgColor: "#EAF6FB",
    },
  ];

  const tips = [
    "Pair with fresh vegetables for more nutrients",
    "Control portion size for children",
    "Choose grilled over fried when possible",
  ];

  return (
    <ScrollView
      className="flex-1 bg-[#FAFBF8]"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg relative">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            activeOpacity={0.8}
          >
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1 text-center">{t("foodAnalysis")}</Text>
          <LanguageSelector />
        </View>
      </View>

      <View className="px-6 py-6">
        <View className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <Image
            source={{ uri: foodData.image }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="p-6">
            <Text className="text-2xl font-bold text-[#2F3A3A] mb-2 text-center">
              {foodData.name}
            </Text>
          </View>
        </View>

        <View
          className="rounded-2xl p-6 mb-6 shadow-md"
          style={{ backgroundColor: config.bgColor }}
        >
          <View className="flex-row items-center gap-3 mb-3">
            <Icon color={config.color} size={24} />
            <Text className="font-semibold text-lg" style={{ color: config.color }}>
              {config.label}
            </Text>
            <Text className="text-2xl ml-auto">{config.emoji}</Text>
          </View>
          <Text className="text-[#2F3A3A] text-sm">{config.description}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-[#2F3A3A] mb-4">{t("nutritionFacts")}</Text>
          <View className="flex-row flex-wrap justify-between gap-3 mb-3">
            {nutritionInfo.map((item, index) => (
              <View
                key={index}
                className="bg-white rounded-2xl shadow-md p-4"
                style={{ width: "48%" }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mb-3 mx-auto"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <item.icon color={item.color} size={20} />
                </View>
                <Text className="text-xs text-[#7A8A8A] text-center mb-1">{item.label}</Text>
                <Text className="text-sm font-semibold text-[#2F3A3A] text-center">{item.value}</Text>
              </View>
            ))}
          </View>

          <View className="bg-white rounded-2xl shadow-md p-5">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-[#7A8A8A] mb-1">Protein</Text>
                <Text className="text-base font-semibold text-[#2F3A3A]">
                  {foodData.nutrition.protein}g
                </Text>
              </View>
              <View>
                <Text className="text-xs text-[#7A8A8A] mb-1">Carbs</Text>
                <Text className="text-base font-semibold text-[#2F3A3A]">
                  {foodData.nutrition.carbs}g
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <Text className="font-semibold text-[#2F3A3A] mb-4">{t("tipsForParents")}</Text>
          {tips.map((tip, index) => (
            <View key={index} className="flex-row items-start gap-3 mb-3">
              <View className="w-6 h-6 bg-[#EAF7F0] rounded-full items-center justify-center">
                <Text className="text-[#4CAF7A] text-xs font-bold">{index + 1}</Text>
              </View>
              <Text className="text-sm text-[#2F3A3A] flex-1">{tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center justify-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">{t("checkAnotherFood")}</Text>
        </TouchableOpacity>

        <View className="mt-6 p-4 bg-[#EAF6FB] rounded-xl">
          <Text className="text-xs text-[#7A8A8A] text-center leading-relaxed">
            {t("nutritionDisclaimer")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

