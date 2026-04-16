import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { supportedLanguages } from "../../utils/i18n";
import { useLocalization } from "../../utils/LocalizationProvider";

const LANGUAGE_NAMES = supportedLanguages;

export function LanguageSelector() {
  const { language, setLanguage, t } = useLocalization();
  const [showModal, setShowModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const handleOpenModal = () => {
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
    });
  };

  const handleSelectLanguage = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLanguage(code as typeof language);
    setTimeout(() => {
      handleCloseModal();
    }, 200);
  };

  return (
    <>
      {/* 小球形按钮 */}
      <TouchableOpacity
        onPress={handleOpenModal}
        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
        activeOpacity={0.7}
      >
        <Text className="text-xs font-bold text-white">{language.toUpperCase()}</Text>
      </TouchableOpacity>

      {/* 模态框 */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={handleCloseModal}
        >
          <View className="flex-1 justify-center items-center">
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Pressable
                onPress={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 shadow-2xl min-w-[280px]"
              >
                {/* 标题 */}
                <Text className="text-xl font-bold text-center text-[#2F3A3A] mb-6">
                  {t("selectLanguage")}
                </Text>

                {/* 语言选项 */}
                <View className="space-y-3 gap-3">
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => {
                    const isSelected = language === code;
                    return (
                      <TouchableOpacity
                        key={code}
                        onPress={() => handleSelectLanguage(code)}
                        className={`flex-row items-center px-4 py-4 rounded-2xl transition-all ${
                          isSelected
                            ? "bg-[#4CAF7A] shadow-lg"
                            : "bg-[#F3F4F6] active:bg-[#E5E7EB]"
                        }`}
                        activeOpacity={0.85}
                      >
                        {/* 语言名称 */}
                        <View className="flex-1">
                          <Text
                            className={`text-base font-semibold ${
                              isSelected ? "text-white" : "text-[#2F3A3A]"
                            }`}
                          >
                            {name}
                          </Text>
                          <Text
                            className={`text-xs mt-1 ${
                              isSelected
                                ? "text-white/70"
                                : "text-[#7A8A8A]"
                            }`}
                          >
                            {code.toUpperCase()}
                          </Text>
                        </View>

                        {/* 选中勾选 */}
                        {isSelected && (
                          <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                            <Text className="text-[#4CAF7A] font-bold">✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 关闭按钮 */}
                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="mt-6 py-3 px-4 rounded-2xl bg-[#F3F4F6] active:bg-[#E5E7EB]"
                  activeOpacity={0.85}
                >
                  <Text className="text-center text-[#2F3A3A] font-semibold">
                    {t("done")}
                  </Text>
                </TouchableOpacity>
              </Pressable>
            </Animated.View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
