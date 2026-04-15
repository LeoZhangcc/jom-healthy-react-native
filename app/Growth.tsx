import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  AlertCircle,
  Download,
  Plus,
  Ruler,
  Scale,
  TrendingUp,
  Upload
} from "lucide-react-native";
import { useCallback, useState } from "react";
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

import * as DocumentPicker from 'expo-document-picker';
import { documentDirectory, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { LanguageSelector } from "../components/components/language-selector";
import { useLocalization } from "../utils/LocalizationProvider";
import { HealthRecord, loadHealthRecords, saveHealthRecord } from "../utils/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_URL = "https://jom-healthy-java.onrender.com";

type SegmentType = "BMI" | "HEIGHT" | "WEIGHT";

export default function Growth() {
  const navigation = useNavigation<any>();
  const { t } = useLocalization();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [whoData, setWhoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<SegmentType>("BMI");
  const [viewType, setViewType] = useState<"MONTH" | "YEAR">("MONTH");
  const [showHint, setShowHint] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [viewType, activeSegment])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const stored = await loadHealthRecords();
      const sortedRecords = stored.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setRecords(sortedRecords);

      if (activeSegment === "BMI") {
        const gender = sortedRecords.length > 0 ? sortedRecords[0].gender : 1;
        const response = await fetch(`${BASE_URL}/api/bmi/who-standards?type=${viewType}&gender=${gender}`);
        const data = await response.json();
        setWhoData(data);
      } else {
        setWhoData(null);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      if (records.length === 0) return Alert.alert("No Data", "No records to export.");
      const fileUri = documentDirectory + "bmi_health_backup.json";
      await writeAsStringAsync(fileUri, JSON.stringify(records));
      await Sharing.shareAsync(fileUri);
    } catch (e) { Alert.alert("Export Failed", "Error creating backup."); }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!result.canceled && result.assets) {
        const content = await readAsStringAsync(result.assets[0].uri);
        const importedData = JSON.parse(content);
        if (Array.isArray(importedData)) {
          Alert.alert("Import", `Restore ${importedData.length} records?`, [
            { text: "Cancel" },
            { text: "Import", onPress: async () => {
              for (const item of importedData) await saveHealthRecord(item);
              fetchData();
            }}
          ]);
        }
      }
    } catch (e) { Alert.alert("Import Failed", "Invalid file."); }
  };

  // 💡 修正后的绘图逻辑：确保每个点都有 Label
  const renderChartData = () => {
    const minAge = records.length > 0 ? Math.min(...records.map(r => r.ageInMonths || 0)) : 0;
    const generateLabel = (age: number) => {
      if (viewType === "MONTH") {
        if (age % 6 === 0) {
          const yrs = Math.floor(age / 12); // 计算年
          const mos = age % 12;            // 计算余下的月
          
          // 💡 建议使用简写（如 5y 6m），因为全称（5 YEAR, 6 MONTHS）太长会导致横坐标文字重叠
          return `${yrs}y ${mos}m`; 
        }
        return "";
      }
      return age % 12 === 0 ? `${age / 12}y` : "";
    };

    let chartLines: any[] = [];

    // 1. BMI 模式下的背景线
    if (activeSegment === "BMI" && whoData) {
      const createWhoLine = (list: any[], color: string, isMain = false) => ({
        data: list.slice(minAge).map((item, i) => ({ value: item.value, label: generateLabel(minAge + i) })),
        color: color,
        thickness: isMain ? 2.5 : 1,
        hideDataPoints: true,
      });
      chartLines = [
        createWhoLine(whoData.sd3, "#FF8C8C"), createWhoLine(whoData.sd2, "#FF8A65"),
        createWhoLine(whoData.sd1, "#FFC107"), createWhoLine(whoData.sd0, "#4CAF7A", true),
        createWhoLine(whoData.neg1, "#FFC107"), createWhoLine(whoData.neg2, "#FF8A65"), createWhoLine(whoData.neg3, "#FF8C8C")
      ];
    }

    // 2. 用户数据线：关键是加上 label
    if (records.length > 0) {
      chartLines.push({
        data: records.map(r => {
          let val = 0;
          if (activeSegment === "BMI") val = r.bmiValue;
          else if (activeSegment === "HEIGHT") val = Number(r.height); // 💡 强制转数字
          else val = Number(r.weight);
          return { value: val, label: generateLabel(r.ageInMonths || 0), hideDataPoints: false, dataPointColor: "#2F3A3A" };
        }),
        color: "#2F3A3A",
        thickness: 3,
      });
    }
    return chartLines;
  };

  // 💡 动态计算 Y 轴：解决 0-10 无法显示 20kg 的问题
const getYAxisProps = () => {
    if (records.length === 0) return { noOfSections: 5, stepValue: 5 };
    
    let vals = records.map(r => {
      if (activeSegment === "BMI") return r.bmiValue;
      return activeSegment === "HEIGHT" ? Number(r.height) : Number(r.weight);
    });

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    
    let sections = 5;
    let padding = 5;
    
    if (activeSegment === "HEIGHT") {
      sections = 4; // 💡 减少身高区间，防止数字重叠
      padding = 10; // 💡 增加留白，让曲线在中间
    } else if (activeSegment === "WEIGHT") {
      sections = 4;
      padding = 6;
    } else {
      padding = 2;
    }

    // 💡 计算起始坐标，身高的起始坐标取整到 5 的倍数（如 105, 110）
    const rawMin = min - padding;
    const yMin = activeSegment === "HEIGHT" ? Math.floor(rawMin / 5) * 5 : Math.max(0, Math.floor(rawMin));
    const rawMax = max + padding;
    
    // 💡 计算步长
    const step = Math.ceil((rawMax - yMin) / sections);

    return {
      yAxisOffset: yMin,
      noOfSections: sections,
      stepValue: step || 1,
      maxValue: yMin + (step * sections)
    };
  };

  const getUnit = () => activeSegment === "BMI" ? "" : (activeSegment === "HEIGHT" ? "cm" : "kg");

  return (
    <ScrollView className="flex-1 bg-[#FAFBF8]" contentContainerStyle={{ paddingBottom: 32 }}>
      {/* 头部 & 导航 */}
      <View className="bg-[#4CAF7A] px-6 pt-12 pb-4 rounded-b-3xl shadow-lg">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-2">
            <TrendingUp color="#FFFFFF" size={24} /><Text className="text-2xl font-bold text-white">{t("growthTitle")}</Text>
          </View>
          <LanguageSelector />
        </View>

        <View className="flex-row bg-black/10 p-1 rounded-2xl mb-4">
          {(["BMI", "HEIGHT", "WEIGHT"] as SegmentType[]).map((seg) => (
            <TouchableOpacity key={seg} onPress={() => setActiveSegment(seg)} className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1 ${activeSegment === seg ? 'bg-white shadow-sm' : ''}`}>
              {seg === "HEIGHT" && <Ruler size={14} color={activeSegment === seg ? "#4CAF7A" : "#FFFFFF"} />}
              {seg === "WEIGHT" && <Scale size={14} color={activeSegment === seg ? "#4CAF7A" : "#FFFFFF"} />}
              <Text className={`font-bold text-xs ${activeSegment === seg ? 'text-[#4CAF7A]' : 'text-white'}`}>{seg}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row bg-white/20 p-1 rounded-2xl">
          <TouchableOpacity onPress={() => setViewType("MONTH")} className={`flex-1 py-2 rounded-xl items-center ${viewType === "MONTH" ? 'bg-white' : ''}`}><Text className={`font-bold text-xs ${viewType === "MONTH" ? 'text-[#4CAF7A]' : 'text-white'}`}>By Month</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setViewType("YEAR")} className={`flex-1 py-2 rounded-xl items-center ${viewType === "YEAR" ? 'bg-white' : ''}`}><Text className={`font-bold text-xs ${viewType === "YEAR" ? 'text-[#4CAF7A]' : 'text-white'}`}>By Year</Text></TouchableOpacity>
        </View>
      </View>

      <View className="px-4 py-6">
        <View className="flex-row justify-end gap-3 mb-4 pr-2">
          <TouchableOpacity onPress={handleImport} className="flex-row items-center bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm"><Upload size={14} color="#64748B" /><Text className="text-[#64748B] text-[10px] font-bold ml-1">Import</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleExport} className="flex-row items-center bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm"><Download size={14} color="#64748B" /><Text className="text-[#64748B] text-[10px] font-bold ml-1">Export</Text></TouchableOpacity>
        </View>

        {/* 图表卡片 */}
        <View className="bg-white rounded-3xl p-4 shadow-lg mb-6 relative">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#2F3A3A] font-bold text-lg">{activeSegment} Record</Text>
            <View className="bg-[#F1F5F9] px-2 py-1 rounded-md"><Text className="text-[10px] text-[#64748B] font-bold">{getUnit()}</Text></View>
          </View>
          
          {loading ? <ActivityIndicator size="large" color="#4CAF7A" style={{ height: 250 }} /> : (
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
                rulesType="dashed"
                rulesColor="#F1F5F9"
                yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 10, width: 50 }}
                {...getYAxisProps()} // 💡 注入修复后的纵轴
              />
            </ScrollView>
          )}

          {activeSegment === "BMI" && (
            <View className="flex-row flex-wrap mt-6 justify-center gap-x-4 gap-y-3 px-2">
              <View className="flex-row items-center gap-1.5"><View className="w-2.5 h-2.5 rounded-full bg-[#4CAF7A]" /><Text className="text-[10px] text-[#7A8A8A]">Normal</Text></View>
              <View className="flex-row items-center gap-1.5"><View className="w-2.5 h-2.5 rounded-full bg-[#FFC107]" /><Text className="text-[10px] text-[#7A8A8A]">Risk</Text></View>
              <View className="flex-row items-center gap-1.5"><View className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F]" /><Text className="text-[10px] text-[#7A8A8A]">Alert</Text></View>
            </View>
          )}
        </View>

        {/* 历史列表 */}
        <View className="space-y-4">
          <View className="flex-row justify-between items-center px-2 mb-2">
            <Text className="text-xl font-bold text-[#2F3A3A]">{t("history")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("index")} className="bg-[#4CAF7A] w-10 h-10 rounded-full items-center justify-center shadow-md"><Plus color="#FFFFFF" size={24} /></TouchableOpacity>
          </View>

          {records.length > 0 ? records.slice().reverse().map((record) => (
            <View key={record.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex-row items-center justify-between mb-3">
              <View><Text className="text-[#7A8A8A] text-[10px] mb-1">{new Date(record.date).toLocaleDateString()}</Text><Text className="text-md font-bold text-[#2F3A3A]">{record.ageText}</Text></View>
              <View className="items-end">
                {activeSegment === "BMI" ? <Text className="text-[#4CAF7A] font-bold text-lg">BMI: {record.bmiValue}</Text> : (activeSegment === "HEIGHT" ? <Text className="text-[#3B82F6] font-bold text-lg">{record.height} cm</Text> : <Text className="text-[#F59E0B] font-bold text-lg">{record.weight} kg</Text>)}
                <Text className="text-[10px] text-[#7A8A8A]">{activeSegment === "BMI" ? `${record.height}cm / ${record.weight}kg` : `BMI: ${record.bmiValue}`}</Text>
              </View>
            </View>
          )) : <View className="bg-white p-10 rounded-3xl items-center border border-dashed border-gray-300"><AlertCircle color="#CBD5E1" size={48} /><Text className="text-[#94A3B8] mt-4">No records found.</Text></View>}
        </View>
      </View>
    </ScrollView>
  );
}