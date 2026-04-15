import { useNavigation, useRoute } from "@react-navigation/native";
import { AlertCircle, ArrowLeft, Candy, CheckCircle, Droplet, Flame } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LanguageSelector } from "../components/components/language-selector";
import { useLocalization } from "../utils/LocalizationProvider";

type FoodNutritionItem = {
  foodNameOriginal?: string | null;
  foodGroup?: string | null;
  foodNameEn?: string | null;
  foodNameCn?: string | null;
  foodNameMs?: string | null;
  picUrl?: string | null;
  energyKcal?: number | null;
  sugarG?: number | null;
  proteinG?: number | null;
  fatG?: number | null;
  carbohydrateG?: number | null;
  waterG?: number | null;
  fibreG?: number | null;
  sodiumNaMg?: number | null;
};

export default function FoodResult() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t, language } = useLocalization();
  const query = route.params?.query ?? "Nasi Lemak";

  const [foodData, setFoodData] = useState<FoodNutritionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNutrition() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://jom-healthy-java.onrender.com/food/getFoodNutrition?name=${encodeURIComponent(query)}`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          throw new Error(`Server error ${response.status}`);
        }

        const payload = await response.json();
        const result = Array.isArray(payload.data) ? payload.data[0] : null;

        if (!result) {
          throw new Error("No nutrition data found.");
        }

        setFoodData(result);
      } catch (fetchError: any) {
        setError(fetchError?.message ?? "Unable to fetch nutrition data.");
      } finally {
        setLoading(false);
      }
    }

    fetchNutrition();
  }, [query]);

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

  const statusKey = foodData?.energyKcal != null
    ? foodData.energyKcal <= 150
      ? "healthy"
      : foodData.energyKcal <= 300
      ? "moderate"
      : "unhealthy"
    : "moderate";

  const config = statusConfig[statusKey as keyof typeof statusConfig];
  const Icon = config.icon;

  const nutritionInfo = [
    {
      icon: Flame,
      label: t("calories"),
      value: foodData?.energyKcal != null ? `${foodData.energyKcal} kcal` : "—",
      color: "#FF9F6E",
      bgColor: "#FFE8DC",
    },
    {
      icon: Candy,
      label: t("sugar"),
      value: foodData?.sugarG != null ? `${foodData.sugarG}g` : "—",
      color: "#F9A8D4",
      bgColor: "#FFF0F6",
    },
    {
      icon: Droplet,
      label: t("fat"),
      value: foodData?.fatG != null ? `${foodData.fatG}g` : "—",
      color: "#7EC8E3",
      bgColor: "#EAF6FB",
    },
  ];

  const tips = [
    t("foodTip1"),
    t("foodTip2"),
    t("foodTip3"),
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFBF8] px-6">
        <ActivityIndicator size="large" color="#4CAF7A" />
        <Text className="mt-4 text-base text-[#2F3A3A]">{t("loadingNutritionInfo").replace("{query}", query)}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        className="flex-1 bg-[#FAFBF8]"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg relative">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            activeOpacity={0.8}
          >
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1 text-center">{t("foodAnalysis")}</Text>
          <LanguageSelector />
        </View>

        <View className="px-6 py-6">
          <View className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <Text className="text-lg font-semibold text-[#2F3A3A] mb-4">{t("unableToLoadNutrition")}</Text>
            <Text className="text-[#7A8A8A]">{error}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg">{t("backToSearch")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const imageUri = foodData?.picUrl;

  const displayName = language === "zh" ? foodData?.foodNameCn : language === "ms" ? foodData?.foodNameMs : foodData?.foodNameEn || query;

  return (
    <ScrollView
      className="flex-1 bg-[#FAFBF8]"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg relative">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
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
            source={{ uri: imageUri }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="p-6">
            <Text className="text-2xl font-bold text-[#2F3A3A] mb-2 text-center">
              {displayName}
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
          {/* 修改后的标题栏：Nutrition Facts 与 Value per 100g 左右分布 */}
          <View className="flex-row items-baseline justify-between mb-4">
            <Text className="text-lg font-semibold text-[#2F3A3A]">
              {t("nutritionFacts")}
            </Text>
            <Text className="text-xs text-[#7A8A8A]">
              Value per 100g
            </Text>
          </View>

          <View className="flex-row justify-between gap-3 mb-3">
            {nutritionInfo.map((item, index) => (
              <View
                key={index}
                className="bg-white rounded-2xl shadow-md p-4"
                style={{ width: "31%" }}
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

          <View className="bg-white rounded-3xl shadow-md p-5">
            <View className="flex-row justify-between gap-4">
              <View className="flex-1 border-r border-[#E5E7EB] pr-4">
                <Text className="text-xs text-[#7A8A8A] mb-1">{t("protein")}</Text>
                <Text className="text-base font-semibold text-[#2F3A3A]">
                  {foodData?.proteinG != null ? `${foodData.proteinG}g` : "—"}
                </Text>
              </View>
              <View className="flex-1 pl-4">
                <Text className="text-xs text-[#7A8A8A] mb-1">{t("carbs")}</Text>
                <Text className="text-base font-semibold text-[#2F3A3A]">
                  {foodData?.carbohydrateG != null ? `${foodData.carbohydrateG}g` : "—"}
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
          onPress={() => navigation.goBack()}
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