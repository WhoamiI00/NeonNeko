import { View, Text, TextInput, Image } from 'react-native';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { icons } from '../constants';

const FormField = ({ title, value, placeHolder, handleChangeText, otherStyles }) => {
    const [showPass, setShowPass] = useState(false);

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-pmedium">{title}</Text>
            <View className="flex-row border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center">
                <TextInput
                    className="flex-1 text-white font-psemibold text-base"
                    value={value}
                    placeholder={placeHolder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    secureTextEntry={title === 'Password' && !showPass}
                />
                {title === 'Password' && (
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                        <Image source={!showPass ? icons.eye : icons.eyeHide} className="w-8 h-8" resizeMode='contain' />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export default FormField;
