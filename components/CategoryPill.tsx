import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_META } from '@/src/mockData';
import { type Category, CATEGORY_COLORS } from '@/src/types';

const CategoryPill = ({ cat }: { cat: Category }) => {
    const color = CATEGORY_COLORS[cat];
    const icon  = CATEGORY_META[cat].icon as React.ComponentProps<typeof MaterialIcons>['name'];
    return (
        <View style={[s.pill, { backgroundColor: `${color}22` }]}>
            <MaterialIcons name={icon} size={11} color={color} />
            <Text style={[s.pillText, { color }]}>{cat}</Text>
        </View>
    );
};

export default CategoryPill;

const s = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        alignSelf: 'flex-start',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    pillText: { fontSize: 10, fontWeight: '700' },
});
