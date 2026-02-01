import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { X, Users, Copy, Check, Share2 } from "lucide-react-native";
import { Plant } from "@/components/Plant";

interface CreateGroveModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateGrove: (name: string) => Promise<{ success: boolean; grove?: any; error?: string }>;
}

export function CreateGroveModal({ visible, onClose, onCreateGrove }: CreateGroveModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [createdGrove, setCreatedGrove] = useState<{ name: string; inviteCode: string } | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        setError(null);

        const result = await onCreateGrove(name.trim());

        setLoading(false);

        if (result.success && result.grove) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setCreatedGrove({
                name: result.grove.name,
                inviteCode: result.grove.invite_code,
            });
        } else {
            setError(result.error || "Failed to create garden");
        }
    };

    const handleCopyCode = async () => {
        if (!createdGrove) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await Clipboard.setStringAsync(createdGrove.inviteCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleClose = () => {
        setName("");
        setCreatedGrove(null);
        setCopiedCode(false);
        setError(null);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-cream rounded-t-3xl pt-6 pb-10 px-5">
                    {/* Handle */}
                    <View className="w-10 h-1 bg-sage-300 rounded-full self-center mb-6" />

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-xl font-bold text-sage-900">
                            {createdGrove ? "Garden Created!" : "Create a Garden"}
                        </Text>
                        <Pressable
                            onPress={handleClose}
                            className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center"
                        >
                            <X size={20} color="#49573c" />
                        </Pressable>
                    </View>

                    {!createdGrove ? (
                        <>
                            {/* Illustration */}
                            <View className="items-center mb-6">
                                <View className="w-20 h-20 rounded-full bg-sage-100 items-center justify-center mb-4">
                                    <Users size={40} color="#5c6e4a" />
                                </View>
                                <Text className="text-sage-600 text-center">
                                    Create a private garden where anyone with the code can join
                                    and grow together.
                                </Text>
                            </View>

                            {/* Name Input */}
                            <View className="mb-4">
                                <Text className="text-sm text-sage-600 mb-2">Garden Name</Text>
                                <TextInput
                                    placeholder="e.g., Wellness Warriors"
                                    placeholderTextColor="#94a67e"
                                    value={name}
                                    onChangeText={setName}
                                    maxLength={30}
                                    className="bg-white rounded-xl px-4 py-3 text-sage-900"
                                />
                                <Text className="text-xs text-sage-400 mt-1 text-right">
                                    {name.length}/30
                                </Text>
                            </View>

                            {/* Error */}
                            {error && (
                                <View className="bg-red-50 rounded-xl px-4 py-3 mb-4">
                                    <Text className="text-red-600 text-center">{error}</Text>
                                </View>
                            )}

                            {/* Create Button */}
                            <Pressable
                                onPress={handleCreate}
                                disabled={!name.trim() || loading}
                                className={`rounded-2xl py-4 items-center justify-center ${!name.trim() || loading ? "bg-sage-300" : "bg-sage-500"
                                    }`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-semibold text-lg">
                                        Create Garden
                                    </Text>
                                )}
                            </Pressable>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <View className="items-center mb-6">
                                <View className="flex-row items-end mb-4">
                                    <Plant stage="sprout" level={3} size={50} />
                                    <Plant stage="growing" level={8} size={70} />
                                    <Plant stage="sprout" level={5} size={55} />
                                </View>
                                <Text className="text-lg font-semibold text-sage-800 text-center">
                                    {createdGrove.name}
                                </Text>
                                <Text className="text-sage-600 text-center mt-1">
                                    Share the code below to invite members!
                                </Text>
                            </View>

                            {/* Invite Code */}
                            <View className="bg-white rounded-2xl p-4 mb-4">
                                <Text className="text-sm text-sage-500 mb-2">
                                    Garden Invite Code
                                </Text>
                                <View className="flex-row items-center">
                                    <View className="flex-1 bg-sage-50 rounded-xl px-4 py-3">
                                        <Text className="text-xl font-bold text-sage-800 text-center tracking-widest">
                                            {createdGrove.inviteCode}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={handleCopyCode}
                                        className={`ml-3 w-12 h-12 rounded-xl items-center justify-center ${copiedCode ? "bg-green-500" : "bg-sage-100"
                                            }`}
                                    >
                                        {copiedCode ? (
                                            <Check size={20} color="white" />
                                        ) : (
                                            <Copy size={20} color="#5c6e4a" />
                                        )}
                                    </Pressable>
                                </View>
                            </View>

                            {/* Done Button */}
                            <Pressable
                                onPress={handleClose}
                                className="bg-sage-500 rounded-2xl py-4 items-center justify-center"
                            >
                                <Text className="text-white font-semibold text-lg">
                                    Done
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}
