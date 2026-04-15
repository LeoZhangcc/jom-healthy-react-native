import { Feather, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Linking, ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

type Status = {
  statistic: string;
  sd: string;
  ageRange: string;
  prevalence: number;
};  


const ChartCarousel: React.FC<{ rows: Status[] }> = ({ rows }) => {
    const scrollRef = useRef<ScrollView | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tips, setTips] = useState<string[]>([]);
    const [selectedTips, setSelectedTips] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        async function fetchNutritionTips() {
        try {
            const response = await fetch(
            "https://jom-healthy-java.onrender.com/nutritiontips"
            );

            if (!response.ok) {
            throw new Error(`Server error ${response.status}`);
            }

            const backendArray: any[] = await response.json();

            const tipsArray: string[] = backendArray
            .filter(item => typeof item?.nutrition_tips === "string")
            .map(item => item.nutrition_tips);

            setTips(tipsArray);
        } catch (err) {
            console.error("Failed to fetch nutrition tips:", err);
        } finally {
            setLoading(false);
        }
        }

        fetchNutritionTips();
    }, []);

    const statistics = ["Underweight", "Stunting", "Thinness", "Overweight", "Obesity"];

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % statistics.length;
            setCurrentIndex(nextIndex);
            scrollRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
        }, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, [currentIndex]);

    useEffect(() => {
        const shuffled = [...tips].sort(() => Math.random() - 0.5);
        setSelectedTips(shuffled.slice(0, 3));
    }, [tips]);

    
    if (loading) {
        return <ActivityIndicator style={{ marginTop: 40 }} />;
    }

    return (
        <ScrollView style={{ flex: 1 }}>
          
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 2 }}>
                <MaterialCommunityIcons name="chart-bar" size={20} color="orange" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#333' }}>
                  Malaysian Children Health Statistics
                </Text>
            </View>

          <Text
              style={{ fontSize: 12, color: "gray", textDecorationLine: "underline", marginBottom: 4 }}
              onPress={() => Linking.openURL("https://iku.nih.gov.my/images/nhms2024/vol2.pdf")}
              >
              Source: Institute of Public Health Malaysia
          </Text>

          <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} 
            scrollEnabled={true} snapToInterval={screenWidth}>
              {statistics.map((cat, index) => {
                  const filtered = rows.filter(r => r.statistic === cat);

                  const genderData = {
                      labels: ['Male', 'Female'],
                      datasets: [{
                          data: [
                              filtered.find(r => r.sd === "Male")?.prevalence ?? 0,
                              filtered.find(r => r.sd === "Female")?.prevalence ?? 0
                          ],
                          colors: [
                              (opacity = 1) => `rgba(218,156,161,${opacity})`,
                              (opacity = 1) => `rgba(255,241,224,${opacity})`
                          ]
                      }]
                  };

                const locationData = {
                    labels: ['Urban', 'Rural'],
                    datasets: [{
                        data: [
                            filtered.find(r => r.sd === "Urban")?.prevalence ?? 0,
                            filtered.find(r => r.sd === "Rural")?.prevalence ?? 0
                        ],
                        colors: [
                            (opacity = 1) => `rgba(234,247,240,${opacity})`,
                            (opacity = 1) => `rgba(229,250,250,${opacity})`
                        ]
                    }]
                };

                return (
                    <View key={index} style={{ width: screenWidth }}>
                        <View style={{ maxWidth: screenWidth - 48, backgroundColor: "#fff", borderRadius: 20, padding: 16, marginTop: 8 }}>
                            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4, textAlign: "center" }}>
                                {cat.toUpperCase()}
                            </Text>
                            <Text style={{ fontSize: 16, marginBottom: 12, textAlign: "center" }}>
                                Age Range: {filtered[0]?.ageRange}
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 12, textAlign: "left" }}>
                                Prevalence (%)
                            </Text>

                            <View style={{ flexDirection: "column", justifyContent: "space-between" }}>
                                {/* Gender comparison */}
                                <BarChart
                                    data={genderData}
                                    width={screenWidth - 72}
                                    height={180}
                                    chartConfig={{
                                        backgroundColor: '#fff',
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16
                                        },
                                        propsForLabels: {
                                            fontSize: 12
                                        },
                                        propsForBackgroundLines: {
                                            strokeDasharray: ""
                                        }
                                    }}
                                    withInnerLines={false}
                                    withCustomBarColorFromData={true}
                                    flatColor={true}
                                    showBarTops={false}
                                    yAxisLabel=""
                                    showValuesOnTopOfBars={true}
                                    fromZero={true}
                                    yAxisSuffix=""
                                    style={{ borderRadius: 16, marginBottom: 16 }}
                                />

                                {/* Location comparison */}
                                <BarChart
                                    data={locationData}
                                    width={screenWidth - 72}
                                    height={180}
                                    chartConfig={{
                                        backgroundColor: '#fff',
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16
                                        },
                                        propsForLabels: {
                                            fontSize: 12
                                        },
                                        propsForBackgroundLines: {
                                            strokeDasharray: ""
                                        }
                                      }}
                                      withInnerLines={false}
                                      withCustomBarColorFromData={true}
                                      flatColor={true}
                                      showBarTops={false}
                                      yAxisLabel=""
                                      showValuesOnTopOfBars={true}
                                      fromZero={true}
                                      yAxisSuffix=""
                                      style={{ borderRadius: 16 }}
                                  />
                            </View>
                        </View>
                    </View>
                );
              })
          }
          </ScrollView>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 32, marginBottom: 2, gap: 8 }}>
            <Feather name="heart" size={20} color="red" />
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#333' }}>Daily Health Tips</Text>
          </View>
          <Text
                style={{ fontSize: 12, color: "gray", textDecorationLine: "underline", marginBottom: 12 }}
                onPress={() => Linking.openURL("https://www.moh.gov.my/images/04-penerbitan/rujukan/pemakanan/589d765c1b95f.pdf")}
                >
                Source: Ministry of Health Malaysia
            </Text>
          <View>
                {selectedTips.map((tip, index) => (
                <View key={index} style={{ width: screenWidth - 48, alignSelf: 'center', marginBottom: 12, padding: 16, backgroundColor: '#fff', borderRadius: 20 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {index % 3 === 0 && <FontAwesome5 name="apple-alt" size={20} color="red" style={{ marginRight: 8 }} />}
                    {index % 3 === 1 && <MaterialCommunityIcons name="stethoscope" size={22} color="gray" style={{ marginRight: 8 }} />}
                    {index % 3 === 2 && <MaterialCommunityIcons name="water" size={22} color="blue" style={{ marginRight: 8 }} />}
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#333', lineHeight: 18, flexShrink: 1, flexWrap: 'wrap' }}>{tip}</Text>
                    </View>
                </View>
                ))}
          </View>
        </ScrollView>
    );
};

export default ChartCarousel;


