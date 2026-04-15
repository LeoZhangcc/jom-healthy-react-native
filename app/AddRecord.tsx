import { useNavigation, useRoute } from "@react-navigation/native";
import { AlertCircle, ArrowLeft, HeartPulse } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useLocalization } from "../utils/LocalizationProvider";
import { HealthRecord, loadHealthRecords, saveHealthRecord } from "../utils/storage";

export default function AddRecord() { 
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLocalization();

  const { birthDate, height, weight, gender } = route.params || {};
  const BASE_URL = "https://jom-healthy-java.onrender.com"; 

  const [isLoading, setIsLoading] = useState(true);
  const [resultText, setResultText] = useState("");
  const [isError, setIsError] = useState(false);

  const formatAdviceText = (text: string) => {
    if (!text) return "";
    return text
      // 1. 给 "Assessment results:" 换行，加图标和空格
      .replace("Assessment results:", "\n\n📋 Assessment: ")
      // 2. 给 "- It is recommended" 换行，加建议图标
      .replace(" - It is recommended", "\n\n💡 Advice:\nIt is recommended")
      // 兼容某些没有空格的情况
      .replace("- It is recommended", "\n\n💡 Advice:\nIt is recommended");
  };

  useEffect(() => {
    if (!birthDate || !height || !weight || gender === null) {
      setIsError(true);
      setIsLoading(false);
      return;
    }
    fetchHealthEvaluation();
  }, []);

  const fetchHealthEvaluation = async () => {
    try {
      const url = `${BASE_URL}/api/bmi/evaluate?heightCm=${height}&weightKg=${weight}&birthDateStr=${birthDate}&gender=${gender}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Server response error');

      const text = await response.text(); 
      setResultText(text);
    } catch (error) {
      console.error("Request to backend failed:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalMonths = (dob: string) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    return (years * 12) + months;
  };

  const calculateDisplayAge = (dob: string) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    
    // 💡 优化：返回更短的格式，方便在一行展示 (例如 "5y 2m")
    if (years === 0) return `${months}m`;
    return `${years}y ${months > 0 ? `${months}m` : ''}`;
  };

const handleSave = async () => {
    if (!resultText) {
      Alert.alert("Wait", "Please wait for the health assessment to complete.");
      return;
    }
    
    try {
      // 🌟 1. 在保存前，先加载手机里存的所有历史记录
      const records = await loadHealthRecords();
      
      // 🌟 2. 获取今天的日期字符串 (格式: YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];

      // 🌟 3. 检查历史记录中，有没有哪一条的日期等于今天
      const hasSavedToday = records.some((record) => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === today;
      });

      // 🌟 4. 如果今天已经保存过了，弹窗拦截，并直接退回上一页！
      if (hasSavedToday) {
        Alert.alert(
          "Notice", 
          "You have already saved a record today. Please come back tomorrow to track new changes! ✨",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return; // 终止函数，不再执行后面的保存逻辑
      }

      // --- 下面是原本正常的保存逻辑 ---
      const heightInMeters = height / 100;
      const calculatedBmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      const totalMonths = calculateTotalMonths(birthDate);

      const newRecord: HealthRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        nickname: "Me", 
        ageText: calculateDisplayAge(birthDate),
        ageInMonths: totalMonths,
        height: height,
        weight: weight,
        gender: gender, 
        bmiValue: calculatedBmi, 
        adviceText: resultText, 
      };

      await saveHealthRecord(newRecord);
      
      Alert.alert(
        "Success!", 
        "Your assessment has been saved to the growth diary.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save record locally.");
    }
  };

  return (
    <View className="flex-1 bg-[#FAFBF8]">
      
      {/* 🌟 1. 参考新 UI 优化的顶部导航栏 */}
      <View className="bg-[#4CAF7A] px-6 pt-12 pb-6 rounded-b-3xl shadow-lg relative">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center absolute z-10"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            activeOpacity={0.8}
          >
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          {/* 绝对居中的标题 */}
          <Text className="text-2xl font-bold text-white flex-1 text-center">Health Report</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* 状态 1：加载中 */}
        {isLoading && (
          <View className="mt-24 items-center justify-center">
            <View className="bg-white p-6 rounded-3xl shadow-md items-center w-full">
              <ActivityIndicator size="large" color="#4CAF7A" className="mb-4" />
              <Text className="text-[#2F3A3A] text-lg font-bold mb-2">Analyzing Data</Text>
              <Text className="text-[#7A8A8A] text-sm text-center px-4">Connecting to the medical engine to evaluate growth standards...</Text>
            </View>
          </View>
        )}

        {/* 状态 2：错误 */}
        {!isLoading && isError && (
          <View className="bg-white p-8 rounded-3xl items-center shadow-xl mt-6">
            <View className="w-20 h-20 bg-[#FEF2F2] rounded-full items-center justify-center mb-4">
              <AlertCircle color="#EF4444" size={40} />
            </View>
            <Text className="text-xl font-bold text-[#991B1B] mb-2">Analysis Failed</Text>
            <Text className="text-center text-[#64748B] leading-relaxed mb-8">
              Unable to connect to the health server, or missing necessary parameters.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-full bg-[#EF4444] py-4 rounded-2xl items-center justify-center active:bg-red-600"
            >
              <Text className="text-white font-bold text-lg">Return to revise</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 状态 3：成功展示结果 */}
        {!isLoading && !isError && resultText !== "" && (
          <View>
            
            {/* 🌟 2. 完美的一行四项展示栏 (参考了卡片式的设计) */}
            <View className="bg-white rounded-3xl shadow-md p-5 mb-6 flex-row justify-between items-center">
              <View className="items-center flex-1">
                <Text className="text-[10px] text-[#9CA3AF] mb-1 font-bold uppercase tracking-wider">Age</Text>
                <Text className="text-[#2F3A3A] font-extrabold text-base">{calculateDisplayAge(birthDate)}</Text>
              </View>
              <View className="w-[1px] h-8 bg-gray-100" />
              <View className="items-center flex-1">
                <Text className="text-[10px] text-[#9CA3AF] mb-1 font-bold uppercase tracking-wider">Height</Text>
                <Text className="text-[#2F3A3A] font-extrabold text-base">{height}<Text className="text-xs font-medium text-[#7A8A8A]">cm</Text></Text>
              </View>
              <View className="w-[1px] h-8 bg-gray-100" />
              <View className="items-center flex-1">
                <Text className="text-[10px] text-[#9CA3AF] mb-1 font-bold uppercase tracking-wider">Weight</Text>
                <Text className="text-[#2F3A3A] font-extrabold text-base">{weight}<Text className="text-xs font-medium text-[#7A8A8A]">kg</Text></Text>
              </View>
              <View className="w-[1px] h-8 bg-gray-100" />
              <View className="items-center flex-1">
                <Text className="text-[10px] text-[#9CA3AF] mb-1 font-bold uppercase tracking-wider">Gender</Text>
                <Text className="text-[#2F3A3A] font-extrabold text-base">{gender === 1 ? 'Boy' : 'Girl'}</Text>
              </View>
            </View>

            {/* 🌟 3. WHO 医疗建议排版优化 */}
            <View className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
              {/* 优雅的标题区 */}
              <View className="bg-[#EAF7F0] pt-6 pb-5 px-6 items-center">
                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm mb-3">
                  <HeartPulse color="#4CAF7A" size={28} />
                </View>
                <Text className="text-xl font-extrabold text-[#2F3A3A] text-center">WHO Growth Standard</Text>
                <Text className="text-xs text-[#4CAF7A] font-bold mt-1 uppercase tracking-widest">Medical Analysis</Text>
              </View>
              
              {/* 后端文本展示区：提升了行高、字间距和文本颜色 */}
              <View className="p-6 bg-white">
                {/* 👇 注意：去掉了 text-justify，加上了 formatAdviceText 处理 */}
                <Text className="text-[#475569] text-[15px] leading-7 tracking-wide text-left">
                  {formatAdviceText(resultText)}
                </Text>
              </View>
            </View>

            {/* 🌟 4. 优化后的保存按钮：完美居中，加大圆角 */}
            <TouchableOpacity
              onPress={handleSave}
              className="w-full bg-[#4CAF7A] py-4 rounded-2xl items-center justify-center shadow-md shadow-green-200"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold tracking-wide">Save to Growth Diary</Text>
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>
    </View>
  );
}