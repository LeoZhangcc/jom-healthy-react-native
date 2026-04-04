import { useNavigation } from "@react-navigation/native";
import { Apple, Camera, Search, Sparkles, Upload, UtensilsCrossed } from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { LanguageSelector } from "./components/language-selector";
import { useLocalization } from "./utils/LocalizationProvider";

export default function Food() {
  const navigation = useNavigation<any>();
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState("");

  const handlePhotoUpload = () => {
    const query = searchQuery.trim() || "Nasi Lemak";
    navigation.navigate("FoodResult", { query });
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) {
      Alert.alert("Please enter a food name to search.");
      return;
    }

    navigation.navigate("FoodResult", { query });
  };

  const popularFoods = [
    { name: "Nasi Lemak", emoji: "🍛", color: "#FFE8DC" },
    { name: "Roti Canai", emoji: "🫓", color: "#EAF6FB" },
    { name: "Banana", emoji: "🍌", color: "#FFF9E6" },
    { name: "Apple", emoji: "🍎", color: "#FFE8E8" },
    { name: "Milo", emoji: "🥤", color: "#EAF7F0" },
    { name: "Chicken Rice", emoji: "🍗", color: "#EAF6FB" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FAFBF8]"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <UtensilsCrossed color="#FFFFFF" size={26} />
              <Text className="text-2xl font-bold text-white">{t("foodTitle")}</Text>
            </View>
            <LanguageSelector />
          </View>
          <Text className="text-white/95 text-base">{t("checkNutrition")}</Text>
        </View>

        <View className="px-6 py-8">
          <View className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <View className="items-center text-center">
              <View className="w-32 h-32 rounded-full items-center justify-center mb-5 shadow-lg" style={{ backgroundColor: "#EAF7F0" }}>
                <Camera color="#4CAF7A" size={40} />
              </View>
              <Text className="text-xl font-semibold text-[#2F3A3A] mb-2">{t("takePhotoTitle")}</Text>
              <Text className="text-[#7A8A8A] mb-6 leading-relaxed text-center">
                {t("takePhotoSubtitle")}
              </Text>
              <TouchableOpacity
                onPress={handlePhotoUpload}
                className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center justify-center"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-3">
                  <Upload color="#FFFFFF" size={20} />
                  <Text className="text-white font-semibold text-lg">{t("uploadPhoto")}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-sm text-[#7A8A8A] font-medium">{t("orLabel")}</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Search color="#4CAF7A" size={18} />
              <Text className="font-semibold text-[#2F3A3A]">{t("searchFood")}</Text>
            </View>
            <View className="relative">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="e.g. Nasi Lemak"
                placeholderTextColor="#6B7280"
                className="w-full px-5 py-4 pr-12 text-base bg-gray-50 border-2 border-gray-200 rounded-xl"
              />
              <TouchableOpacity
                onPress={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#4CAF7A] rounded-lg items-center justify-center"
                activeOpacity={0.8}
              >
                <Search color="#FFFFFF" size={18} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Sparkles color="#FFD166" size={20} />
              <Text className="text-lg font-semibold text-[#2F3A3A]">{t("popularFoods")}</Text>
            </View>
            <View className="flex-row flex-wrap justify-between">
              {popularFoods.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate("FoodResult", { query: food.name })}
                  className="bg-white rounded-2xl shadow-md p-5 mb-3"
                  style={{ width: "48%" }}
                  activeOpacity={0.85}
                >
                  <View
                    className="w-14 h-14 rounded-xl items-center justify-center mb-3 mx-auto shadow-sm"
                    style={{ backgroundColor: food.color }}
                  >
                    <Text className="text-3xl">{food.emoji}</Text>
                  </View>
                  <Text className="text-sm font-medium text-[#2F3A3A] text-center">{food.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-[#EAF7F0] rounded-2xl p-5">
            <View className="flex-row gap-3 items-start">
              <Apple color="#4CAF7A" size={18} />
              <Text className="text-sm text-[#2F3A3A] leading-relaxed">
                {t("snapSearchInfo")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

