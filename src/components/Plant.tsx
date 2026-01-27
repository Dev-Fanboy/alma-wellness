import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Svg, { Path, Circle, Ellipse, G } from "react-native-svg";

type PlantStage = "seed" | "sprout" | "growing" | "budding" | "blooming";

interface PlantProps {
  stage: PlantStage;
  level: number;
  size?: number;
}

const AnimatedG = Animated.createAnimatedComponent(G);

export function Plant({ stage, level, size = 200 }: PlantProps) {
  const sway = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Gentle swaying animation
    sway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Scale in animation
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Glow pulse for blooming
    if (stage === "blooming") {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [stage]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value * 3}deg` }],
  }));

  const renderPlant = () => {
    const plantHeight = size * 0.8;
    const centerX = size / 2;
    const groundY = size * 0.85;

    switch (stage) {
      case "seed":
        return (
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Soil mound */}
            <Ellipse
              cx={centerX}
              cy={groundY}
              rx={size * 0.25}
              ry={size * 0.08}
              fill="#8B7355"
            />
            <Ellipse
              cx={centerX}
              cy={groundY - 5}
              rx={size * 0.2}
              ry={size * 0.05}
              fill="#A0826D"
            />
            {/* Seed */}
            <Ellipse
              cx={centerX}
              cy={groundY - 15}
              rx={size * 0.06}
              ry={size * 0.08}
              fill="#5c6e4a"
            />
            {/* Tiny crack showing life */}
            <Path
              d={`M ${centerX - 3} ${groundY - 18} Q ${centerX} ${groundY - 25} ${centerX + 2} ${groundY - 20}`}
              stroke="#94a67e"
              strokeWidth={2}
              fill="none"
            />
          </Svg>
        );

      case "sprout":
        return (
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Soil */}
            <Ellipse
              cx={centerX}
              cy={groundY}
              rx={size * 0.3}
              ry={size * 0.1}
              fill="#8B7355"
            />
            {/* Stem */}
            <Path
              d={`M ${centerX} ${groundY - 5} Q ${centerX + 5} ${groundY - 40} ${centerX} ${groundY - 60}`}
              stroke="#5c6e4a"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            {/* First leaves */}
            <Path
              d={`M ${centerX} ${groundY - 50} Q ${centerX - 25} ${groundY - 65} ${centerX - 5} ${groundY - 45}`}
              fill="#94a67e"
            />
            <Path
              d={`M ${centerX} ${groundY - 50} Q ${centerX + 25} ${groundY - 65} ${centerX + 5} ${groundY - 45}`}
              fill="#94a67e"
            />
          </Svg>
        );

      case "growing":
        return (
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Soil */}
            <Ellipse
              cx={centerX}
              cy={groundY}
              rx={size * 0.35}
              ry={size * 0.1}
              fill="#8B7355"
            />
            {/* Main stem */}
            <Path
              d={`M ${centerX} ${groundY - 5} Q ${centerX + 8} ${groundY - 60} ${centerX} ${groundY - 100}`}
              stroke="#49573c"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            {/* Lower leaves */}
            <Path
              d={`M ${centerX} ${groundY - 30} Q ${centerX - 40} ${groundY - 50} ${centerX - 10} ${groundY - 25}`}
              fill="#778b5f"
            />
            <Path
              d={`M ${centerX} ${groundY - 30} Q ${centerX + 40} ${groundY - 50} ${centerX + 10} ${groundY - 25}`}
              fill="#778b5f"
            />
            {/* Middle leaves */}
            <Path
              d={`M ${centerX} ${groundY - 55} Q ${centerX - 35} ${groundY - 80} ${centerX - 8} ${groundY - 50}`}
              fill="#94a67e"
            />
            <Path
              d={`M ${centerX} ${groundY - 55} Q ${centerX + 35} ${groundY - 80} ${centerX + 8} ${groundY - 50}`}
              fill="#94a67e"
            />
            {/* Top leaves */}
            <Path
              d={`M ${centerX} ${groundY - 85} Q ${centerX - 25} ${groundY - 110} ${centerX - 5} ${groundY - 80}`}
              fill="#b5c1a5"
            />
            <Path
              d={`M ${centerX} ${groundY - 85} Q ${centerX + 25} ${groundY - 110} ${centerX + 5} ${groundY - 80}`}
              fill="#b5c1a5"
            />
          </Svg>
        );

      case "budding":
        return (
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Soil */}
            <Ellipse
              cx={centerX}
              cy={groundY}
              rx={size * 0.35}
              ry={size * 0.1}
              fill="#8B7355"
            />
            {/* Main stem */}
            <Path
              d={`M ${centerX} ${groundY - 5} Q ${centerX + 8} ${groundY - 70} ${centerX} ${groundY - 120}`}
              stroke="#49573c"
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
            {/* Lower leaves */}
            <Path
              d={`M ${centerX} ${groundY - 35} Q ${centerX - 45} ${groundY - 60} ${centerX - 12} ${groundY - 30}`}
              fill="#5c6e4a"
            />
            <Path
              d={`M ${centerX} ${groundY - 35} Q ${centerX + 45} ${groundY - 60} ${centerX + 12} ${groundY - 30}`}
              fill="#5c6e4a"
            />
            {/* Middle leaves */}
            <Path
              d={`M ${centerX} ${groundY - 65} Q ${centerX - 40} ${groundY - 95} ${centerX - 10} ${groundY - 60}`}
              fill="#778b5f"
            />
            <Path
              d={`M ${centerX} ${groundY - 65} Q ${centerX + 40} ${groundY - 95} ${centerX + 10} ${groundY - 60}`}
              fill="#778b5f"
            />
            {/* Upper leaves */}
            <Path
              d={`M ${centerX} ${groundY - 95} Q ${centerX - 30} ${groundY - 125} ${centerX - 8} ${groundY - 90}`}
              fill="#94a67e"
            />
            <Path
              d={`M ${centerX} ${groundY - 95} Q ${centerX + 30} ${groundY - 125} ${centerX + 8} ${groundY - 90}`}
              fill="#94a67e"
            />
            {/* Bud */}
            <Ellipse
              cx={centerX}
              cy={groundY - 130}
              rx={size * 0.08}
              ry={size * 0.1}
              fill="#e7a7b8"
            />
            <Path
              d={`M ${centerX - 8} ${groundY - 125} Q ${centerX} ${groundY - 145} ${centerX + 8} ${groundY - 125}`}
              fill="#d4a7c7"
            />
          </Svg>
        );

      case "blooming":
        return (
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Glow effect */}
            <Circle
              cx={centerX}
              cy={groundY - 135}
              r={size * 0.2}
              fill="#f5e6d3"
              opacity={0.4}
            />
            {/* Soil */}
            <Ellipse
              cx={centerX}
              cy={groundY}
              rx={size * 0.35}
              ry={size * 0.1}
              fill="#8B7355"
            />
            {/* Main stem */}
            <Path
              d={`M ${centerX} ${groundY - 5} Q ${centerX + 8} ${groundY - 70} ${centerX} ${groundY - 115}`}
              stroke="#49573c"
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
            {/* Lower leaves */}
            <Path
              d={`M ${centerX} ${groundY - 35} Q ${centerX - 50} ${groundY - 65} ${centerX - 15} ${groundY - 30}`}
              fill="#5c6e4a"
            />
            <Path
              d={`M ${centerX} ${groundY - 35} Q ${centerX + 50} ${groundY - 65} ${centerX + 15} ${groundY - 30}`}
              fill="#5c6e4a"
            />
            {/* Middle leaves */}
            <Path
              d={`M ${centerX} ${groundY - 65} Q ${centerX - 45} ${groundY - 100} ${centerX - 12} ${groundY - 60}`}
              fill="#778b5f"
            />
            <Path
              d={`M ${centerX} ${groundY - 65} Q ${centerX + 45} ${groundY - 100} ${centerX + 12} ${groundY - 60}`}
              fill="#778b5f"
            />
            {/* Upper leaves */}
            <Path
              d={`M ${centerX} ${groundY - 90} Q ${centerX - 35} ${groundY - 125} ${centerX - 10} ${groundY - 85}`}
              fill="#94a67e"
            />
            <Path
              d={`M ${centerX} ${groundY - 90} Q ${centerX + 35} ${groundY - 125} ${centerX + 10} ${groundY - 85}`}
              fill="#94a67e"
            />
            {/* Flower petals */}
            <Ellipse
              cx={centerX - 18}
              cy={groundY - 145}
              rx={size * 0.07}
              ry={size * 0.1}
              fill="#f5d6e3"
              transform={`rotate(-30 ${centerX - 18} ${groundY - 145})`}
            />
            <Ellipse
              cx={centerX + 18}
              cy={groundY - 145}
              rx={size * 0.07}
              ry={size * 0.1}
              fill="#f5d6e3"
              transform={`rotate(30 ${centerX + 18} ${groundY - 145})`}
            />
            <Ellipse
              cx={centerX - 12}
              cy={groundY - 160}
              rx={size * 0.06}
              ry={size * 0.09}
              fill="#f8e4ec"
              transform={`rotate(-15 ${centerX - 12} ${groundY - 160})`}
            />
            <Ellipse
              cx={centerX + 12}
              cy={groundY - 160}
              rx={size * 0.06}
              ry={size * 0.09}
              fill="#f8e4ec"
              transform={`rotate(15 ${centerX + 12} ${groundY - 160})`}
            />
            <Ellipse
              cx={centerX}
              cy={groundY - 165}
              rx={size * 0.055}
              ry={size * 0.085}
              fill="#fff0f5"
            />
            {/* Flower center */}
            <Circle cx={centerX} cy={groundY - 145} r={size * 0.045} fill="#f5c6d6" />
            <Circle cx={centerX} cy={groundY - 145} r={size * 0.025} fill="#e7a7b8" />
          </Svg>
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View style={containerStyle}>
      <Animated.View style={swayStyle}>{renderPlant()}</Animated.View>
    </Animated.View>
  );
}
