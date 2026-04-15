import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  AlertCircle,
  ChevronRight,
  Download,
  Plus,
  TrendingUp,
  Upload
} from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

// 💡 关键修改 1：使用 /legacy 路径避开新版 Expo 的运行崩溃问题
import * as DocumentPicker from 'expo-document-picker';
import { documentDirectory, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { LanguageSelector } from "./components/language-selector";
import { useLocalization } from "./utils/LocalizationProvider";
import { HealthRecord, loadHealthRecords, saveHealthRecord } from "./utils/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// 💡 关键修改 2：已更新为你的 Render 云端地址
const BASE_URL = "https://jom-healthy-java.onrender.com";

export default function Growth() {
  const navigation = useNavigation<any>();
  const { t } = useLocalization();
  const scrollRef = useRef<any>(null);

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [whoData, setWhoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"MONTH" | "YEAR">("MONTH");
  const [showHint, setShowHint] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [viewType])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const stored = await loadHealthRecords();
      const sortedRecords = stored.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setRecords(sortedRecords);

      const gender = sortedRecords.length > 0 ? sortedRecords[0].gender : 1;
      const response = await fetch(`${BASE_URL}/api/bmi/who-standards?type=${viewType}&gender=${gender}`);
      const data = await response.json();
      setWhoData(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💡 关键修改 3：导出逻辑，使用解构后的 legacy 函数
  const handleExport = async () => {
    try {
      if (records.length === 0) {
        Alert.alert("No Data", "There are no records to export.");
        return;
      }
      // 直接使用从 /legacy 导入的变量
      const fileUri = documentDirectory + "bmi_health_backup.json";
      await writeAsStringAsync(fileUri, JSON.stringify(records));
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error(error);
      Alert.alert("Export Failed", "Could not create backup file.");
    }
  };

  // 💡 关键修改 4：导入逻辑，包含格式校验和数据刷入
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!result.canceled && result.assets) {
        const content = await readAsStringAsync(result.assets[0].uri);
        const importedData = JSON.parse(content);

        if (Array.isArray(importedData)) {
          Alert.alert(
            "Restore Data",
            `Found ${importedData.length} records. Do you want to merge them?`,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Import", 
                onPress: async () => {
                  for (const item of importedData) {
                    await saveHealthRecord(item);
                  }
                  fetchData(); // 刷新界面
                  Alert.alert("Success", "Records restored successfully!");
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert("Import Failed", "Please select a valid BMI backup file.");
    }
  };

  const renderChartData = () => {
    if (!whoData) return [];
    const minAge = records.length > 0 ? Math.min(...records.map(r => r.ageInMonths || 0)) : 0;

    const processData = (rawList: any[], color: string, thickness: number) => {
      if (!rawList) return { data: [], color, thickness };
      const sliced = rawList.slice(minAge);
      return {
        data: sliced.map((item, index) => {
          const currentMonth = minAge + index;
          let label = "";
          if (viewType === "MONTH") {
            if (currentMonth % 6 === 0) label = `${currentMonth}m`;
          } else {
            if (currentMonth % 12 === 0) label = `${currentMonth / 12}y`;
          }
          return { value: item.value, label: label };
        }),
        color: color,
        thickness: thickness,
        hideDataPoints: true,
      };
    };

    const baseLines = [
      processData(whoData.sd3, "#FF8C8C", 1),
      processData(whoData.sd2, "#FF8A65", 1),
      processData(whoData.sd1, "#FFC107", 1),
      processData(whoData.sd0, "#4CAF7A", 2.5),
      processData(whoData.neg1, "#FFC107", 1),
      processData(whoData.neg2, "#FF8A65", 1),
      processData(whoData.neg3, "#FF8C8C", 1),
    ];

    if (records.length > 0) {
      const userLine = {
        data: records.map(r => ({ value: r.bmiValue, hideDataPoints: false, dataPointColor: "#2F3A3A" })),
        color: "#2F3A3A",
        thickness: 3,
      };
      return [...baseLines, userLine];
    }
    return baseLines;
  };

  return (
    <ScrollView className="flex-1 bg-[#FAFBF8]" contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View className="bg-[#4CAF7A] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <TrendingUp color="#FFFFFF" size={24} />
            <Text className="text-2xl font-bold text-white">{t("growthTitle")}</Text>
          </View>
          <LanguageSelector />
        </View>

        <View className="flex-row bg-white/20 p-1 rounded-2xl">
          <TouchableOpacity onPress={() => setViewType("MONTH")} className={`flex-1 py-2 rounded-xl items-center ${viewType === "MONTH" ? 'bg-white' : ''}`}>
            <Text className={`font-bold ${viewType === "MONTH" ? 'text-[#4CAF7A]' : 'text-white'}`}>By Month</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewType("YEAR")} className={`flex-1 py-2 rounded-xl items-center ${viewType === "YEAR" ? 'bg-white' : ''}`}>
            <Text className={`font-bold ${viewType === "YEAR" ? 'text-[#4CAF7A]' : 'text-white'}`}>By Year</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 py-6">
        {/* 🆕 Backup Tools Section */}
        <View className="flex-row justify-end gap-3 mb-4 pr-2">
          <TouchableOpacity 
            onPress={handleImport} 
            className="flex-row items-center bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm active:bg-gray-50"
          >
            <Upload size={14} color="#64748B" />
            <Text className="text-[#64748B] text-[10px] font-bold ml-1">Import</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleExport} 
            className="flex-row items-center bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm active:bg-gray-50"
          >
            <Download size={14} color="#64748B" />
            <Text className="text-[#64748B] text-[10px] font-bold ml-1">Export</Text>
          </TouchableOpacity>
        </View>

        {/* Chart Card */}
        <View className="bg-white rounded-3xl p-4 shadow-lg mb-6 relative">
          <Text className="text-[#2F3A3A] font-bold text-lg mb-4">BMI-for-age Growth Chart</Text>
          
          {showHint && !loading && (
             <View pointerEvents="none" className="absolute right-6 top-1/2 z-10 flex-row items-center bg-black/50 px-3 py-1.5 rounded-full">
                <Text className="text-white text-[10px] mr-1">Swipe for details</Text>
                <ChevronRight color="white" size={12} />
             </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#4CAF7A" style={{ height: 250 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} onScroll={() => setShowHint(false)}>
              <LineChart
                dataSet={renderChartData()}
                height={250}
                width={viewType === "MONTH" ? SCREEN_WIDTH * 2.5 : SCREEN_WIDTH * 1.2} 
                initialSpacing={30}
                spacing={viewType === "MONTH" ? 40 : 60}
                yAxisColor="#F1F5F9"
                xAxisColor="#F1F5F9"
                curved
                noOfSections={5}
                rulesType="dashed"
                rulesColor="#F1F5F9"
              />
            </ScrollView>
          )}

          {/* Legend */}
          <View className="flex-row flex-wrap mt-6 justify-center gap-x-4 gap-y-3 px-2">
            {/* Green：Normal */}
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#4CAF7A]" />
              <Text className="text-[10px] text-[#7A8A8A]">Normal (SD0)</Text>
            </View>
            {/* Yellow：±1SD Risk */}
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#FFC107]" />
              <Text className="text-[10px] text-[#7A8A8A]">Risk (±1SD)</Text>
            </View>
            {/* Orange：±2SD Alert */}
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#FF8A65]" />
              <Text className="text-[10px] text-[#7A8A8A]">Over/Under (±2SD)</Text>
            </View>
            {/* 红色：±3SD 严重 */}
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F]" />
              <Text className="text-[10px] text-[#7A8A8A]">Severe (±3SD)</Text>
            </View>
            {/* 用户记录线标识 */}
            <View className="flex-row items-center gap-1.5 w-full justify-center mt-1">
              <View className="w-6 h-[2px] bg-[#2F3A3A]" />
              <Text className="text-[10px] text-[#2F3A3A] font-bold">Child's BMI Record</Text>
            </View>
          </View>
        </View>

        {/* History List */}
        <View className="space-y-4">
          <View className="flex-row justify-between items-center px-2 mb-2">
            <Text className="text-xl font-bold text-[#2F3A3A]">{t("history")}</Text>
            {/* 💡 关键修改 5：跳回首页(index/Home)，引导用户重新输入最新的数据 */}
            <TouchableOpacity 
              onPress={() => navigation.navigate("index")} 
              className="bg-[#4CAF7A] w-10 h-10 rounded-full items-center justify-center shadow-md"
            >
               <Plus color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          {records.length > 0 ? (
            records.slice().reverse().map((record) => (
              <View key={record.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-[#7A8A8A] text-xs">{new Date(record.date).toLocaleDateString()}</Text>
                  <Text className="text-lg font-bold text-[#2F3A3A]">{record.ageText}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#4CAF7A] font-bold text-lg">BMI: {record.bmiValue}</Text>
                  <Text className="text-xs text-[#7A8A8A]">{record.height}cm / {record.weight}kg</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white p-10 rounded-3xl items-center border border-dashed border-gray-300">
              <AlertCircle color="#CBD5E1" size={48} />
              <Text className="text-[#94A3B8] mt-4">No records found. Import or add new data.</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}