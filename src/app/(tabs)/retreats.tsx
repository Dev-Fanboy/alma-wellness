import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
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
} from "lucide-react-native";

type RetreatFilter = "all" | "exclusive" | "partner";

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

const RETREATS: Retreat[] = [
    {
        id: "1",
        title: "Visionboard Workshop",
        description:
            "Create your 2026 vision board with guided meditation and intention-setting exercises. Materials provided.",
        fullDescription:
            "Join us for an immersive half-day workshop where you'll craft a powerful vision board for 2026. We'll begin with a grounding meditation to connect with your deepest intentions, followed by guided journaling to clarify your goals across all areas of life—health, relationships, career, and personal growth. All materials including magazines, poster boards, markers, and embellishments are provided. Light refreshments and herbal tea will be served throughout the session.",
        date: "January 24, 2026",
        time: "10:00 AM - 2:00 PM",
        location: "Wellness Studio, Downtown",
        attendees: 18,
        maxAttendees: 25,
        imageUrl:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        isPast: false,
        isUpcoming: true,
        isAlmaExclusive: true,
        theme: "Vision & Intention",
        price: "$65",
        includes: [
            "All craft materials",
            "Guided meditation",
            "Light refreshments",
            "Take-home journal prompts",
        ],
        facilitator: "Sarah Chen",
        registrationUrl: "",
    },
    {
        id: "2",
        title: "Spring Renewal Retreat",
        description:
            "A full day of yoga, meditation, and nature walks to welcome the spring season.",
        fullDescription:
            "Embrace the energy of spring with this transformative full-day retreat. Begin your morning with sunrise yoga overlooking the mountains, followed by a nourishing plant-based brunch. The afternoon includes guided forest bathing, breathwork sessions, and a rejuvenating sound bath. End the day with a community dinner and intention-setting ceremony for the season ahead. This retreat is designed to help you shed what no longer serves you and plant seeds for new growth.",
        date: "March 15, 2026",
        time: "9:00 AM - 5:00 PM",
        location: "Mountain View Retreat Center",
        attendees: 8,
        maxAttendees: 30,
        imageUrl:
            "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400",
        isPast: false,
        isUpcoming: false,
        isAlmaExclusive: false,
        theme: "Renewal",
        price: "$150",
        includes: [
            "Yoga & meditation sessions",
            "Plant-based meals",
            "Forest bathing experience",
            "Sound bath healing",
            "Retreat gift bag",
        ],
        facilitator: "Maya Rodriguez",
        registrationUrl: "",
    },
    {
        id: "3",
        title: "Winter Solstice Gathering",
        description:
            "Celebrated the longest night with candlelit meditation, journaling, and community connection.",
        fullDescription:
            "We gathered on the longest night of the year for a magical evening of reflection and community. The event featured a candlelit meditation circle, guided journaling to release the old year and welcome the new, and a warming ceremony with hot cacao and shared intentions. Attendees created personal intention cards to carry into the new year.",
        date: "December 21, 2025",
        time: "6:00 PM - 9:00 PM",
        location: "Community Garden Pavilion",
        attendees: 35,
        maxAttendees: 35,
        imageUrl:
            "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400",
        isPast: true,
        isUpcoming: false,
        isAlmaExclusive: true,
        theme: "Reflection",
        price: "$45",
        includes: [
            "Candlelit meditation",
            "Hot cacao ceremony",
            "Journaling materials",
            "Intention card creation",
        ],
        facilitator: "James Wu",
        registrationUrl: "",
    },
    {
        id: "4",
        title: "Mindfulness in Nature",
        description:
            "An afternoon of forest bathing and outdoor meditation practices in the botanical gardens.",
        fullDescription:
            "This sold-out event took participants on a journey through the botanical gardens with guided mindfulness practices at each stop. We explored walking meditation, sensory awareness exercises, and seated meditation among the trees. The afternoon concluded with a tea ceremony in the Japanese garden section.",
        date: "November 8, 2025",
        time: "2:00 PM - 6:00 PM",
        location: "Botanical Gardens",
        attendees: 20,
        maxAttendees: 20,
        imageUrl:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
        isPast: true,
        isUpcoming: false,
        isAlmaExclusive: false,
        theme: "Nature",
        price: "$55",
        includes: [
            "Garden admission",
            "Guided forest bathing",
            "Tea ceremony",
            "Mindfulness guide booklet",
        ],
        facilitator: "Elena Park",
        registrationUrl: "",
    },
    {
        id: "5",
        title: "Gratitude Circle",
        description:
            "A Thanksgiving-themed gathering focused on gratitude practices and community sharing.",
        fullDescription:
            "In the spirit of Thanksgiving, we came together to explore the science and practice of gratitude. The evening included a gratitude meditation, sharing circle, and collaborative creation of a community gratitude mural. Attendees left with gratitude journals and daily practice cards.",
        date: "November 23, 2025",
        time: "4:00 PM - 7:00 PM",
        location: "Wellness Studio, Downtown",
        attendees: 25,
        maxAttendees: 25,
        imageUrl:
            "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
        isPast: true,
        isUpcoming: false,
        isAlmaExclusive: true,
        theme: "Gratitude",
        price: "$35",
        includes: [
            "Gratitude journal",
            "Guided meditation",
            "Light snacks",
            "Practice cards",
        ],
        facilitator: "Sarah Chen",
        registrationUrl: "",
    },
];

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

    // Apply filter
    const filteredRetreats = RETREATS.filter((r) => {
        if (filter === "exclusive") return r.isAlmaExclusive;
        if (filter === "partner") return !r.isAlmaExclusive;
        return true;
    });

    const upcomingRetreats = filteredRetreats.filter((r) => !r.isPast);
    const pastRetreats = filteredRetreats.filter((r) => r.isPast);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleFilterChange = (newFilter: RetreatFilter) => {
        setFilter(newFilter);
        setExpandedId(null);
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

                    {/* Upcoming Retreats */}
                    {upcomingRetreats.length > 0 && (
                        <View className="px-5 mt-6">
                            <Text className="text-lg font-semibold text-sage-900 mb-3">
                                Upcoming Retreats
                            </Text>
                            {upcomingRetreats.map((retreat, index) => (
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
                    {pastRetreats.length > 0 && (
                        <View className="px-5 mt-4">
                            <Text className="text-lg font-semibold text-sage-900 mb-3">
                                Past Retreats
                            </Text>
                            {pastRetreats.map((retreat, index) => (
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
                    {filteredRetreats.length === 0 && (
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
