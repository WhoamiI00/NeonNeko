import { View, Text, FlatList, Image, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import SearchInput from '../../components/SearchInput';
import EmptyState from '../../components/EmptyState';
import { getUserPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';

const Bookmark = () => {
  const { user } = useGlobalContext();
  const { data: likedPosts, refetch: refetchLikedPosts } = useAppwrite(() => getUserPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLikedPosts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary min-h-full">
      <FlatList
        data={likedPosts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          const videoId = item.$id;

          return (
            <VideoCard
              title={item.title}
              thumbnail={item.thumbnail}
              video={item.video}
              creator={item.users ? item.users.username : 'Unknown Creator'}
              avatar={item.users ? item.users.avatar : null}
              videoId={videoId}
              userId={item.users ? item.users.$id : null}
              prompt={item.prompt}
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
            subtitle="BookMark Videos Now"
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
