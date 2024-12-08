import { View, Text, FlatList, Image, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import SearchInput from '../../components/SearchInput';
import EmptyState from '../../components/EmptyState';
import { getAllPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';

const Bookmark = () => {
  const { user } = useGlobalContext();
  const { data: allPosts, refetch: refetchLikedPosts } = useAppwrite(() => getAllPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);

  const likedVideoIds = user?.likedVideos?.map((video) => video.$id) || [];
  const likedPosts = allPosts?.filter((post) => likedVideoIds.includes(post.$id)) || [];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchLikedPosts()]);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary min-h-full">
      <FlatList
        data={likedPosts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          const videoId = item.$id;
          const likedBy = item.likedBy;
          const user = item.users;
          return (
            <VideoCard
              title={item.title}
              thumbnail={item.thumbnail}
              video={item.video}
              creator={user ? user : 'Unknown Creator'}
              avatar={item.users ? item.users.avatar : null}
              videoId={videoId}
              userId={item.users ? item.users.$id : null}
              prompt={item.prompt}
              likedBy={likedBy}
              isProfile={false}
            />
          );
        }}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  {user ? user.username : 'Welcome'}'s
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  Saved Videos
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>
            <SearchInput />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Bookmark Videos Now"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
