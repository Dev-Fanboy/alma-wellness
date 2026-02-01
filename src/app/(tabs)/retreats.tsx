import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    Linking,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Check,
    Heart,
    Leaf,
    ExternalLink,
    Crown,
    Handshake,
    RefreshCw,
} from "lucide-react-native";
import { getRetreats, Retreat as RetreatType } from "@/lib/api/retreats";

type RetreatFilter = "all" | "exclusive" | "partner";

// Transform Supabase data to component format
interface Retreat {
    id: string;
    title: string;
    description: string;
    fullDescription: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    maxAttendees: number;
    imageUrl: string;
    isPast: boolean;
    isUpcoming: boolean;
    isAlmaExclusive: boolean;
    theme: string;
    price: string;
    includes: string[];
    facilitator: string;
    registrationUrl: string;
}

function transformRetreat(r: RetreatType): Retreat {
    return {
        id: r.id,
        title: r.title,
        description: r.description,
        fullDescription: r.full_description,
        date: r.date,
        time: r.time,
        location: r.location,
        attendees: r.attendees,
        maxAttendees: r.max_attendees,
        imageUrl: r.image_url,
        isPast: r.is_past,
        isUpcoming: r.is_upcoming,
        isAlmaExclusive: r.is_alma_exclusive,
        theme: r.theme,
        price: r.price,
        includes: r.includes || [],
        facilitator: r.facilitator,
        registrationUrl: r.registration_url || "",
    };
}

function RetreatCard({
    retreat,
    index,
    isExpanded,
    onToggle,
}: {
    retreat: Retreat;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const spotsLeft = retreat.maxAttendees - retreat.attendees;

    const handleRegister = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (retreat.registrationUrl) {
            try {
                await Linking.openURL(retreat.registrationUrl);
            } catch {
                // URL failed to open - silently ignore
            }
        }
    };

    return (
        <View>
            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onToggle();
                }}
                className={`bg-white rounded-2xl overflow-hidden mb-4 ${retreat.isPast ? "opacity-80" : ""
                    }`}
            >
                {/* Image */}
                <View className="relative">
                    <Image
                        source={{ uri: retreat.imageUrl }}
                        className="w-full h-36"
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.6)"]}
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 60,
                        }}
                    />
                    {/* Badge */}
                    <View className="absolute top-3 left-3">
                        {retreat.isUpcoming ? (
                            <View className="bg-sage-500 rounded-full px-3 py-1 flex-row items-center">
                                <Sparkles size={12} color="white" />
                                <Text className="text-white text-xs font-semibold ml-1">
                                    Next Up
                                </Text>
                            </View>
                        ) : retreat.isPast ? (
                            <View className="bg-sage-600/80 rounded-full px-3 py-1 flex-row items-center">
                                <Check size={12} color="white" />
                                <Text className="text-white text-xs font-semibold ml-1">
                                    Attended
                                </Text>
                            </View>
                        ) : (
                            <View className="bg-blue-500 rounded-full px-3 py-1">
                                <Text className="text-white text-xs font-semibold">
                                    {spotsLeft} spots left
                                </Text>
                            </View>
                        )}
                    </View>
                    {/* Price tag */}
                    <View className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1">
                        <Text className="text-sage-800 text-xs font-bold">
                            {retreat.price}
                        </Text>
                    </View>
                    {/* Theme tag */}
                    <View className="absolute bottom-3 left-3 flex-row items-center">
                        <View>
                            <Text className="text-white font-bold text-lg">{retreat.title}</Text>
                            <View className="flex-row items-center mt-0.5">
                                <Text className="text-white/80 text-xs">{retreat.theme}</Text>
                                {retreat.isAlmaExclusive ? (
                                    <View className="ml-2 bg-amber-500/90 rounded-full px-2 py-0.5 flex-row items-center">
                                        <Crown size={10} color="white" />
                                        <Text className="text-white text-[10px] font-semibold ml-0.5">Exclusive</Text>
                                    </View>
                                ) : (
                                    <View className="ml-2 bg-blue-500/80 rounded-full px-2 py-0.5 flex-row items-center">
                                        <Handshake size={10} color="white" />
                                        <Text className="text-white text-[10px] font-semibold ml-0.5">Partner</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View className="p-4">
                    <Text className="text-sage-700 text-sm mb-3" numberOfLines={isExpanded ? undefined : 2}>
                        {isExpanded ? retreat.fullDescription : retreat.description}
                    </Text>

                    <View className="flex-row flex-wrap">
                        <View className="flex-row items-center mr-4 mb-2">
                            <Calendar size={14} color="#778b5f" />
                            <Text className="text-sage-600 text-xs ml-1">{retreat.date}</Text>
                        </View>
                        <View className="flex-row items-center mr-4 mb-2">
                            <Clock size={14} color="#778b5f" />
                            <Text className="text-sage-600 text-xs ml-1">{retreat.time}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <MapPin size={14} color="#778b5f" />
                        <Text className="text-sage-600 text-xs ml-1">{retreat.location}</Text>
                    </View>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <View className="mt-4">
                            {/* Facilitator */}
                            <View className="flex-row items-center mb-3 bg-sage-50 rounded-xl p-3">
                                <View className="w-10 h-10 rounded-full bg-sage-200 items-center justify-center">
                                    <Heart size={18} color="#5c6e4a" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-xs text-sage-500">Facilitated by</Text>
                                    <Text className="text-sm font-semibold text-sage-800">
                                        {retreat.facilitator}
                                    </Text>
                                </View>
                            </View>

                            {/* What's Included */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-sage-800 mb-2">
                                    What's Included
                                </Text>
                                {retreat.includes.map((item, i) => (
                                    <View key={i} className="flex-row items-center mb-1.5">
                                        <View className="w-5 h-5 rounded-full bg-sage-100 items-center justify-center mr-2">
                                            <Leaf size={12} color="#778b5f" />
                                        </View>
                                        <Text className="text-sage-600 text-sm flex-1">{item}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Register Button - Only for non-past retreats */}
                            {!retreat.isPast && retreat.registrationUrl && (
                                <Pressable
                                    onPress={handleRegister}
                                    className="bg-sage-600 rounded-xl py-4 flex-row items-center justify-center"
                                >
                                    <Text className="text-white font-semibold text-base mr-2">
                                        Register Now
                                    </Text>
                                    <ExternalLink size={18} color="white" />
                                </Pressable>
                            )}

                            {/* Coming Soon for retreats without registration */}
                            {!retreat.isPast && !retreat.registrationUrl && (
                                <View className="bg-sage-200 rounded-xl py-4 flex-row items-center justify-center">
                                    <Sparkles size={18} color="#5c6e4a" />
                                    <Text className="text-sage-700 font-semibold text-base ml-2">
                                        Registration Opening Soon
                                    </Text>
                                </View>
                            )}

                            {/* Past event message */}
                            {retreat.isPast && (
                                <View className="bg-sage-100 rounded-xl py-3 px-4">
                                    <Text className="text-sage-600 text-center text-sm">
                                        This retreat has already taken place. Stay tuned for future events!
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Attendees / Toggle */}
                    <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-sage-100">
                        <View className="flex-row items-center">
                            <Users size={14} color="#94a67e" />
                            <Text className="text-sage-500 text-xs ml-1">
                                {retreat.attendees}/{retreat.maxAttendees} attending
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-sage-600 text-sm font-medium mr-1">
                                {isExpanded ? "Show Less" : "View Details"}
                            </Text>
                            {isExpanded ? (
                                <ChevronUp size={16} color="#5c6e4a" />
                            ) : (
                                <ChevronDown size={16} color="#5c6e4a" />
                            )}
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

export default function RetreatsScreen() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<RetreatFilter>("all");

    // Fetch retreats from Supabase
    const { data: retreatsData, isLoading, error, refetch } = useQuery({
        queryKey: ["retreats"],
        queryFn: async () => {
            const { data, error } = await getRetreats();
            if (error) throw error;
            return data?.map(transformRetreat) || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const retreats = retreatsData || [];

    // Apply filter
    const filteredRetreats = retreats.filter((r: Retreat) => {
        if (filter === "exclusive") return r.isAlmaExclusive;
        if (filter === "partner") return !r.isAlmaExclusive;
        return true;
    });

    const upcomingRetreats = filteredRetreats.filter((r: Retreat) => !r.isPast);
    const pastRetreats = filteredRetreats.filter((r: Retreat) => r.isPast);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleFilterChange = (newFilter: RetreatFilter) => {
        setFilter(newFilter);
        setExpandedId(null);
    };

    const handleRefresh = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        refetch();
    };

    return (
        <View className="flex-1 bg-cream">
            <LinearGradient
                colors={["#e8ebe3", "#fdfbf7", "#fdfbf7"]}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 200,
                }}
            />
            <SafeAreaView className="flex-1" edges={["top"]}>
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="px-5 pt-2">
                        <View className="flex-row items-center">
                            <Calendar size={24} color="#49573c" />
                            <Text className="ml-2 text-2xl font-bold text-sage-900">
                                Retreats
                            </Text>
                        </View>
                        <Text className="text-base text-sage-600 mt-1">
                            Join our wellness community events
                        </Text>
                    </View>

                    {/* Filter Tabs */}
                    <View className="px-5 mt-4">
                        <View className="flex-row bg-sage-100 rounded-xl p-1">
                            <Pressable
                                onPress={() => handleFilterChange("all")}
                                className={`flex-1 py-2.5 rounded-lg items-center ${filter === "all" ? "bg-white shadow-sm" : ""
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-medium ${filter === "all" ? "text-sage-900" : "text-sage-500"
                                        }`}
                                >
                                    All
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleFilterChange("exclusive")}
                                className={`flex-1 py-2.5 rounded-lg items-center flex-row justify-center ${filter === "exclusive" ? "bg-white shadow-sm" : ""
                                    }`}
                            >
                                <Crown size={14} color={filter === "exclusive" ? "#49573c" : "#94a67e"} />
                                <Text
                                    className={`text-sm font-medium ml-1 ${filter === "exclusive" ? "text-sage-900" : "text-sage-500"
                                        }`}
                                >
                                    Exclusive
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleFilterChange("partner")}
                                className={`flex-1 py-2.5 rounded-lg items-center flex-row justify-center ${filter === "partner" ? "bg-white shadow-sm" : ""
                                    }`}
                            >
                                <Handshake size={14} color={filter === "partner" ? "#49573c" : "#94a67e"} />
                                <Text
                                    className={`text-sm font-medium ml-1 ${filter === "partner" ? "text-sage-900" : "text-sage-500"
                                        }`}
                                >
                                    Partner
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Loading State */}
                    {isLoading && (
                        <View className="px-5 mt-10 items-center">
                            <ActivityIndicator size="large" color="#778b5f" />
                            <Text className="text-sage-500 mt-4">Loading retreats...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <View className="px-5 mt-10 items-center">
                            <Text className="text-sage-500 text-center mb-4">
                                Unable to load retreats. Please try again.
                            </Text>
                            <Pressable
                                onPress={handleRefresh}
                                className="flex-row items-center bg-sage-500 px-4 py-2 rounded-xl"
                            >
                                <RefreshCw size={16} color="white" />
                                <Text className="text-white font-medium ml-2">Retry</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Upcoming Retreats */}
                    {!isLoading && !error && upcomingRetreats.length > 0 && (
                        <View className="px-5 mt-6">
                            <Text className="text-lg font-semibold text-sage-900 mb-3">
                                Upcoming Retreats
                            </Text>
                            {upcomingRetreats.map((retreat: Retreat, index: number) => (
                                <RetreatCard
                                    key={retreat.id}
                                    retreat={retreat}
                                    index={index}
                                    isExpanded={expandedId === retreat.id}
                                    onToggle={() => toggleExpand(retreat.id)}
                                />
                            ))}
                        </View>
                    )}

                    {/* Past Retreats */}
                    {!isLoading && !error && pastRetreats.length > 0 && (
                        <View className="px-5 mt-4">
                            <Text className="text-lg font-semibold text-sage-900 mb-3">
                                Past Retreats
                            </Text>
                            {pastRetreats.map((retreat: Retreat, index: number) => (
                                <RetreatCard
                                    key={retreat.id}
                                    retreat={retreat}
                                    index={index + upcomingRetreats.length}
                                    isExpanded={expandedId === retreat.id}
                                    onToggle={() => toggleExpand(retreat.id)}
                                />
                            ))}
                        </View>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && filteredRetreats.length === 0 && (
                        <View className="px-5 mt-10 items-center">
                            <Text className="text-sage-500 text-center">
                                No retreats found for this filter.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
