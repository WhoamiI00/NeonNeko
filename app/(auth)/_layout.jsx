import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const sign = [
  { type: 'sign-in' },
  { type: 'sign-up' }
];

const AuthLayout = () => {
  return (
    <>
    <Stack>
      {sign.map(({ type }) => (
        <Stack.Screen 
          key={type} 
          name={type}
          options={{
            headerShown: false
          }}
        />
      ))}
    </Stack>
    <StatusBar backgroundColor='#161622' style='light' />
    </>
  );
}

export default AuthLayout;
