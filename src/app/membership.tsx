import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Sparkles,
  Percent,
  MapPin,
  Clock,
  ChevronRight,
  Dumbbell,
  Flower2,
  Scissors,
  Hotel,
  Heart,
  Crown,
  X,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  Lock,
} from "lucide-react-native";
import { useWellnessStore } from "@/lib/store";
import { useEffect } from "react";
import QRCode from "react-native-qrcode-svg";
import { useAuth } from "@/lib/AuthContext";
import { getPartnerDiscounts, PartnerDiscount } from "@/lib/api/discounts";

// Category icon mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  "Spa & Wellness": Flower2,
  "Fitness": Dumbbell,
  "Beauty": Scissors,
  "Hospitality": Hotel,
};

interface PartnerBusiness {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  discount: string;
  description: string;
  image: string;
  location: string;
  hours: string;
  minLevelRequired: number;
}

// Transform Supabase data to component format
function transformDiscount(d: PartnerDiscount): PartnerBusiness {
  return {
    id: d.id,
    name: d.partner_name,
    category: d.category,
    icon: CATEGORY_ICONS[d.category] || Heart,
    discount: d.discount_value,
    description: d.description,
    image: d.image_url,
    location: d.location,
    hours: d.hours,
    minLevelRequired: d.min_level_required || 0,
  };
}

export default function MembershipScreen() {
  const userName = useWellnessStore((s) => s.userName);
  const plantLevel = useWellnessStore((s) => s.plantLevel);
  const inviteCode = useWellnessStore((s) => s.inviteCode);
  const { user } = useAuth();

  // Fetch partner discounts from Supabase
  const { data: discountsData, isLoading: discountsLoading } = useQuery({
    queryKey: ["partner_discounts"],
    queryFn: async () => {
      const { data, error } = await getPartnerDiscounts();
      if (error) throw error;
      return data?.map(transformDiscount) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const partnerBusinesses = discountsData || [];

  const shimmer = useSharedValue(0);
  const cardRotateX = useSharedValue(0);
  const flipRotation = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );

    // Subtle floating animation for card (only when not flipped)
    if (!isFlipped) {
      cardRotateX.value = withRepeat(
        withSequence(
          withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isFlipped]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 350 - 100 }],
  }));

  // Front face animated style
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${isFlipped ? 0 : cardRotateX.value}deg` },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden' as const,
    };
  });

  // Back face animated style
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 1],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden' as const,
    };
  });

  const handleFlipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    flipRotation.value = withSpring(newFlipped ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const [selectedPartner, setSelectedPartner] = useState<PartnerBusiness | null>(null);

  const handlePartnerPress = (partner: PartnerBusiness) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPartner(partner);
  };

  const handleClosePartner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPartner(null);
  };

  const handleGetDirections = (location: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = `https://maps.apple.com/?q=${encodeURIComponent(location)}`;
    Linking.openURL(url);
  };

  const memberNumber = `ALM-${inviteCode?.slice(-6) || "000000"}`;
  const memberTier = plantLevel >= 15 ? "Gold" : plantLevel >= 8 ? "Silver" : "Member";
  const tierColor = plantLevel >= 15 ? "#D4AF37" : plantLevel >= 8 ? "#C0C0C0" : "#778b5f";

  return (
    <View className="flex-1 bg-sage-900">
      <LinearGradient
        colors={["#2d3a29", "#1a2318", "#0f1510"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="flex-row items-center justify-between px-5 pt-2 pb-4"
        >
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </Pressable>
          <Text className="text-xl font-bold text-white">Membership</Text>
          <View className="w-10" />
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Membership Card - Flippable */}
          <View className="mx-5 mt-2" style={{ height: 220 }}>
            {/* Front Face */}
            <Animated.View
              entering={FadeInUp.delay(200).duration(600)}
              style={[frontAnimatedStyle, { position: 'absolute', width: '100%' }]}
            >
              <Pressable onPress={handleFlipCard}>
                <View className="rounded-3xl overflow-hidden shadow-2xl">
                  <LinearGradient
                    colors={["#3d4a38", "#2d3a29", "#1a2318"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      padding: 24,
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    {/* Shimmer effect */}
                    <Animated.View
                      style={[
                        {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          overflow: "hidden",
                        },
                      ]}
                    >
                      <Animated.View
                        style={[
                          shimmerStyle,
                          {
                            width: 100,
                            height: "200%",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            transform: [{ rotate: "25deg" }],
                          },
                        ]}
                      />
                    </Animated.View>

                    {/* Card Header */}
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-xl bg-white/10 items-center justify-center mr-3">
                          <Flower2 size={24} color="#94a67e" />
                        </View>
                        <View>
                          <Text className="text-lg font-bold text-white tracking-wide">
                            ALMA
                          </Text>
                          <Text className="text-xs text-white/60 tracking-widest">
                            WELLNESS
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: `${tierColor}20` }}>
                        <Crown size={14} color={tierColor} />
                        <Text className="text-xs font-semibold ml-1.5" style={{ color: tierColor }}>
                          {memberTier}
                        </Text>
                      </View>
                    </View>

                    {/* Member Info */}
                    <View className="mb-6">
                      <Text className="text-2xl font-bold text-white tracking-wide">
                        {userName || "Member"}
                      </Text>
                      <Text className="text-sm text-white/50 mt-1 tracking-widest">
                        {memberNumber}
                      </Text>
                    </View>

                    {/* Card Footer */}
                    <View className="flex-row items-center justify-between pt-4 border-t border-white/10">
                      <View>
                        <Text className="text-xs text-white/40">LEVEL</Text>
                        <Text className="text-lg font-bold text-sage-300">
                          {plantLevel}
                        </Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-xs text-white/40">TAP TO</Text>
                        <View className="flex-row items-center">
                          <RotateCcw size={12} color="#94a67e" />
                          <Text className="text-xs font-semibold text-sage-300 ml-1">
                            FLIP
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs text-white/40">VALID THRU</Text>
                        <Text className="text-lg font-bold text-sage-300">
                          ∞
                        </Text>
                      </View>
                    </View>

                    {/* Decorative elements */}
                    <View
                      style={{
                        position: "absolute",
                        right: -40,
                        bottom: -40,
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        backgroundColor: "rgba(148, 166, 126, 0.1)",
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        right: -20,
                        bottom: -20,
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: "rgba(148, 166, 126, 0.05)",
                      }}
                    />
                  </LinearGradient>
                </View>
              </Pressable>
            </Animated.View>

            {/* Back Face - QR Code */}
            <Animated.View
              style={[backAnimatedStyle, { position: 'absolute', width: '100%' }]}
            >
              <Pressable onPress={handleFlipCard}>
                <View className="rounded-3xl overflow-hidden shadow-2xl">
                  <LinearGradient
                    colors={["#1a2318", "#2d3a29", "#3d4a38"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      padding: 24,
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 196,
                    }}
                  >
                    {/* QR Code Container */}
                    <View className="bg-white rounded-xl p-3 mb-3">
                      <QRCode
                        value={user?.id || inviteCode || memberNumber}
                        size={80}
                        color="#2d3a29"
                        backgroundColor="white"
                      />
                    </View>

                    {/* Scan to Redeem Text */}
                    <Text className="text-lg font-bold text-white">
                      Scan to Redeem
                    </Text>
                    <Text className="text-xs text-white/60 mt-1">
                      Show this QR code at partner locations
                    </Text>

                    {/* Tap to flip back hint */}
                    <View className="flex-row items-center mt-4 opacity-60">
                      <RotateCcw size={12} color="#94a67e" />
                      <Text className="text-xs text-sage-300 ml-1">
                        Tap to flip back
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </Pressable>
            </Animated.View>
          </View>

          {/* Benefits Banner */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-5 mt-6"
          >
            <View className="bg-sage-500/20 rounded-2xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-sage-500/30 items-center justify-center mr-3">
                <Sparkles size={22} color="#94a67e" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">
                  Exclusive Member Benefits
                </Text>
                <Text className="text-white/60 text-sm mt-0.5">
                  Show this card at partner locations
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Partner Businesses */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="px-5 mt-6"
          >
            <View className="flex-row items-center mb-4">
              <Percent size={18} color="#94a67e" />
              <Text className="ml-2 text-lg font-semibold text-white">
                Partner Discounts
              </Text>
            </View>

            {/* Loading State */}
            {discountsLoading && (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#94a67e" />
                <Text className="text-white/50 text-sm mt-2">Loading discounts...</Text>
              </View>
            )}

            {!discountsLoading && partnerBusinesses.map((partner: PartnerBusiness, index: number) => {
              const isLocked = plantLevel < partner.minLevelRequired;

              return (
                <Animated.View
                  key={partner.id}
                  entering={FadeInUp.delay(450 + index * 50).duration(500)}
                >
                  <Pressable
                    onPress={() => !isLocked && handlePartnerPress(partner)}
                    className={`bg-white/5 rounded-2xl mb-3 overflow-hidden ${isLocked ? 'opacity-60' : 'active:bg-white/10'}`}
                  >
                    <View className="flex-row">
                      {/* Partner Image */}
                      <View style={{ width: 100, height: 100 }}>
                        <Image
                          source={{ uri: partner.image }}
                          style={{ width: 100, height: 100 }}
                          resizeMode="cover"
                        />
                        {/* Lock overlay for locked discounts */}
                        {isLocked && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Lock size={24} color="white" />
                          </View>
                        )}
                      </View>

                      {/* Partner Info */}
                      <View className="flex-1 p-3">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-white font-semibold text-base">
                            {partner.name}
                          </Text>
                          {isLocked ? (
                            <View className="bg-amber-600/80 px-2 py-1 rounded-lg flex-row items-center">
                              <Lock size={10} color="white" />
                              <Text className="text-white text-xs font-bold ml-1">
                                Lvl {partner.minLevelRequired}+
                              </Text>
                            </View>
                          ) : (
                            <View className="bg-sage-500 px-2 py-1 rounded-lg">
                              <Text className="text-white text-xs font-bold">
                                {partner.discount}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-white/50 text-xs mt-1">
                          {partner.category}
                        </Text>

                        <Text className="text-white/70 text-sm mt-1" numberOfLines={1}>
                          {isLocked ? `Unlock at Level ${partner.minLevelRequired}` : partner.description}
                        </Text>

                        <View className="flex-row items-center mt-2">
                          <View className="flex-row items-center mr-3">
                            <MapPin size={12} color="#94a67e" />
                            <Text className="text-white/40 text-xs ml-1">
                              {partner.location}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Clock size={12} color="#94a67e" />
                            <Text className="text-white/40 text-xs ml-1">
                              {partner.hours}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="justify-center pr-3">
                        {isLocked ? (
                          <Lock size={18} color="rgba(255,255,255,0.3)" />
                        ) : (
                          <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                        )}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* How to Use */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(600)}
            className="mx-5 mt-4 mb-6"
          >
            <View className="bg-white/5 rounded-2xl p-4">
              <Text className="text-white font-semibold mb-3">
                How to redeem
              </Text>
              <View className="flex-row items-start mb-2">
                <View className="w-6 h-6 rounded-full bg-sage-500/30 items-center justify-center mr-3">
                  <Text className="text-sage-300 text-xs font-bold">1</Text>
                </View>
                <Text className="text-white/70 flex-1 text-sm">
                  Visit any partner location listed above
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <View className="w-6 h-6 rounded-full bg-sage-500/30 items-center justify-center mr-3">
                  <Text className="text-sage-300 text-xs font-bold">2</Text>
                </View>
                <Text className="text-white/70 flex-1 text-sm">
                  Show your Alma membership card at checkout
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-sage-500/30 items-center justify-center mr-3">
                  <Text className="text-sage-300 text-xs font-bold">3</Text>
                </View>
                <Text className="text-white/70 flex-1 text-sm">
                  Enjoy your exclusive member discount!
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Partner Detail Modal */}
      <Modal
        visible={selectedPartner !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClosePartner}
      >
        {selectedPartner && (
          <View className="flex-1 bg-sage-900">
            <LinearGradient
              colors={["#2d3a29", "#1a2318", "#0f1510"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            <SafeAreaView className="flex-1" edges={["top"]}>
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
                <View className="w-10" />
                <Text className="text-lg font-bold text-white">Partner Details</Text>
                <Pressable
                  onPress={handleClosePartner}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <X size={20} color="white" />
                </Pressable>
              </View>

              <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Partner Image */}
                <Image
                  source={{ uri: selectedPartner.image }}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="cover"
                />

                {/* Partner Info */}
                <View className="px-5 pt-5">
                  {/* Name and Discount */}
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-white">
                        {selectedPartner.name}
                      </Text>
                      <Text className="text-sage-300 text-sm mt-1">
                        {selectedPartner.category}
                      </Text>
                    </View>
                    <View className="bg-sage-500 px-4 py-2 rounded-xl">
                      <Text className="text-white text-lg font-bold">
                        {selectedPartner.discount}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <View className="mt-6 bg-white/5 rounded-2xl p-4">
                    <Text className="text-white/70 text-base leading-6">
                      {selectedPartner.description}
                    </Text>
                  </View>

                  {/* Location & Hours */}
                  <View className="mt-4 bg-white/5 rounded-2xl p-4">
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 rounded-full bg-sage-500/30 items-center justify-center mr-3">
                        <MapPin size={20} color="#94a67e" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white/50 text-xs">Location</Text>
                        <Text className="text-white text-sm">{selectedPartner.location}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-sage-500/30 items-center justify-center mr-3">
                        <Clock size={20} color="#94a67e" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white/50 text-xs">Hours</Text>
                        <Text className="text-white text-sm">{selectedPartner.hours}</Text>
                      </View>
                    </View>
                  </View>

                  {/* How to Redeem */}
                  <View className="mt-4 bg-sage-500/20 rounded-2xl p-4">
                    <Text className="text-sage-300 font-semibold mb-2">
                      How to redeem your discount
                    </Text>
                    <Text className="text-white/70 text-sm">
                      Simply show your Alma Wellness membership card at checkout to receive your exclusive {selectedPartner.discount} discount.
                    </Text>
                  </View>

                  {/* Get Directions Button */}
                  <Pressable
                    onPress={() => handleGetDirections(selectedPartner.location)}
                    className="mt-6 bg-sage-500 rounded-2xl py-4 flex-row items-center justify-center"
                  >
                    <ExternalLink size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Get Directions
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </View>
  );
}
