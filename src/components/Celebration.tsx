import React, { useEffect } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { playCelebration } from "@/lib/sounds";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COUNT = 50;
const COLORS = [
  "#94a67e", // sage
  "#7fb3d3", // blue
  "#c4a7e7", // purple
  "#e7a7b8", // pink
  "#f5d6a8", // gold
  "#a7e7d3", // mint
];

interface ConfettiPiece {
  x: number;
  delay: number;
  color: string;
  rotation: number;
  size: number;
}

const generateConfetti = (): ConfettiPiece[] => {
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 500,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
  }));
};

interface ConfettiItemProps {
  piece: ConfettiPiece;
  onComplete?: () => void;
  index: number;
}

function ConfettiItem({ piece, onComplete, index }: ConfettiItemProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(piece.rotation);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const horizontalMovement = (Math.random() - 0.5) * 100;

    translateY.value = withDelay(
      piece.delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: 2500 + Math.random() * 1000,
        easing: Easing.out(Easing.quad),
      })
    );

    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(horizontalMovement, { duration: 800 }),
        withTiming(-horizontalMovement * 0.5, { duration: 600 }),
        withTiming(horizontalMovement * 0.3, { duration: 500 }),
        withTiming(0, { duration: 400 })
      )
    );

    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 720, {
        duration: 2500,
        easing: Easing.out(Easing.quad),
      })
    );

    opacity.value = withDelay(
      piece.delay + 2000,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished && index === CONFETTI_COUNT - 1 && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          left: piece.x,
          top: -20,
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          borderRadius: 2,
        },
      ]}
    />
  );
}

interface CelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export function Celebration({ visible, onComplete }: CelebrationProps) {
  const [confetti, setConfetti] = React.useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (visible) {
      setConfetti(generateConfetti());
      playCelebration(); // Play celebration sound
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confetti.map((piece, index) => (
        <ConfettiItem
          key={index}
          piece={piece}
          index={index}
          onComplete={onComplete}
        />
      ))}
    </View>
  );
}
