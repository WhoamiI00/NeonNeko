import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, View, Image, FlatList, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { RefreshControl } from "react-native";

import { useState, useEffect } from "react";
import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts, signOut, changeAvatar } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "../../components/EmptyState";
import VideoCard from "../../components/VideoCard";
import InfoBox from "../../components/InfoBox";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() => getAllPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (posts) {
      const userPosts = posts.filter(post => post.users.$id === user.$id);
      setCount(userPosts.length);
    }
  }, [posts, user.$id]);

  const logout = async () => {
    await signOut();
    setIsLogged(false);
    router.replace("/sign-in");
    setUser(null);
  };

  const handleChangeAvatar = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "image/jpg"],
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
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          const videoId = item.$id;
          const likedBy = item.likedBy;
          const userV = item.users;
          if (user.$id !== userV.$id) return (<></>);
          return (
            <VideoCard
              title={item.title}
              thumbnail={item.thumbnail}
              video={item.video}
              creator={userV ? userV : 'Unknown Creator'}
              avatar={item.users ? item.users.avatar : null}
              videoId={videoId}
              userId={item.users ? item.users.$id : null}
              prompt={item.prompt}
              likedBy={likedBy}
              isProfile={true}
            />
          );
        }}
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
                <Image source={icons.plus} className="h-6 w-6 left-7 bottom-7" />
              </TouchableOpacity>
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={count}
                subtitle="Posts"
                titleStyles="text-xl"
              />
              {/* <InfoBox
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              /> */}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {count === 0 ? (
        <EmptyState
          title="No Videos Found"
          subtitle="No videos found for this profile"
        />
      ) : null}
    </SafeAreaView>
  );
};

export default Profile;
