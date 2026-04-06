import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DAY_LABELS, getColors } from '@/src/types';

const DayToggle = ({
    days,
    onChange,
    C,
}: Readonly<{
    days: boolean[];
    onChange: (i: number) => void;
    C: ReturnType<typeof getColors>;
}>) => (
    <View style={s.dayRow}>
        {DAY_LABELS.map((d, i) => (
            <TouchableOpacity
                key={i}
                onPress={() => onChange(i)}
                style={[
                    s.dayBtn,
                    { borderColor: C.border, backgroundColor: C.card },
                    days[i] && { backgroundColor: C.blue, borderColor: C.blue },
                ]}
            >
                <Text style={[s.dayBtnText, { color: C.sub }, days[i] && { color: '#fff' }]}>
                    {d}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

export default DayToggle;

const s = StyleSheet.create({
    dayRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    dayBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    dayBtnText: { fontSize: 13, fontWeight: '600' },
});
