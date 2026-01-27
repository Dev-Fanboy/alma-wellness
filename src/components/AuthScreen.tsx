import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react-native";
import { signUpWithEmail, signInWithEmail } from "@/lib/supabase";
import { Plant } from "@/components/Plant";

interface AuthScreenProps {
    onAuthSuccess: () => void;
    onSkip?: () => void;
}

export function AuthScreen({ onAuthSuccess, onSkip }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);

        // Validation
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }

        if (!isLogin && !name.trim()) {
            setError("Please enter your name");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            if (isLogin) {
                const { error } = await signInWithEmail(email.trim(), password);
                if (error) {
                    setError(error.message);
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onAuthSuccess();
                }
            } else {
                const { error } = await signUpWithEmail(email.trim(), password, name.trim());
                if (error) {
                    setError(error.message);
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert(
                        "Check your email",
                        "We sent you a confirmation link. Please verify your email to continue.",
                        [{ text: "OK" }]
                    );
                }
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLogin(!isLogin);
        setError(null);
    };

    return (
        <View className="flex-1 bg-cream">
            <LinearGradient
                colors={["#d4dac9", "#e8ebe3", "#fdfbf7"]}
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="px-6 py-8">
                            {/* Logo/Plant */}
                            <Animated.View
                                entering={FadeInDown.delay(100).duration(600)}
                                className="items-center mb-8"
                            >
                                <Plant stage="blooming" level={15} size={120} />
                                <Text className="text-2xl font-bold text-sage-900 mt-4">
                                    {isLogin ? "Welcome Back" : "Join Alma"}
                                </Text>
                                <Text className="text-sage-600 mt-1 text-center">
                                    {isLogin
                                        ? "Continue your wellness journey"
                                        : "Start your wellness journey today"}
                                </Text>
                            </Animated.View>

                            {/* Form */}
                            <Animated.View
                                entering={FadeInUp.delay(200).duration(600)}
                                className="space-y-4"
                            >
                                {/* Name field (signup only) */}
                                {!isLogin && (
                                    <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center mb-3">
                                        <User size={20} color="#94a67e" />
                                        <TextInput
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="Your name"
                                            placeholderTextColor="#94a67e"
                                            className="flex-1 ml-3 text-sage-900 text-base"
                                            autoCapitalize="words"
                                        />
                                    </View>
                                )}

                                {/* Email */}
                                <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center mb-3">
                                    <Mail size={20} color="#94a67e" />
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="Email address"
                                        placeholderTextColor="#94a67e"
                                        className="flex-1 ml-3 text-sage-900 text-base"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                {/* Password */}
                                <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center mb-3">
                                    <Lock size={20} color="#94a67e" />
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Password"
                                        placeholderTextColor="#94a67e"
                                        className="flex-1 ml-3 text-sage-900 text-base"
                                        secureTextEntry={!showPassword}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <EyeOff size={20} color="#94a67e" />
                                        ) : (
                                            <Eye size={20} color="#94a67e" />
                                        )}
                                    </Pressable>
                                </View>

                                {/* Error message */}
                                {error && (
                                    <Text className="text-red-500 text-sm text-center mb-2">
                                        {error}
                                    </Text>
                                )}

                                {/* Submit button */}
                                <Pressable
                                    onPress={handleSubmit}
                                    disabled={loading}
                                    className={`rounded-2xl py-4 flex-row items-center justify-center mt-4 ${loading ? "bg-sage-400" : "bg-sage-600"
                                        }`}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white font-semibold text-lg mr-2">
                                                {isLogin ? "Sign In" : "Create Account"}
                                            </Text>
                                            <ArrowRight size={20} color="white" />
                                        </>
                                    )}
                                </Pressable>

                                {/* Toggle login/signup */}
                                <View className="flex-row justify-center mt-6">
                                    <Text className="text-sage-600">
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    </Text>
                                    <Pressable onPress={toggleMode}>
                                        <Text className="text-sage-700 font-semibold">
                                            {isLogin ? "Sign Up" : "Sign In"}
                                        </Text>
                                    </Pressable>
                                </View>

                                {/* Skip option */}
                                {onSkip && (
                                    <Pressable onPress={onSkip} className="mt-4">
                                        <Text className="text-sage-500 text-center">
                                            Continue without account
                                        </Text>
                                    </Pressable>
                                )}
                            </Animated.View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
