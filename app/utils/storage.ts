import AsyncStorage from "@react-native-async-storage/async-storage";

export interface HealthRecord {
  id: string;
  date: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
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
  const updatedRecords = [...records, record];
  await AsyncStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(updatedRecords));
  return updatedRecords;
}

export async function clearHealthRecords(): Promise<void> {
  await AsyncStorage.removeItem(HEALTH_RECORDS_KEY);
}

export default {};
