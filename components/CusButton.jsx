import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

const CusButton = ({ title, handlePress, containerStyles, textStyles, isLoadinng }) => {
    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoadinng ? 'opacity-50' : 'opacity-100'}`}
            disabled={isLoadinng}
        >
            <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>{title}</Text>
        </TouchableOpacity>
    );
}

export default CusButton;
