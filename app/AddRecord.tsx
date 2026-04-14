import { useNavigation, useRoute } from "@react-navigation/native";
import { AlertCircle, ArrowLeft, HeartPulse } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useLocalization } from "./utils/LocalizationProvider";

export default function AddRecord() { 
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLocalization();

  // 👉 1. 接住从 Home 首页传过来的 4 个参数！
  const { birthDate, height, weight, gender } = route.params || {};

  // 🚨 核心配置：你的 Spring Boot 服务器地址
  const BASE_URL = "http://192.168.100.237:8080"; 

  // 页面状态控制
  const [isLoading, setIsLoading] = useState(true);
  const [resultText, setResultText] = useState("");
  const [isError, setIsError] = useState(false);

  // 👉 2. 页面一加载，自动去向 Java 后端要数据！
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
      // 拼接后端 API 路由
      const url = `${BASE_URL}/api/bmi/evaluate?heightCm=${height}&weightKg=${weight}&birthDateStr=${birthDate}&gender=${gender}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      // 拿到 Java 返回的字符串结果
      const text = await response.text(); 
      setResultText(text);

    } catch (error) {
      console.error("Request to backend failed:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDisplayAge = (dob: string) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    // 处理月份借位（比如今年还没过生日，月份是负数）
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months}Months`;
    }
    return `${years}Years${months > 0 ? ` ${months}Months` : ''}`;
  };

  return (
    <View className="flex-1 bg-[#FAFBF8]">
      {/* 顶部导航栏 */}
      <View className="bg-[#4CAF7A] px-6 pt-14 pb-6 rounded-b-3xl shadow-lg flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-white/20 p-2 rounded-xl"
          activeOpacity={0.8}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Health Assessment Report</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        {/* 状态 1：正在加载中... */}
        {isLoading && (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4CAF7A" />
            <Text className="mt-4 text-[#7A8A8A] text-base font-semibold">Connecting to a medical engine to analyze data...</Text>
          </View>
        )}

        {/* 状态 2：请求失败或参数错误 */}
        {!isLoading && isError && (
          <View className="bg-[#FEF2F2] p-6 rounded-2xl items-center border border-[#FECACA] mt-10">
            <AlertCircle color="#EF4444" size={48} />
            <Text className="text-lg font-bold text-[#991B1B] mt-4">Failed to calculate!</Text>
            <Text className="text-center text-[#DC2626] mt-2 leading-relaxed">
              Unable to connect to the health server, or missing necessary parameters. Please return to the homepage and enter the information again.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mt-6 bg-[#EF4444] px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Back to revise.</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 状态 3：成功拿到 Java 后端的数据！展示报告！ */}
        {!isLoading && !isError && resultText !== "" && (
          <View className="space-y-6 mt-4">
            
            {/* 用户输入的数据回顾 */}
            <View className="flex-row justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <View className="items-center">
                <Text className="text-[#7A8A8A] text-xs mb-1">Age</Text>
                <Text className="text-[#2F3A3A] font-bold text-lg">{calculateDisplayAge(birthDate)} <Text className="text-sm font-normal">Age</Text></Text>
              </View>
              <View className="items-center">
                <Text className="text-[#7A8A8A] text-xs mb-1">Height</Text>
                <Text className="text-[#2F3A3A] font-bold text-lg">{height} <Text className="text-sm font-normal">cm</Text></Text>
              </View>
              <View className="w-[1px] bg-gray-200" />
              <View className="items-center">
                <Text className="text-[#7A8A8A] text-xs mb-1">Weight</Text>
                <Text className="text-[#2F3A3A] font-bold text-lg">{weight} <Text className="text-sm font-normal">kg</Text></Text>
              </View>
              <View className="w-[1px] bg-gray-200" />
              <View className="items-center">
                <Text className="text-[#7A8A8A] text-xs mb-1">Gender</Text>
                <Text className="text-[#2F3A3A] font-bold text-lg">{gender === 1 ? 'Male' : 'Female'}</Text>
              </View>
            </View>

            {/* 核心医疗建议卡片 */}
            <View className="bg-white rounded-3xl shadow-md overflow-hidden">
              <View className="bg-gradient-to-r from-[#EAF7F0] to-[#EAF6FB] p-6 items-center border-b border-gray-100">
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-sm mb-3">
                  <HeartPulse color="#4CAF7A" size={32} />
                </View>
                <Text className="text-xl font-bold text-[#2F3A3A]">WHO Child Growth Standard</Text>
              </View>
              
              <View className="p-6">
                {/* 💡 这里就是展示你 Java 后端返回的那段长文本的地方！ */}
                <Text className="text-[#475569] text-base leading-relaxed">
                  {resultText}
                </Text>
              </View>
            </View>

            {/* 保存记录按钮 (前端可以用来把结果存进本地历史记录) */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Growth")}
              className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center shadow-md mt-4"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold">Complete and save to your growth diary.</Text>
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>
    </View>
  );
}