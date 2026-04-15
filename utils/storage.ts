import AsyncStorage from "@react-native-async-storage/async-storage";

export interface HealthRecord {
  id: string;
  date: string;       // 建议存当前时间戳或格式化日期
  nickname: string;   // 👈 新增：区分是谁测的（如：爸爸、Me）
  ageText: string;    // 👈 存 "20Years 3Months" 这种展示文本
  ageInMonths: number;
  height: number;
  weight: number;
  gender: number;     // 1: 男, 0: 女
  bmiValue: number;   // 具体的 BMI 数字
  adviceText: string; // 👈 关键：存 Java 后端返回的那段 resultText！
}

const HEALTH_RECORDS_KEY = "healthRecords";

export async function loadHealthRecords(): Promise<HealthRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(HEALTH_RECORDS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as HealthRecord[];
  } catch {
    return [];
  }
}

export async function saveHealthRecord(record: HealthRecord): Promise<HealthRecord[]> {
  const records = await loadHealthRecords();
  // 👉 改为 [record, ...records]，让最新的记录排在第一位
  const updatedRecords = [record, ...records]; 
  await AsyncStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(updatedRecords));
  return updatedRecords;
}

export async function clearHealthRecords(): Promise<void> {
  await AsyncStorage.removeItem(HEALTH_RECORDS_KEY);
}

export default {};
