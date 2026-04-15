import { useNavigation } from "@react-navigation/native";
import { Calendar, Ruler, Weight } from "lucide-react-native";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalization } from "../../utils/LocalizationProvider";

export default function HealthInputForm() {
  const navigation = useNavigation<any>();
  const { t } = useLocalization();

  // --- 表单独立状态 ---
  const [gender, setGender] = useState<number | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const isFormValid = birthDate !== "" && height !== "" && weight !== "" && gender !== null;

  const handleSubmit = () => {
    navigation.navigate("AddRecord", { birthDate, height, weight, gender });
  };

  return (
    <View className="px-6 pb-6 border-t border-gray-100 pt-6 bg-[#FAFBF8]">
      <View className="space-y-4">
        
        {/* 1. 性别 */}
        <View className="bg-white rounded-xl shadow-sm p-4">
          <Text className="text-sm font-semibold text-[#2F3A3A] mb-3">Gender</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => setGender(1)} className={`flex-1 py-3 rounded-xl border-2 items-center ${gender === 1 ? 'border-[#4CAF7A] bg-[#EAF7F0]' : 'border-gray-200'}`}>
              <Text className={`font-semibold ${gender === 1 ? 'text-[#4CAF7A]' : 'text-gray-500'}`}>👦 Boy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender(0)} className={`flex-1 py-3 rounded-xl border-2 items-center ${gender === 0 ? 'border-[#FF9F6E] bg-[#FFE8DC]' : 'border-gray-200'}`}>
              <Text className={`font-semibold ${gender === 0 ? 'text-[#FF9F6E]' : 'text-gray-500'}`}>👧 Girl</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. 生日 */}
        <View className="bg-white rounded-xl shadow-sm p-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 bg-[#FFE8DC] rounded-lg items-center justify-center"><Calendar color="#F97316" size={20} /></View>
            <View>
              <Text className="text-sm font-semibold text-[#2F3A3A]">Date of Birth</Text>
              <Text className="text-xs text-[#7A8A8A]">Format: YYYY-MM-DD</Text>
            </View>
          </View>
          <TextInput value={birthDate} onChangeText={setBirthDate} placeholder="e.g. 2014-06-15" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg" />
        </View>

        {/* 3. 身高 */}
        <View className="bg-white rounded-xl shadow-sm p-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 bg-[#EAF6FB] rounded-lg items-center justify-center"><Ruler color="#22BBF7" size={20} /></View>
            <View>
              <Text className="text-sm font-semibold text-[#2F3A3A]">{t("height")}</Text>
              <Text className="text-xs text-[#7A8A8A]">{t("heightHint")}</Text>
            </View>
          </View>
          <TextInput keyboardType="numeric" value={height} onChangeText={setHeight} placeholder={t("exampleHeight")} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg" />
        </View>

        {/* 4. 体重 */}
        <View className="bg-white rounded-xl shadow-sm p-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 bg-[#EAF7F0] rounded-lg items-center justify-center"><Weight color="#16A34A" size={20} /></View>
            <View>
              <Text className="text-sm font-semibold text-[#2F3A3A]">{t("weight")}</Text>
              <Text className="text-xs text-[#7A8A8A]">{t("weightHint")}</Text>
            </View>
          </View>
          <TextInput keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder={t("exampleWeight")} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg" />
        </View>

        <TouchableOpacity disabled={!isFormValid} onPress={handleSubmit} className="w-full py-5 rounded-2xl items-center" style={{ backgroundColor: isFormValid ? "#4CAF7A" : "#E5E7E5" }}>
          <Text className="text-lg font-semibold" style={{ color: isFormValid ? "#FFFFFF" : "#9CA3AF" }}>{t("checkResult")}</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}