import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * A container with high-end rounded corners (iOS-like)
 */
export const Squircle = ({ children, style, size = 40, color = '#eee' }) => {
    return (
        <View style={[
            styles.container,
            { width: size, height: size, backgroundColor: color, borderRadius: size * 0.4 },
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
});
