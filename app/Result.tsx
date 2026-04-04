import { useNavigation, useRoute } from "@react-navigation/native";
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Apple,
    CheckCircle,
    Heart,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type HealthStatus = "healthy" | "underweight" | "overweight";

interface ChildData {
  age: string;
  height: string;
  weight: string;
}

interface StatusConfig {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
  title: string;
  description: string;
  emoji: string;
}

const statusConfigs: Record<HealthStatus, StatusConfig> = {
  healthy: {
    icon: CheckCircle,
    color: "#6BCB77",
    bgColor: "#EAF7F0",
    title: "Healthy Weight",
    description:
      "Great job! Your child is within a healthy weight range. Keep up the good nutrition and active lifestyle!",
    emoji: "🎉",
  },
  underweight: {
    icon: AlertCircle,
    color: "#FFD166",
    bgColor: "#FFF9E6",
    title: "Underweight",
    description:
      "Your child may benefit from more nutritious meals. Consult with a healthcare provider for personalized advice.",
    emoji: "💛",
  },
  overweight: {
    icon: AlertTriangle,
    color: "#FF8C8C",
    bgColor: "#FFE8E8",
    title: "Above Healthy Weight",
    description:
      "Your child may benefit from more physical activity and balanced meals. Small changes can make a big difference!",
    emoji: "🧡",
  },
};

export default function Result() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params as ChildData | undefined;
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("healthy");

  useEffect(() => {
    if (!params?.age || !params?.height || !params?.weight) {
      navigation.navigate("Check");
      return;
    }

    setChildData(params);
    const heightM = parseFloat(params.height) / 100;
    const weightKg = parseFloat(params.weight);
    const bmi = weightKg / (heightM * heightM);

    if (bmi < 14) {
      setHealthStatus("underweight");
    } else if (bmi > 18) {
      setHealthStatus("overweight");
    } else {
      setHealthStatus("healthy");
    }
  }, [navigation, params]);

  if (!childData) {
    return null;
  }

  const config: StatusConfig = statusConfigs[healthStatus];
  const Icon = config.icon;

  const recommendations = [
    {
      icon: Apple,
      title: "Eat more fruits & vegetables",
      subtitle: "5 servings per day",
    },
    {
      icon: Activity,
      title: "Stay active daily",
      subtitle: "30-60 minutes of play",
    },
    {
      icon: Heart,
      title: "Regular check-ups",
      subtitle: "Visit your pediatrician",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-[#FAFBF8]"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <Text className="text-2xl font-bold text-white mb-2">Health Result</Text>
        <Text className="text-white/90 text-base">
          Based on age {childData.age} years, height {childData.height}cm, weight {childData.weight}kg
        </Text>
      </View>

      <View className="px-6 py-8">
        <View className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <View className="flex flex-col items-center text-center mb-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4 shadow-lg"
              style={{ backgroundColor: config.bgColor }}
            >
              <Icon color={config.color} size={48} />
            </View>
            <Text className="text-5xl mb-3">{config.emoji}</Text>
            <Text className="text-2xl font-bold text-[#2F3A3A] mb-3">
              {config.title}
            </Text>
            <Text className="text-base text-[#7A8A8A] leading-relaxed">
              {config.description}
            </Text>
          </View>

          <View className="flex-row gap-2 justify-center mb-4">
            <View
              className="h-2 flex-1 rounded-full"
              style={{ backgroundColor: healthStatus === "underweight" ? "#FFD166" : "#E5E7EB" }}
            />
            <View
              className="h-2 flex-1 rounded-full"
              style={{ backgroundColor: healthStatus === "healthy" ? "#6BCB77" : "#E5E7EB" }}
            />
            <View
              className="h-2 flex-1 rounded-full"
              style={{ backgroundColor: healthStatus === "overweight" ? "#FF8C8C" : "#E5E7EB" }}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-[#2F3A3A] mb-4">What you can do:</Text>
          <View className="space-y-3">
            {recommendations.map((rec, index) => (
              <View
                key={index}
                className="bg-white rounded-2xl shadow-md p-5 flex-row items-center gap-4"
              >
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#EAF7F0" }}
                >
                  <rec.icon color="#4CAF7A" size={28} />
                </View>
                <View>
                  <Text className="font-semibold text-[#2F3A3A] text-base">{rec.title}</Text>
                  <Text className="text-[#7A8A8A] text-sm">{rec.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="space-y-3">
          <TouchableOpacity
            onPress={() => navigation.navigate("Growth")}
            className="w-full bg-[#4CAF7A] py-5 rounded-2xl items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg">Track Growth Over Time</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            className="w-full bg-white py-5 rounded-2xl items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-[#2F3A3A] font-semibold text-lg">Back to Home</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 p-4 bg-[#EAF6FB] rounded-xl">
          <Text className="text-xs text-[#7A8A8A] text-center leading-relaxed">
            ℹ️ This is a general assessment. For medical advice, please consult a healthcare professional.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

