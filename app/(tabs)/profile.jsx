import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, View, Image, FlatList, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { RefreshControl } from "react-native";

import { useState } from "react";
import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getUserPosts, signOut, changeAvatar } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "../../components/EmptyState";
import VideoCard from "../../components/VideoCard";
import InfoBox from "../../components/InfoBox";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  const handleChangeAvatar = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png"],
    });

    if (!result.canceled) {
      try {
        const updatedUser = await changeAvatar(result.assets[0]);
        setUser(updatedUser);
        Alert.alert("Success", "Avatar updated successfully");
      } catch (error) {
        console.log(error);
        Alert.alert("Error", error.message);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch(); // Call refetch to get the latest user posts
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          const videoId = item.$id; // Get the video ID
          const userId = user ? user.$id : null; // Get the current user's ID

          return (
            <VideoCard
              title={item.title}
              thumbnail={item.thumbnail}
              video={item.video}
              creator={item.users.username}
              avatar={item.users.avatar}
              videoId={videoId} // Pass the videoId
              userId={userId} // Pass the current user's ID
              prompt={item.prompt}
            />
          );
        }}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this profile"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handleChangeAvatar}
                className="absolute"
              >
                <Image source={icons.plus} className="h-6 w-6 left-7 bottom-7"/>
              </TouchableOpacity>
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;
