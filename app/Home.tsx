import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  Activity,
  Baby,
  Calendar, // 👉 新增：日历图标
  Camera,
  ChevronDown,
  ChevronUp,
  ExternalLink, // 👉 新增：外部链接图标
  FileText, // 👉 新增：文件图标
  Heart, // 👉 新增：爱心图标
  Moon,
  Ruler,
  Search,
  Sparkles,
  TrendingUp, // 👉 新增：趋势图标
  Weight,
  X
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView, // 👉 新增：用于打开外部链接
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import Markdown from 'react-native-markdown-display';
import { LanguageSelector } from "./components/language-selector";
import Statistic from "./Statistic";
import { useLocalization } from "./utils/LocalizationProvider";

// --- Types ---
type FoodSuggestion = {
  label: string;
  query: string;
};

type Status = {
  statistic: string;
  sd: string;
  ageRange: string;
  prevalence: number;
};  

// --- Constants ---
const heroImage = require("../assets/images/react-logo.png");
const BASE_URL = "https://jom-healthy-java.onrender.com"; 

export default function Home() {
  const navigation = useNavigation<any>();
  const { t, language } = useLocalization();

  // --- UI States ---
  const [showCheckForm, setShowCheckForm] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- BMI / Health Form States (Upgraded) ---
  const [gender, setGender] = useState<number | null>(null); // 1: Male, 0: Female
  const [birthDate, setBirthDate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // --- Food Search States ---
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
 
  // --- AI States ---
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{food: string, confidence: number} | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);

  // --- Featured Topics States ---
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // --- Statistics Data States (From Source) ---
  const [rows, setRows] = useState<Status[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // --- Helper Functions ---
  const getLocalizedFoodName = (item: any) => {
    if (language === "zh") {
      return item.foodNameCn || item.foodNameOriginal || "Unknown food";
    }
    if (language === "ms") {
      return item.foodNameMs || item.foodNameOriginal || "Unknown food";
    }
    return item.foodNameEn || item.foodNameOriginal || "Unknown food";
  };

  const isFormValid = birthDate !== "" && height !== "" && weight !== "" && gender !== null;

  const handleSubmit = () => {
    // Upgraded: Navigates to AddRecord with more detailed profile data
    navigation.navigate("AddRecord", { birthDate, height, weight, gender });
  };

  const handleFoodSearch = () => {
  const query = foodSearchQuery.trim();
  if (!query) {
    Alert.alert(t("enterFoodName"));
    return;
  }

  useFocusEffect(
    useCallback(() => {
      setFoodSearchQuery("");
    }, [])
  );
    navigation.navigate("FoodResult", { query });
  };

  useEffect(() => {
    const query = foodSearchQuery.trim();
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);

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
        const data = Array.isArray(payload.data) ? payload.data : [];
        const trimmed = data.slice(0, 6).map((item: any) => {
          const label = getLocalizedFoodName(item);
          const backendQuery = item.foodNameCombine ||item.foodNameOriginal || item.foodNameEn || item.foodNameMs || item.foodNameCn || label;
          return {
            label,
            query: backendQuery,
          };
        });

        setSuggestions(trimmed);
        setShowSuggestions(trimmed.length > 0);
      } catch (fetchError: any) {
        setSearchError(fetchError?.message ?? t("unableToFetchSuggestions"));
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [foodSearchQuery, language]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNutrition() {
      const response = await fetch(
        "https://jom-healthy-java.onrender.com/nutritionalstatus"
      );
      const backendData = await response.json();

      const mappedRows: Status[] = backendData.map((item: any) => ({
        statistic: item.nutritional_status,
        sd: item.sociodemographics,
        ageRange: item.age_range,
        prevalence: Number(item.prevalence_percent),
      }));

      setRows(mappedRows);
      setLoading(false);
    }

    fetchNutrition();
  }, []);

  // --- Effect: Featured Topics ---
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/topics/all`);
        if (response.ok) {
          const data = await response.json();
          setAllTopics(data);
        }
      } catch (error) {
        console.error("Topics Fetch Error:", error);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) return <ActivityIndicator />;

 

  // --- Logic: Filtering Topics ---
  const reportTopics = allTopics.filter(t => t.category === 'REPORT');
  const dietTopics = allTopics.filter(t => t.category === 'DIET');
  const sportTopics = allTopics.filter(t => t.category === 'SPORT');
  const habitTopics = allTopics.filter(t => t.category === 'HABIT');
  const displayTopics = [...reportTopics, ...habitTopics, ...sportTopics, ...dietTopics];
  
  // --- Camera / Image Logic ---
  const askForPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const openImageLibraryAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(t("galleryPermissionsRequired"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    setShowCameraOptions(false);
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      analyzeFoodImage(result.assets[0].uri);
    }
  };

  const openCameraAsync = async () => {
    const hasPermission = await askForPermission();
    if (!hasPermission) {
      alert(t("cameraPermissionsRequired"));
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
      analyzeFoodImage(result.assets[0].uri);
    }
  };

  // --- AI Upload Function ---
  const getNutritionFromAI = async (detectedFoodName: string) => {
    setNutritionLoading(true);
    try {
      const response = await fetch(
        `https://jom-healthy-java.onrender.com/food/getFoodNutrition?name=${detectedFoodName}`,
        { method: "POST" }
      );
      
      if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.data && jsonResponse.data.length > 0) {
          const exactFoodItem = jsonResponse.data[0];
          setNutritionData({
            name: exactFoodItem.foodNameEn,
            calories: exactFoodItem.energyKcal,
            protein: exactFoodItem.proteinG,
            carbs: exactFoodItem.carbohydrateG,
            fat: exactFoodItem.fatG
          }); 
        } else {
          setNutritionData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching from Java backend:", error);
    } finally {
      setNutritionLoading(false);
    }
  };

  const analyzeFoodImage = async (uri: string) => {
    setAiLoading(true);
    setAiPrediction(null);
    setNutritionData(null); // Clear old nutrition data
    
    let formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri: uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      let response = await fetch('https://my-food-api-53af.onrender.com/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      let result = await response.json();
      
      if (result.success && result.predictions.length > 0) {
        const bestPrediction = result.predictions[0];
        
        setAiPrediction({
          food: bestPrediction.food,
          confidence: bestPrediction.confidence
        });

        // If confidence is high, grab the nutrition
        if (bestPrediction.confidence >= 50) {
          getNutritionFromAI(bestPrediction.food);
        }
      }
    } catch (error) {
      console.error("AI API Error:", error);
      Alert.alert("Error", "Could not connect to the AI server.");
    } finally {
      setAiLoading(false);
    }
  };

  const healthFacts = [
    {
      icon: Activity,
      title: t("healthFact1Title"),
      subtitle: t("healthFact1Subtitle"),
      color: "#F97316",
      backgroundColor: "#FFF1E0",
      type: "icon" as const,
    },
    {
      imageUri:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?fit=crop&w=400&q=80",
      title: t("healthFact2Title"),
      subtitle: t("healthFact2Subtitle"),
      backgroundColor: "#E7F6EE",
      type: "image" as const,
    },
    {
      imageUri:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?fit=crop&w=400&q=80",
      title: t("healthFact3Title"),
      subtitle: t("healthFact3Subtitle"),
      backgroundColor: "#E0F2FE",
      type: "image" as const,
    },
  ];

  const dailyTips = [
    {
      icon: Moon,
      tip: t("dailyTip1"),
      color: "#D97706",
    },
    {
      icon: Activity,
      tip: t("dailyTip2"),
      color: "#7C3AED",
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FAFBF8]"
      
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* 1. 顶部标题区 */}
        <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-2xl font-bold text-white">{t("appTitle")}</Text>
            <LanguageSelector />
          </View>
          <Text className="text-white/90 text-lg mt-3">{t("greeting")}</Text>
        </View>

        {/* 2. 搜索框区 */}
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
                {foodSearchQuery ? (
                  <TouchableOpacity
                    onPress={() => setFoodSearchQuery("")}
                    className="w-11 h-11 bg-gray-200 rounded-xl items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <X color="#6B7280" size={20} />
                  </TouchableOpacity>
                ) : null}
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
              {showSuggestions ? (
                <View className="mt-3 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                  {searchLoading ? (
                    <View className="p-4">
                      <Text className="text-sm text-[#6B7280]">{t("searching")}</Text>
                    </View>
                  ) : searchError ? (
                    <View className="p-4">
                      <Text className="text-sm text-[#EF4444]">{searchError}</Text>
                    </View>
                  ) : (
                    suggestions.map((item, index) => (
                      <TouchableOpacity
                        key={`${item.label}-${index}`}
                        onPress={() => navigation.navigate("FoodResult", { query: item.query })}
                        className="px-4 py-3 border-b border-[#E5E7EB]"
                        activeOpacity={0.8}
                      >
                        <Text className="text-base text-[#111827]">{item.label}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* 3. AI 图片识别结果区 */}
        {selectedImage ? (
          <View className="px-6 mb-6">
            <View className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <Image source={{ uri: selectedImage }} className="w-full h-56" resizeMode="cover" />
              <View className="p-4">
                <Text className="text-base font-semibold text-[#2F3A3A] mb-2">{t("selectedPhotoLabel")}</Text>
                
                {/* --- AI Results Display --- */}
                {aiLoading && (
                  <View className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-blue-600 font-medium">AI is analyzing food...</Text>
                  </View>
                )}
                
                {aiPrediction && !aiLoading && (
                  <View className={`p-4 rounded-xl mb-4 border ${aiPrediction.confidence < 50 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    
                    {/* If confidence is LESS than 50% */}
                    {aiPrediction.confidence < 50 ? (
                      <View className="items-center">
                        <Text className="text-base font-bold text-red-600 mb-1">Food not recognized 😕</Text>
                        <Text className="text-sm text-red-500 text-center">Please make sure the photo is clear and contains food.</Text>
                      </View>
                    ) : (
                    /* If confidence is 50% or HIGHER */
                      <View>
                        <Text className="text-sm text-green-700 font-medium mb-1">AI Detection Result:</Text>
                        <Text className="text-xl font-bold text-[#2F3A3A]">{aiPrediction.food}</Text>
                        <Text className="text-sm text-green-600 font-medium">{aiPrediction.confidence}% Confidence</Text>
                      </View>
                    )}

                  </View>
                )}

                {nutritionLoading && (
                  <View className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-100 flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="#F97316" />
                    <Text className="text-orange-600 font-medium">Fetching database records...</Text>
                  </View>
                )}

                {nutritionData && !nutritionLoading && (
                  <View className="p-4 bg-white rounded-xl mb-4 border border-gray-200 shadow-sm">
                    <Text className="text-sm text-[#7A8A8A] font-medium mb-3">
                      Food: <Text className="font-bold text-[#2F3A3A]">{nutritionData.name}</Text>
                    </Text>
                    
                    <View className="flex-row justify-between">
                      <View className="items-center">
                        <Text className="text-[#7A8A8A] text-xs mb-1">Calories</Text>
                        <Text className="font-bold text-orange-500">{nutritionData.calories}</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-[#7A8A8A] text-xs mb-1">Protein</Text>
                        <Text className="font-bold text-blue-500">{nutritionData.protein}g</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-[#7A8A8A] text-xs mb-1">Carbs</Text>
                        <Text className="font-bold text-green-500">{nutritionData.carbs}g</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-[#7A8A8A] text-xs mb-1">Fat</Text>
                        <Text className="font-bold text-red-500">{nutritionData.fat}g</Text>
                      </View>
                    </View>
                  </View>
                )}

                <Text className="text-sm text-[#7A8A8A] mb-3">{t("selectedPhotoHint")}</Text>
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

        {/* 4. 健康表单区 (升级版) */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <TouchableOpacity onPress={() => setShowCheckForm(!showCheckForm)} className="w-full p-6 flex-row items-center gap-4">
              <View className="w-16 h-16 bg-[#EAF7F0] rounded-2xl items-center justify-center"><Baby color="#22C55E" size={28} /></View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-[#2F3A3A] mb-1">{t("checkHealthTitle")}</Text>
                <Text className="text-[#7A8A8A] text-sm">{t("checkHealthSubtitle")}</Text>
              </View>
              {showCheckForm ? <ChevronUp color="#475569" size={24} /> : <ChevronDown color="#475569" size={24} />}
            </TouchableOpacity>

            {showCheckForm && (
              <View className="px-6 pb-6 border-t border-gray-100 pt-6 bg-[#FAFBF8]">
                <View className="space-y-4">
                  <View className="bg-white rounded-xl shadow-sm p-4">
                    <Text className="text-sm font-semibold text-[#2F3A3A] mb-3">Gender</Text>
                    <View className="flex-row gap-3">
                      <TouchableOpacity onPress={() => setGender(1)} className={`flex-1 py-3 rounded-xl border-2 items-center ${gender === 1 ? 'border-[#4CAF7A] bg-[#EAF7F0]' : 'border-gray-200'}`}><Text className={`font-semibold ${gender === 1 ? 'text-[#4CAF7A]' : 'text-gray-500'}`}>👦 Boy</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => setGender(0)} className={`flex-1 py-3 rounded-xl border-2 items-center ${gender === 0 ? 'border-[#FF9F6E] bg-[#FFE8DC]' : 'border-gray-200'}`}><Text className={`font-semibold ${gender === 0 ? 'text-[#FF9F6E]' : 'text-gray-500'}`}>👧 Girl</Text></TouchableOpacity>
                    </View>
                  </View>

                  <View className="bg-white rounded-xl shadow-sm p-4">
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="w-10 h-10 bg-[#FFE8DC] rounded-lg items-center justify-center"><Calendar color="#F97316" size={20} /></View>
                      <View><Text className="text-sm font-semibold text-[#2F3A3A]">Date of Birth</Text><Text className="text-xs text-[#7A8A8A]">Format: YYYY-MM-DD</Text></View>
                    </View>
                    <TextInput value={birthDate} onChangeText={setBirthDate} placeholder="e.g. 2014-06-15" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg" />
                  </View>

                  <View className="bg-white rounded-xl shadow-sm p-4">
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="w-10 h-10 bg-[#EAF6FB] rounded-lg items-center justify-center"><Ruler color="#22BBF7" size={20} /></View>
                      <View><Text className="text-sm font-semibold text-[#2F3A3A]">{t("height")}</Text><Text className="text-xs text-[#7A8A8A]">{t("heightHint")}</Text></View>
                    </View>
                    <TextInput keyboardType="numeric" value={height} onChangeText={setHeight} placeholder={t("exampleHeight")} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg" />
                  </View>

                  <View className="bg-white rounded-xl shadow-sm p-4">
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="w-10 h-10 bg-[#EAF7F0] rounded-lg items-center justify-center"><Weight color="#16A34A" size={20} /></View>
                      <View><Text className="text-sm font-semibold text-[#2F3A3A]">{t("weight")}</Text><Text className="text-xs text-[#7A8A8A]">{t("weightHint")}</Text></View>
                    </View>
                    <TextInput keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder={t("exampleWeight")} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg" />
                  </View>

                  <TouchableOpacity disabled={!isFormValid} onPress={handleSubmit} className="w-full py-5 rounded-2xl items-center" style={{ backgroundColor: isFormValid ? "#4CAF7A" : "#E5E7E5" }}><Text className="text-lg font-semibold" style={{ color: isFormValid ? "#FFFFFF" : "#9CA3AF" }}>{t("checkResult")}</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 5. 🌟 深度专题横向滑动区 */}
        <View className="mb-8">
          <View className="px-6 flex-row items-center gap-2 mb-4">
            <TrendingUp color="#3B82F6" size={18} />
            <Text className="text-lg font-bold text-[#2F3A3A]">Deep Insights</Text>
          </View>
          
          {topicsLoading ? (
            <ActivityIndicator size="small" color="#4CAF7A" className="py-10" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
              {displayTopics.map((topic: any) => (
                <TouchableOpacity 
                  key={topic.id} 
                  activeOpacity={0.9} 
                  onPress={() => { setSelectedTopic(topic); setShowTopicModal(true); }} 
                  className="w-64 bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100"
                >
                  {/* --- 🌟 核心新增：左上角种类标识 --- */}
                  <View className="absolute top-3 left-3 z-10 bg-black/50 px-2 py-1 rounded-lg">
                    <Text className="text-white text-[10px] font-bold uppercase">
                      {topic?.category || "INSIGHT"}
                    </Text>
                  </View>

                  <Image source={{ uri: topic.imageUrl }} className="w-full h-40" resizeMode="cover" />
                  
                  <View className="p-4">
                    <Text className="font-bold text-[#2F3A3A] text-base mb-1" numberOfLines={2}>{topic.title}</Text>
                    <Text className="text-xs text-[#7A8A8A]" numberOfLines={2}>{topic.summary}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 6. 📊 统计图表区 (来自源代码) */}
        <View className="px-6 mb-6">
          <Statistic rows={rows} />
        </View>

        {/* 7. 健康科普卡片 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Heart color="#EF4444" size={18} />
            <Text className="text-lg font-semibold text-[#2F3A3A]">{t("healthInsights")}</Text>
          </View>
          <View className="space-y-3">
            {healthFacts.map((fact, index) => (
              <View key={index} className="bg-white rounded-2xl shadow-md p-5 flex-row items-center gap-4">
                {fact.type === "icon" ? (
                  <View className="w-14 h-14 rounded-xl items-center justify-center" style={{ backgroundColor: fact.backgroundColor }}><Activity color={fact.color} size={24} /></View>
                ) : (
                  <Image source={{ uri: fact.imageUri }} className="w-14 h-14 rounded-xl" resizeMode="cover" />
                )}
                <View className="flex-1">
                  <Text className="font-semibold text-[#2F3A3A] text-base">{fact.title}</Text>
                  <Text className="text-[#7A8A8A] text-sm">{fact.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 8. 每日贴士 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Sparkles color="#F59E0B" size={18} />
            <Text className="text-lg font-semibold text-[#2F3A3A]">{t("dailyTipsTitle")}</Text>
          </View>
          <View className="space-y-3">
            {dailyTips.map((item, index) => (
              <View key={index} className="bg-white rounded-2xl shadow-md p-5 flex-row items-start gap-4">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
                  {index === 0 ? <Moon color={item.color} size={20} /> : <Activity color={item.color} size={20} />}
                </View>
                <Text className="text-[#2F3A3A] text-base flex-1 leading-relaxed pt-1.5">{item.tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 9. 底部横幅 */}
        <View className="px-6">
          <View className="bg-[#4CAF7A] rounded-2xl overflow-hidden shadow-lg">
            <Image source={heroImage} className="w-full h-40" resizeMode="cover" />
            <View className="p-5 bg-[#4CAF7A] bg-opacity-60 -mt-16">
              <Text className="text-white font-semibold text-base text-right">{t("healthyChildrenBanner")}</Text>
            </View>
          </View>
        </View>

        {/* --- Modals --- */}
        <Modal visible={showCameraOptions} transparent animationType="slide">
          <View className="flex-1 bg-black/40 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-semibold text-[#2F3A3A]">{t("chooseOption")}</Text>
                <TouchableOpacity onPress={() => setShowCameraOptions(false)}><X color="#475569" size={22} /></TouchableOpacity>
              </View>
              <TouchableOpacity onPress={openCameraAsync} className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center mb-3 flex-row justify-center gap-3"><Camera color="#FFFFFF" size={20} /><Text className="text-white font-semibold">{t("takePhoto")}</Text></TouchableOpacity>
              <TouchableOpacity onPress={openImageLibraryAsync} className="w-full border-2 border-[#4CAF7A] py-5 rounded-2xl items-center justify-center"><Text className="text-[#4CAF7A] font-semibold">{t("uploadGallery")}</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 🌟 深度专题详情 Modal (带 Markdown) */}
        <Modal visible={showTopicModal} transparent animationType="fade">
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
            {selectedTopic && (
              <View className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[85%]">
                <View className="relative w-full h-48">
                  <Image source={{ uri: selectedTopic.imageUrl }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity onPress={() => setShowTopicModal(false)} className="absolute top-4 right-4 bg-black/40 p-2 rounded-full"><X color="#FFFFFF" size={20} /></TouchableOpacity>
                </View>
                <ScrollView className="p-6">
                  <View className="flex-row items-center gap-2 mb-3"><FileText color="#4CAF7A" size={18} /><Text className="text-[#4CAF7A] font-semibold text-sm">Deep Insight</Text></View>
                  <Text className="text-2xl font-bold text-[#2F3A3A] mb-4 leading-tight">{selectedTopic.title}</Text>
                  
                  {/* 使用 Markdown 组件解析内容 */}
                  <Markdown
                    style={{
                      body: { color: '#475569', fontSize: 16, lineHeight: 24 },
                      strong: { fontWeight: 'bold', color: '#2F3A3A' },
                      ordered_list_icon: { color: '#4CAF7A', fontWeight: 'bold' }
                    }}
                  >
                    {selectedTopic.content}
                  </Markdown>
                </ScrollView>
                {selectedTopic.sourceUrl && (
                  <View className="p-6 border-t border-gray-50 bg-gray-50/50">
                    <TouchableOpacity onPress={() => Linking.openURL(selectedTopic.sourceUrl)} className="flex-row items-center justify-center gap-2 bg-white py-4 rounded-2xl border border-gray-100 shadow-sm"><ExternalLink color="#3B82F6" size={18} /><Text className="text-[#3B82F6] font-bold">Read Original</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}