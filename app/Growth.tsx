import { useNavigation } from "@react-navigation/native";
import { Activity, Info, Plus, Ruler, TrendingUp, Weight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HealthRecord, loadHealthRecords } from "./utils/storage";

type BMIStatus = "underweight" | "healthy" | "overweight";

function getBMIStatus(bmi: number): BMIStatus {
  if (bmi < 14) return "underweight";
  if (bmi > 18) return "overweight";
  return "healthy";
}

const statusConfigs = {
  underweight: {
    title: "Underweight",
    color: "#FFD166",
    backgroundColor: "#FFF9E6",
    emoji: "💛",
    description: "Your child may need more balanced meals and support from a pediatrician.",
  },
  healthy: {
    title: "Growing Well",
    color: "#6BCB77",
    backgroundColor: "#EAF7F0",
    emoji: "🎉",
    description: "Your child's growth is healthy. Keep supporting daily activity and nutrition.",
  },
  overweight: {
    title: "Above Healthy Weight",
    color: "#FF8C8C",
    backgroundColor: "#FFE8E8",
    emoji: "🧡",
    description: "Encourage balanced meals and active play to support healthy growth.",
  },
};

export default function Growth() {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthRecords().then((storedRecords) => {
      setRecords(storedRecords);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAFBF8] items-center justify-center">
        <ActivityIndicator size="large" color="#4CAF7A" />
      </View>
    );
  }

  const hasData = records.length > 0;

  if (!hasData) {
    return (
      <ScrollView className="flex-1 bg-[#FAFBF8]" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <View className="flex-row items-center gap-2 mb-2">
            <TrendingUp color="#FFFFFF" size={24} />
            <Text className="text-2xl font-bold text-white">Growth</Text>
          </View>
          <Text className="text-white/90 text-base">Track your child&apos;s health journey</Text>
        </View>

        <View className="px-6 py-12 items-center">
          <View className="w-full max-w-sm mb-8 rounded-3xl overflow-hidden shadow-lg bg-white p-6">
            <Text className="text-5xl mb-4 text-center">📊</Text>
            <Text className="text-2xl font-bold text-[#2F3A3A] mb-3 text-center">No data yet</Text>
            <Text className="text-lg text-[#7A8A8A] leading-relaxed text-center">
              Let&apos;s start your child&apos;s health journey!
            </Text>
            <Text className="text-base text-[#7A8A8A] mt-2 text-center">
              Track growth, monitor BMI, and get insights
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("AddRecord")}
            className="w-full max-w-sm bg-[#4CAF7A] py-5 rounded-2xl items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg">Enter Child Details</Text>
          </TouchableOpacity>

          <View className="mt-8 bg-[#EAF6FB] rounded-2xl p-5 w-full max-w-sm">
            <View className="flex-row gap-3">
              <Info color="#7EC8E3" size={18} />
              <Text className="text-sm text-[#2F3A3A] leading-relaxed">
                We&apos;ll help you track height, weight, and BMI over time with easy-to-understand summaries.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  const latestRecord = records[records.length - 1];
  const status = getBMIStatus(latestRecord.bmi);
  const config = statusConfigs[status];

  return (
    <ScrollView className="flex-1 bg-[#FAFBF8]" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <TrendingUp color="#FFFFFF" size={24} />
            <Text className="text-2xl font-bold text-white">Growth</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddRecord")}
            className="bg-white/20 px-4 py-2 rounded-xl items-center justify-center"
            activeOpacity={0.8}
          >
            <Plus color="#FFFFFF" size={18} />
          </TouchableOpacity>
        </View>
        <Text className="text-white/90 text-base">Your child&apos;s health overview</Text>
      </View>

      <View className="px-6 py-6">
        <View className="rounded-2xl p-6 mb-6 shadow-lg" style={{ backgroundColor: config.backgroundColor }}>
          <View className="flex-row items-start gap-3">
            <Text className="text-4xl">{config.emoji}</Text>
            <View className="flex-1">
              <Text className="text-white font-bold text-xl mb-1">{config.title}</Text>
              <Text className="text-white/95 text-sm mb-3">{config.description}</Text>
              <View className="rounded-xl px-4 py-2 mt-2" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <View className="flex-row items-center gap-2">
                  <Activity color="#FFFFFF" size={18} />
                  <Text className="text-white font-semibold">BMI: {latestRecord.bmi.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="bg-white rounded-2xl shadow-md p-4 mb-3" style={{ width: "32%" }}>
            <View className="w-10 h-10 bg-[#EAF6FB] rounded-xl items-center justify-center mb-3">
              <Ruler color="#7EC8E3" size={20} />
            </View>
            <Text className="text-xs text-[#7A8A8A] text-center mb-1">Height</Text>
            <Text className="text-base font-bold text-[#2F3A3A] text-center">{latestRecord.height} cm</Text>
          </View>
          <View className="bg-white rounded-2xl shadow-md p-4 mb-3" style={{ width: "32%" }}>
            <View className="w-10 h-10 bg-[#EAF7F0] rounded-xl items-center justify-center mb-3">
              <Weight color="#4CAF7A" size={20} />
            </View>
            <Text className="text-xs text-[#7A8A8A] text-center mb-1">Weight</Text>
            <Text className="text-base font-bold text-[#2F3A3A] text-center">{latestRecord.weight} kg</Text>
          </View>
          <View className="bg-white rounded-2xl shadow-md p-4 mb-3" style={{ width: "32%" }}>
            <View className="w-10 h-10 bg-[#FFE8DC] rounded-xl items-center justify-center mb-3">
              <Activity color="#FF9F6E" size={20} />
            </View>
            <Text className="text-xs text-[#7A8A8A] text-center mb-1">BMI</Text>
            <Text className="text-base font-bold text-[#2F3A3A] text-center">{latestRecord.bmi.toFixed(1)}</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Ruler color="#7EC8E3" size={20} />
            <Text className="font-semibold text-[#2F3A3A]">Height History</Text>
          </View>
          {records.map((record: HealthRecord) => (
            <View key={record.id} className="mb-3 rounded-2xl border border-gray-200 p-4 bg-[#FAFBF8]">
              <Text className="text-sm text-[#7A8A8A] mb-1">{new Date(record.date).toLocaleDateString()}</Text>
              <Text className="text-base font-semibold text-[#2F3A3A]">Height: {record.height} cm</Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Weight color="#4CAF7A" size={20} />
            <Text className="font-semibold text-[#2F3A3A]">Weight History</Text>
          </View>
          {records.map((record: HealthRecord) => (
            <View key={record.id} className="mb-3 rounded-2xl border border-gray-200 p-4 bg-[#FAFBF8]">
              <Text className="text-sm text-[#7A8A8A] mb-1">{new Date(record.date).toLocaleDateString()}</Text>
              <Text className="text-base font-semibold text-[#2F3A3A]">Weight: {record.weight} kg</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddRecord")}
          className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center justify-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">Add New Record</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

