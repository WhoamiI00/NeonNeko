import { router, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, View, Image, FlatList, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { RefreshControl } from "react-native";

import { useState, useEffect } from "react";
import { icons } from "../../../constants";
import useAppwrite from "../../../lib/useAppwrite";
import { getAllPosts, signOut, changeAvatar } from "../../../lib/appwrite";
import { useGlobalContext } from "../../../context/GlobalProvider";
import EmptyState from "../../../components/EmptyState";
import VideoCard from "../../../components/VideoCard";
import InfoBox from "../../../components/InfoBox";
import { useLocalSearchParams } from "expo-router";
const Profile = () => {
  const router = useRouter();
  const { user, setUser, setIsLogged } = useGlobalContext();
  
  // Get the dynamic userId from the URL
  
  const { userId } = useLocalSearchParams();
  
  const { data: posts, refetch } = useAppwrite(() => getAllPosts(userId));
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (posts) {
      const userPosts = posts.filter(post => post.users.$id === userId);
      setCount(userPosts.length);
    }
  }, [posts, userId]);

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

  const userProfile = posts?.find(post => post.users.$id === userId)?.users;

  return (
    <SafeAreaView className="bg-primary h-full">
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          const videoId = item.$id;
          const likedBy = item.likedBy;
          const userV = item.users;
          if (userId !== userV.$id) return (<></>);  // Filter posts to show only for this user
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
              isProfile={userId === user?.$id} // Allow deleting only if the user is logged in
            />
          );
        }}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: userProfile?.avatar || user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
              {userId === user?.$id && (
                <TouchableOpacity
                  onPress={handleChangeAvatar}
                  className="absolute"
                >
                  <Image source={icons.plus} className="h-6 w-6 left-7 bottom-7" />
                </TouchableOpacity>
              )}
            </View>

            <InfoBox
              title={userProfile?.username || user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={count}
                subtitle="Posts"
                titleStyles="text-xl"
                // containerStyles="mr-10"
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
    </SafeAreaView>
  );
};

export default Profile;
