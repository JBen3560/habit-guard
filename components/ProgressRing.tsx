import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const ProgressRing = ({
    progress,
    size = 160,
    strokeWidth = 11,
    color,
    trackColor,
    children,
}: Readonly<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    color: string;
    trackColor: string;
    children?: React.ReactNode;
}>) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const offset  = circumference - clamped * circumference;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
                <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
                <Circle
                    cx={cx} cy={cy} r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="none"
                    rotation="-90"
                    origin={`${cx},${cy}`}
                />
            </Svg>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
        </View>
    );
};

export default ProgressRing;
