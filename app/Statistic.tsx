import { Feather, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Linking, ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const tips = [
  "Eat at least 3 servings of vegetables daily",
  "Eat at least 2 servings of fruit daily",
  "Eat 3 main meals per day",
  "Eat 1 or 2 nutritious snacks between meals",
  "Avoid skipping meals", 
  "Replace sugar sweetened beverages with plain water or low fat milk", 
  "For overweight and obese children, perform 60 minutes of physical activity daily", 
  "Consume 2 to 3 servings of milk and milk products daily", 
  "Avoid sugary foods in between meals and close to bedtime", 
  "Avoid sugar-sweetened beverages in between meals and close to bedtime", 
  "Plain water is the best to quench your thirst", 
  "Drink 6 to 8 glasses of water daily", 
  "Eat fish daily", 
  "Limit intake of high-fat foods to not more than 2 to 3 times per week", 
  "Limit intake of processed meat to not more than once a week", 
  "Limit intake of spreads to not more than 2 teaspoons daily", 
  "Choose fresh fruits over fruit juices", 
  "Fruit juices should not replace more than 1 serving of fruit", 
  "Add nuts and seeds as ingredients in dishes", 
  "pack UHT milk for children to consume at school", 
  "At school, children should avoid sausages, nuggets and burgers"
];

// interface Health {
//     statistic: string;
//     sd: "Male" | "Female" | "Urban" | "Rural";
//     ageRange: string;
//     prevalence: number;
// }

type Health = {
  statistic: string;
  sd: string;
  ageRange: string;
  prevalence: number;
};  

const ChartCarousel: React.FC<{ rows: Health[] }> = ({ rows }) => {
    const scrollRef = useRef<ScrollView | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTips, setSelectedTips] = useState<string[]>([]);

    const statistics = ["Underweight", "Stunting", "Thinness", "Overweight", "Obesity"];
    // const rows: Health[] = [
    //     { statistic: "Underweight", sd: "Urban", ageRange: "5 to 10", prevalence: 12.1 },
    //     { statistic: "Underweight", sd: "Rural", ageRange: "5 to 10", prevalence: 13.4 },
    //     { statistic: "Underweight", sd: "Male", ageRange: "5 to 10", prevalence: 11.1 },
    //     { statistic: "Underweight", sd: "Female", ageRange: "5 to 10", prevalence: 13.9 },

    //     { statistic: "Stunting", sd: "Urban", ageRange: "5 to 19", prevalence: 6.7 },
    //     { statistic: "Stunting", sd: "Rural", ageRange: "5 to 19", prevalence: 11.9 },
    //     { statistic: "Stunting", sd: "Male", ageRange: "5 to 19", prevalence: 6.5 },
    //     { statistic: "Stunting", sd: "Female", ageRange: "5 to 19", prevalence: 9.8 }, 

    //     { statistic: "Thinness", sd: "Urban", ageRange: "5 to 19", prevalence: 11.4 },
    //     { statistic: "Thinness", sd: "Rural", ageRange: "5 to 19", prevalence: 9.1 },
    //     { statistic: "Thinness", sd: "Male", ageRange: "5 to 19", prevalence: 11.7 },
    //     { statistic: "Thinness", sd: "Female", ageRange: "5 to 19", prevalence: 9.8 },

    //     { statistic: "Overweight", sd: "Urban", ageRange: "5 to 19", prevalence: 15.1 },
    //     { statistic: "Overweight", sd: "Rural", ageRange: "5 to 19", prevalence: 12.6 },
    //     { statistic: "Overweight", sd: "Male", ageRange: "5 to 19", prevalence: 15.6 },
    //     { statistic: "Overweight", sd: "Female", ageRange: "5 to 19", prevalence: 13.1 },

    //     { statistic: "Obesity", sd: "Urban", ageRange: "5 to 19", prevalence: 13.9 },
    //     { statistic: "Obesity", sd: "Rural", ageRange: "5 to 19", prevalence: 12.9 },
    //     { statistic: "Obesity", sd: "Male", ageRange: "5 to 19", prevalence: 16.8 },
    //     { statistic: "Obesity", sd: "Female", ageRange: "5 to 19", prevalence: 10.2 }
    // ];

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
    }, []);

    
    const currentStatistic = statistics[currentIndex];

    const filteredRows = rows.filter(
        (row) => row.statistic === currentStatistic
    );


    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ marginHorizontal: -16 }}>
          
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16, marginTop: 8, marginBottom: 2 }}>
                <MaterialCommunityIcons name="chart-bar" size={20} color="orange" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#333' }}>
                  Malaysian Children Health Statistics
                </Text>
            </View>

          <Text
              style={{ fontSize: 12, color: "gray", textDecorationLine: "underline", marginLeft: 16, marginBottom: 4 }}
              onPress={() => Linking.openURL("https://iku.nih.gov.my/images/nhms2024/vol2.pdf")}
              >
              Source: Institute of Public Health Malaysia
          </Text>

          <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} nestedScrollEnabled>
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
                    <View key={index} style={{ width: screenWidth, paddingHorizontal: 16 }}>
                        <View style={{ width: screenWidth - 48, backgroundColor: "#fff", borderRadius: 20, padding: 16, marginTop: 8, shadowColor: "#000", 
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
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
                                    width={screenWidth - 64}
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
                                    width={screenWidth - 64}
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
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16, marginTop: 32, marginBottom: 2, gap: 8 }}>
            <Feather name="heart" size={20} color="red" />
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#333' }}>Daily Health Tips</Text>
          </View>
          <Text
                style={{ fontSize: 12, color: "gray", textDecorationLine: "underline", marginLeft: 16, marginBottom: 12 }}
                onPress={() => Linking.openURL("https://www.moh.gov.my/images/04-penerbitan/rujukan/pemakanan/589d765c1b95f.pdf")}
                >
                Source: Ministry of Health Malaysia
            </Text>
          <View>
            {selectedTips.map((tip, index) => (
              <View key={index} style={{ width: screenWidth - 48, alignSelf: 'center', marginBottom: 12, padding: 16, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
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


