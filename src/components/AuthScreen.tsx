import React, { useState, useEffect } from "react";
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
import Animated, { FadeInUp, FadeInDown, Layout } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, Circle, AlertCircle } from "lucide-react-native";
import { signUpWithEmail, signInWithEmail } from "@/lib/supabase";
import { Plant } from "@/components/Plant";

interface AuthScreenProps {
    onAuthSuccess: () => void;
    onSkip?: () => void;
}

interface PasswordValidation {
    isValid: boolean;
    hasLength: boolean;
    hasUpperCase: boolean;
    hasNumber: boolean;
}

const validatePassword = (password: string): PasswordValidation => {
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
        isValid: hasLength && hasUpperCase && hasNumber,
        hasLength,
        hasUpperCase,
        hasNumber,
    };
};

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View className="flex-row items-center mb-1.5">
        {met ? (
            <Check size={14} color="#5c6e4a" strokeWidth={3} />
        ) : (
            <Circle size={14} color="#94a67e" strokeWidth={2} />
        )}
        <Text className={`ml-2 text-xs ${met ? "text-sage-800 font-medium" : "text-sage-500"}`}>
            {text}
        </Text>
    </View>
);

export function AuthScreen({ onAuthSuccess, onSkip }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validation, setValidation] = useState<PasswordValidation>({
        isValid: false,
        hasLength: false,
        hasUpperCase: false,
        hasNumber: false,
    });

    useEffect(() => {
        setValidation(validatePassword(password));
    }, [password]);

    const handleSubmit = async () => {
        setError(null);

        // Basic Empty Check
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (!isLogin && !name.trim()) {
            setError("Please enter your name");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        // Strict Password Validation for Sign Up
        if (!isLogin && !validation.isValid) {
            setError("Please meet all password requirements");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            if (isLogin) {
                const { error } = await signInWithEmail(email.trim(), password);
                if (error) {
                    setError(error.message);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onAuthSuccess();
                }
            } else {
                const { error } = await signUpWithEmail(email.trim(), password, name.trim());
                if (error) {
                    setError(error.message);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        // Clear fields on toggle for cleaner UX? Optional, keeping data for now to avoid frustration
    };

    return (
        <View className="flex-1 bg-cream">
            <LinearGradient
                colors={["#e8ebe3", "#fdfbf7", "#fdfbf7"]}
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
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="px-8 py-8">
                            {/* Logo/Plant */}
                            <Animated.View
                                entering={FadeInDown.delay(100).duration(800)}
                                className="items-center mb-10"
                            >
                                <View className="bg-sage-50/50 p-6 rounded-full mb-4">
                                    <Plant stage="blooming" level={15} size={100} />
                                </View>
                                <Text className="text-3xl font-bold text-sage-900 tracking-tight">
                                    {isLogin ? "Welcome Back" : "Join Alma"}
                                </Text>
                                <Text className="text-sage-600 mt-2 text-center text-base">
                                    {isLogin
                                        ? "Continue your wellness journey"
                                        : "Start your wellness journey today"}
                                </Text>
                            </Animated.View>

                            {/* Form */}
                            <Animated.View
                                entering={FadeInUp.delay(200).duration(800)}
                                className="space-y-5"
                            >
                                {/* Name field (signup only) */}
                                {!isLogin && (
                                    <View className="bg-white rounded-2xl px-5 py-4 flex-row items-center shadow-sm border border-sage-50">
                                        <User size={20} color="#94a67e" strokeWidth={1.5} />
                                        <TextInput
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="Your name"
                                            placeholderTextColor="#b5c1a5"
                                            className="flex-1 ml-4 text-sage-900 text-base"
                                            autoCapitalize="words"
                                        />
                                    </View>
                                )}

                                {/* Email */}
                                <View className="bg-white rounded-2xl px-5 py-4 flex-row items-center shadow-sm border border-sage-50">
                                    <Mail size={20} color="#94a67e" strokeWidth={1.5} />
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="Email address"
                                        placeholderTextColor="#b5c1a5"
                                        className="flex-1 ml-4 text-sage-900 text-base"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                {/* Password */}
                                <View>
                                    <View className="bg-white rounded-2xl px-5 py-4 flex-row items-center shadow-sm border border-sage-50">
                                        <Lock size={20} color="#94a67e" strokeWidth={1.5} />
                                        <TextInput
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="Password"
                                            placeholderTextColor="#b5c1a5"
                                            className="flex-1 ml-4 text-sage-900 text-base"
                                            secureTextEntry={!showPassword}
                                        />
                                        <Pressable
                                            onPress={() => setShowPassword(!showPassword)}
                                            hitSlop={10}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} color="#94a67e" strokeWidth={1.5} />
                                            ) : (
                                                <Eye size={20} color="#94a67e" strokeWidth={1.5} />
                                            )}
                                        </Pressable>
                                    </View>

                                    {/* Password Strength Checklist - Sign Up Only */}
                                    {!isLogin && (
                                        <Animated.View
                                            layout={Layout.springify()}
                                            className="mt-3 ml-2 px-2"
                                        >
                                            <PasswordRequirement
                                                met={validation.hasLength}
                                                text="At least 8 characters"
                                            />
                                            <PasswordRequirement
                                                met={validation.hasUpperCase}
                                                text="At least one uppercase letter"
                                            />
                                            <PasswordRequirement
                                                met={validation.hasNumber}
                                                text="At least one number"
                                            />
                                        </Animated.View>
                                    )}
                                </View>

                                {/* Error message */}
                                {error && (
                                    <Animated.View
                                        entering={FadeInUp.duration(300)}
                                        className="bg-red-50 rounded-xl p-3 flex-row items-center justify-center border border-red-100"
                                    >
                                        <AlertCircle size={16} color="#ef4444" strokeWidth={2} />
                                        <Text className="text-red-500 text-sm ml-2 font-medium">
                                            {error}
                                        </Text>
                                    </Animated.View>
                                )}

                                {/* Submit button */}
                                <Pressable
                                    onPress={handleSubmit}
                                    disabled={loading}
                                    className={`rounded-2xl py-4 flex-row items-center justify-center mt-2 shadow-md hover:opacity-90 active:scale-95 transition-all ${loading ? "bg-sage-400" : "bg-sage-800"
                                        }`}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white font-semibold text-lg mr-2 tracking-wide">
                                                {isLogin ? "Sign In" : "Create Account"}
                                            </Text>
                                            <ArrowRight size={20} color="white" strokeWidth={2} />
                                        </>
                                    )}
                                </Pressable>

                                {/* Toggle login/signup */}
                                <View className="flex-row justify-center mt-8">
                                    <Text className="text-sage-600">
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    </Text>
                                    <Pressable onPress={toggleMode} hitSlop={10}>
                                        <Text className="text-sage-800 font-bold">
                                            {isLogin ? "Sign Up" : "Sign In"}
                                        </Text>
                                    </Pressable>
                                </View>

                                {/* Skip option */}
                                {onSkip && (
                                    <Pressable onPress={onSkip} className="mt-4 py-2" hitSlop={10}>
                                        <Text className="text-sage-500 text-center text-sm">
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
