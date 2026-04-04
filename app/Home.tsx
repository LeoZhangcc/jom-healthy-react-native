import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
    Activity,
    Baby,
    Camera,
    ChevronDown,
    ChevronUp,
    Heart,
    Moon,
    Ruler,
    Search,
    Sparkles,
    Weight,
    X
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { LanguageSelector } from "./components/language-selector";
import { useLocalization } from "./utils/LocalizationProvider";

const heroImage = require("../assets/images/react-logo.png");

export default function Home() {
  const navigation = useNavigation<any>();
  const { t } = useLocalization();
  const [showCheckForm, setShowCheckForm] = useState(false);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isFormValid = age !== "" && height !== "" && weight !== "";

  const handleSubmit = () => {
    navigation.navigate("Result", { age, height, weight });
  };

  const handleFoodSearch = () => {
    const query = foodSearchQuery.trim();
    if (!query) {
      Alert.alert("Please enter a food name to search.");
      return;
    }

    navigation.navigate("FoodResult", { query });
  };

  const askForPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const openCameraAsync = async () => {
    const hasPermission = await askForPermission();
    if (!hasPermission) {
      alert("Camera permissions are required to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    setShowCameraOptions(false);
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openImageLibraryAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    setShowCameraOptions(false);
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const healthFacts = [
    {
      icon: Activity,
      title: "1 in 5 children",
      subtitle: "In Malaysia are overweight",
      color: "#F97316",
      backgroundColor: "#FFF1E0",
      type: "icon" as const,
    },
    {
      imageUri:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?fit=crop&w=400&q=80",
      title: "Balanced nutrition",
      subtitle: "Helps brain development",
      backgroundColor: "#E7F6EE",
      type: "image" as const,
    },
    {
      imageUri:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?fit=crop&w=400&q=80",
      title: "Hydration is key",
      subtitle: "6-8 glasses of water daily",
      backgroundColor: "#E0F2FE",
      type: "image" as const,
    },
  ];

  const dailyTips = [
    {
      icon: Moon,
      tip: "Encourage 30 minutes of outdoor play today",
      color: "#D97706",
    },
    {
      icon: Activity,
      tip: "Limit screen time to 2 hours per day",
      color: "#7C3AED",
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FAFBF8]"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-2xl font-bold text-white">{t("appTitle")}</Text>
            <LanguageSelector />
          </View>
          <Text className="text-white/90 text-lg mt-3">{t("greeting")}</Text>
        </View>

        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <View className="px-4 py-4">
              <View className="flex-row items-center gap-3">
                <Search color="#7A8A8A" size={18} />
                <TextInput
                  value={foodSearchQuery}
                  onChangeText={setFoodSearchQuery}
                  placeholder={t("searchPlaceholder")}
                  className="flex-1 text-base py-3"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowCameraOptions(true)}
                  className="w-11 h-11 bg-[#4CAF7A] rounded-xl items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Camera color="#FFFFFF" size={20} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleFoodSearch}
                className="mt-4 bg-[#4CAF7A] rounded-2xl py-4 items-center justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">{t("searchFood")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {selectedImage ? (
          <View className="px-6 mb-6">
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <Image source={{ uri: selectedImage }} className="w-full h-56" resizeMode="cover" />
              <View className="p-4">
                <Text className="text-base font-semibold text-[#2F3A3A] mb-2">{t("selectedPhotoLabel")}</Text>
                <Text className="text-sm text-[#7A8A8A] mb-3">You can retake or upload a different photo.</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setShowCameraOptions(true)}
                    className="flex-1 bg-[#4CAF7A] py-3 rounded-2xl items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-semibold">{t("retake")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    className="flex-1 border border-[#D1D5DB] py-3 rounded-2xl items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Text className="text-[#475569] font-semibold">{t("remove")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <Modal visible={showCameraOptions} transparent animationType="slide">
          <View className="flex-1 bg-black/40 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-semibold text-[#2F3A3A]">{t("chooseOption")}</Text>
                <TouchableOpacity onPress={() => setShowCameraOptions(false)}>
                  <X color="#475569" size={22} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={openCameraAsync}
                className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center justify-center mb-3"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-3">
                  <Camera color="#FFFFFF" size={20} />
                  <Text className="text-white font-semibold">{t("takePhoto")}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openImageLibraryAsync}
                className="w-full border-2 border-[#4CAF7A] py-5 rounded-2xl items-center justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-[#4CAF7A] font-semibold">{t("uploadGallery")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      <View className="px-6 -mt-6 mb-6">
        <View className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <TouchableOpacity
            onPress={() => setShowCheckForm(!showCheckForm)}
            className="w-full p-6 flex-row items-center gap-4"
            activeOpacity={0.9}
          >
            <View className="w-16 h-16 bg-[#EAF7F0] rounded-2xl items-center justify-center">
              <Baby color="#22C55E" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-[#2F3A3A] mb-1">{t("checkHealthTitle")}</Text>
              <Text className="text-[#7A8A8A] text-sm">{t("checkHealthSubtitle")}</Text>
            </View>
            {showCheckForm ? (
              <ChevronUp color="#475569" size={24} />
            ) : (
              <ChevronDown color="#475569" size={24} />
            )}
          </TouchableOpacity>

          {showCheckForm && (
            <View className="px-6 pb-6 border-t border-gray-100 pt-6 bg-[#FAFBF8]">
              <View className="space-y-4">
                <View className="bg-white rounded-xl shadow-sm p-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 bg-[#FFE8DC] rounded-lg items-center justify-center">
                      <Baby color="#F97316" size={20} />
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-[#2F3A3A]">Age</Text>
                      <Text className="text-xs text-[#7A8A8A]">In years</Text>
                    </View>
                  </View>
                  <TextInput
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    placeholder="e.g. 5"
                    placeholderTextColor="#6B7280"
                    className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-lg"
                  />
                </View>

                <View className="bg-white rounded-xl shadow-sm p-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 bg-[#EAF6FB] rounded-lg items-center justify-center">
                      <Ruler color="#22BBF7" size={20} />
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-[#2F3A3A]">Height</Text>
                      <Text className="text-xs text-[#7A8A8A]">In centimeters (cm)</Text>
                    </View>
                  </View>
                  <TextInput
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                    placeholder="e.g. 110"
                    placeholderTextColor="#6B7280"
                    className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-lg"
                  />
                </View>

                <View className="bg-white rounded-xl shadow-sm p-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 bg-[#EAF7F0] rounded-lg items-center justify-center">
                      <Weight color="#16A34A" size={20} />
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-[#2F3A3A]">Weight</Text>
                      <Text className="text-xs text-[#7A8A8A]">In kilograms (kg)</Text>
                    </View>
                  </View>
                  <TextInput
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="e.g. 18"
                    placeholderTextColor="#6B7280"
                    className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-lg"
                  />
                </View>

                <TouchableOpacity
                  disabled={!isFormValid}
                  onPress={handleSubmit}
                  className="w-full py-5 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: isFormValid ? "#4CAF7A" : "#E5E7E5" }}
                  activeOpacity={0.8}
                >
                  <Text className="text-lg font-semibold" style={{ color: isFormValid ? "#FFFFFF" : "#9CA3AF" }}>
                    Check Result
                  </Text>
                </TouchableOpacity>

                <View className="mt-4 p-3 bg-[#EAF6FB] rounded-lg">
                  <Text className="text-xs text-[#7A8A8A] text-center">💡 All measurements are kept private</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className="px-6 mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <Heart color="#EF4444" size={18} />
          <Text className="text-lg font-semibold text-[#2F3A3A]">Health Insights</Text>
        </View>
        <View className="space-y-3">
          {healthFacts.map((fact, index) => (
            <View key={index} className="bg-white rounded-2xl shadow-md p-5 flex-row items-center gap-4">
              {fact.type === "icon" ? (
                <View className="w-14 h-14 rounded-xl items-center justify-center" style={{ backgroundColor: fact.backgroundColor }}>
                  <fact.icon color={fact.color} size={24} />
                </View>
              ) : (
                <Image
                  source={{ uri: fact.imageUri }}
                  className="w-14 h-14 rounded-xl"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1">
                <Text className="font-semibold text-[#2F3A3A] text-base">{fact.title}</Text>
                <Text className="text-[#7A8A8A] text-sm">{fact.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="px-6 mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <Sparkles color="#F59E0B" size={18} />
          <Text className="text-lg font-semibold text-[#2F3A3A]">Daily Tips for Parents</Text>
        </View>
        <View className="space-y-3">
          {dailyTips.map((item, index) => (
            <View key={index} className="bg-white rounded-2xl shadow-md p-5 flex-row items-start gap-4">
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
                <item.icon color={item.color} size={20} />
              </View>
              <Text className="text-[#2F3A3A] text-base flex-1 leading-relaxed pt-1.5">{item.tip}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="px-6">
        <View className="bg-[#4CAF7A] rounded-2xl overflow-hidden shadow-lg">
          <Image source={heroImage} className="w-full h-40" resizeMode="cover" />
          <View className="p-5 bg-[#4CAF7A] bg-opacity-60 -mt-16">
            <Text className="text-white font-semibold text-base text-right">Healthy children, Happy families!</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

