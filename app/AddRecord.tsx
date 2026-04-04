import { useNavigation } from "@react-navigation/native";
import { ArrowRight, Baby, Calendar, Ruler, Weight, X } from "lucide-react-native";
import { useState } from "react";
import {
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
import { HealthRecord, saveHealthRecord } from "./utils/storage";

export default function AddRecord() {
  const navigation = useNavigation<any>();
  const { t } = useLocalization();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = async () => {
    if (!age || !height || !weight) {
      return;
    }

    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    const bmi = weightKg / (heightM * heightM);

    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      age: parseFloat(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: parseFloat(bmi.toFixed(2)),
    };

    await saveHealthRecord(newRecord);
    navigation.navigate("Growth");
  };

  const isFormValid = age !== "" && height !== "" && weight !== "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FAFBF8]"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-white">{t("addHealthRecord")}</Text>
            <View className="flex-row items-center gap-3">
              <LanguageSelector />
              <TouchableOpacity
                onPress={() => navigation.navigate("Growth")}
                className="bg-white/20 p-2 rounded-xl"
                activeOpacity={0.8}
              >
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>
          </View>
          <Text className="text-white/90 text-base">{t("enterMeasurements")}</Text>
        </View>

        <View className="px-6 py-8">
          <View className="flex-row justify-center mb-8">
            <View className="w-32 h-32 bg-gradient-to-br from-[#EAF7F0] to-[#EAF6FB] rounded-full items-center justify-center shadow-lg">
              <Baby color="#4CAF7A" size={56} />
            </View>
          </View>

          <View className="space-y-5">
            <View className="bg-white rounded-2xl shadow-md p-5">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 bg-[#FFE8DC] rounded-xl items-center justify-center">
                  <Calendar color="#FF9F6E" size={24} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-[#2F3A3A]">{t("age")}</Text>
                  <Text className="text-sm text-[#7A8A8A]">{t("ageHint")}</Text>
                </View>
              </View>
              <TextInput
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder={t("exampleAge")}
                placeholderTextColor="#6B7280"
                className="w-full px-5 py-4 text-xl bg-gray-50 border-2 border-gray-200 rounded-xl"
              />
            </View>

            <View className="bg-white rounded-2xl shadow-md p-5">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 bg-[#EAF6FB] rounded-xl items-center justify-center">
                  <Ruler color="#7EC8E3" size={24} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-[#2F3A3A]">{t("height")}</Text>
                  <Text className="text-sm text-[#7A8A8A]">{t("heightHint")}</Text>
                </View>
              </View>
              <TextInput
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder={t("exampleHeight")}
                placeholderTextColor="#6B7280"
                className="w-full px-5 py-4 text-xl bg-gray-50 border-2 border-gray-200 rounded-xl"
              />
            </View>

            <View className="bg-white rounded-2xl shadow-md p-5">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 bg-[#EAF7F0] rounded-xl items-center justify-center">
                  <Weight color="#4CAF7A" size={24} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-[#2F3A3A]">{t("weight")}</Text>
                  <Text className="text-sm text-[#7A8A8A]">{t("weightHint")}</Text>
                </View>
              </View>
              <TextInput
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder={t("exampleWeight")}
                placeholderTextColor="#6B7280"
                className="w-full px-5 py-4 text-xl bg-gray-50 border-2 border-gray-200 rounded-xl"
              />
            </View>

            <TouchableOpacity
              disabled={!isFormValid}
              onPress={handleSubmit}
              className="w-full py-5 rounded-2xl items-center justify-center gap-3"
              style={{ backgroundColor: isFormValid ? "#4CAF7A" : "#E5E7E5" }}
              activeOpacity={isFormValid ? 0.8 : 1}
            >
              <Text
                style={{ color: isFormValid ? "#FFFFFF" : "#9CA3AF" }}
                className="text-lg font-semibold"
              >
                {t("saveRecord")}
              </Text>
              <ArrowRight color={isFormValid ? "#FFFFFF" : "#9CA3AF"} size={20} />
            </TouchableOpacity>
          </View>

          <View className="mt-6 p-4 bg-[#EAF6FB] rounded-xl">
            <Text className="text-sm text-[#7A8A8A] text-center">
              {t("dataStoredPrivate")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

