import { useNavigation } from "@react-navigation/native";
import { ArrowRight, Baby, Ruler, Weight } from "lucide-react-native";
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

export default function Check() {
  const navigation = useNavigation<any>();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = () => {
    navigation.navigate("Result", { age, height, weight });
  };

  const isFormValid = age !== "" && height !== "" && weight !== "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FAFBF8]"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <Text className="text-2xl font-bold text-white mb-2">Health Check</Text>
          <Text className="text-white/90 text-base">
            Enter your child&apos;s details for a quick health assessment
          </Text>
        </View>

        <View className="px-6 py-8">
          <View className="flex-row justify-center mb-8">
            <View className="w-32 h-32 bg-[#D9F7E0] rounded-full items-center justify-center shadow-lg">
              <Baby color="#16A34A" size={56} />
            </View>
          </View>

          <View className="space-y-5">
            <View className="bg-white rounded-2xl shadow-md p-5">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center">
                  <Baby color="#7C3AED" size={24} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">Age</Text>
                  <Text className="text-sm text-gray-500">In years</Text>
                </View>
              </View>
              <TextInput
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 5"
                className="w-full px-5 py-4 text-xl bg-gray-50 border-2 border-gray-200 rounded-xl"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View className="bg-white rounded-2xl shadow-md p-5">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
                  <Ruler color="#2563EB" size={24} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">Height</Text>
                  <Text className="text-sm text-gray-500">In centimeters (cm)</Text>
                </View>
              </View>
              <TextInput
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="e.g. 110"
                className="w-full px-5 py-4 text-xl bg-gray-50 border-2 border-gray-200 rounded-xl"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View className="bg-white rounded-2xl shadow-md p-5">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center">
                  <Weight color="#16A34A" size={24} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">Weight</Text>
                  <Text className="text-sm text-gray-500">In kilograms (kg)</Text>
                </View>
              </View>
              <TextInput
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 18"
                className="w-full px-5 py-4 text-xl bg-gray-50 border-2 border-gray-200 rounded-xl"
                placeholderTextColor="#6B7280"
              />
            </View>

            <TouchableOpacity
              disabled={!isFormValid}
              onPress={handleSubmit}
              className="w-full py-5 rounded-2xl flex-row items-center justify-center gap-3"
              style={{ backgroundColor: isFormValid ? "#4CAF7A" : "#E5E7E5" }}
              activeOpacity={0.8}
            >
              <Text className="text-lg font-semibold" style={{ color: isFormValid ? "#FFFFFF" : "#9CA3AF" }}>
                Check Result
              </Text>
              <ArrowRight color={isFormValid ? "#FFFFFF" : "#9CA3AF"} size={20} />
            </TouchableOpacity>
          </View>

          <View className="mt-6 p-4 bg-blue-50 rounded-xl">
            <Text className="text-sm text-gray-600 text-center">
              💡 All measurements are kept private and used only for this assessment
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

