import { View, Text, Image} from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'
import { icons } from '../../constants'
import { StatusBar } from 'expo-status-bar';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-1 pt-5">
      <Image
        source={icon}
        resizeMode="contain"
        className="w-6 h-6"
        tintColor={color}
      />
      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'}text-xs pb-4`} style={{color:color}}>{name}</Text>
    </View>
  );
};


const tabsConfig = [
  { name: 'home', title: 'Home', icon: icons.home },
  { name: 'bookmark', title: 'Bookmark', icon: icons.bookmark },
  { name: 'create', title: 'Create', icon: icons.plus },
  { name: 'profile', title: 'Profile', icon: icons.profile },
];

const tabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FFA001',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarStyle: {
            backgroundColor: '#161622',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 65,
          }
        }}
      >
        {tabsConfig.map(({ name, title, icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              headerShown: false,
              tabBarIcon: ({ color, focused }) => {
                return (
                  <TabIcon
                    icon={icon}
                    color={color}
                    name={title}
                    focused={focused}
                  />
                );
              }
            }}
          />
        ))}
      </Tabs>
      <StatusBar backgroundColor='#161622' style='light' />
    </>
  )
}

export default tabsLayout