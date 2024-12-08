import { useState, useEffect } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { icons } from "../constants";
import { updateUserLikes, deleteVideoPost } from "../lib/appwrite"; 
import { useGlobalContext } from "../context/GlobalProvider";
import { router, usePathname } from "expo-router";

const VideoCard = ({ title, creator, avatar, thumbnail, video, videoId, prompt, likedBy,isProfile }) => {
  const pathname = usePathname();
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);
  const [isLiked, setIsLiked] = useState(false); 
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (user && likedBy) {
      setIsLiked(likedBy.some((liker) => liker.$id === user.$id)); 
    }
  }, [user, likedBy]);

  const liked = async () => {
    if (!user) return;

    try {
      const userId = user.$id;
      await updateUserLikes(userId, videoId,isLiked);
      setIsLiked(!isLiked);  

    } catch (error) {
      console.error("Error updating like:", error.message);
    }
  };

  const togglePrompt = () => {
    setShowPrompt((prev) => !prev);
  };

  const deleteVideo = async () => {
    try {
      await deleteVideoPost(videoId);
      Alert("Post Deleted SuccessFully!");
    } catch (error) {
      // console.error("Error deleting video:", error.message);
    } finally {
      router.replace("/home");
    }
  };

  const creatorId = creator.$id;

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text className="font-psemibold text-sm text-white" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1} 
              onPress={() => {
                if (creatorId === "")
                  return Alert.alert(
                    "Missing Query",
                    "Please input something to search results across database"
                  );
      
                if (pathname.startsWith("/search/profile")) router.setParams({ creatorId });
                else router.push(`/search/profile/${creatorId}`);
              }}>
              {creator.username}
            </Text>
          </View>
        </View>

        {/* Like button */}
        <TouchableOpacity className="pt-2" activeOpacity={0.7} onPress={liked}>
          <Image 
            source={isLiked ? icons.bookmark : icons.heart} 
            className="w-5 h-5 opacity-50"
            resizeMode="contain" 
          />
        </TouchableOpacity>
        
        {/* Prompt button */}
        <TouchableOpacity className="pt-2" activeOpacity={0.7} onPress={togglePrompt}>
          <Image source={icons.eye} className="w-7 h-7 bottom-1" resizeMode="contain" />
        </TouchableOpacity>
        
        {/* Delete button (only for the video creator when in Profile Section) */}
        {user && isProfile &&user.$id === creator.$id ? ( 
          <TouchableOpacity className="pt-2" activeOpacity={0.7} onPress={deleteVideo}>
            <Image source={icons.deleteIcon} className="w-7 h-7 bottom-1" resizeMode="contain" />
          </TouchableOpacity>
        ) : null} 
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {/* Prompt for additional options */}
      {showPrompt && (
        <View className="absolute top-16 left-1/2 transform -translate-x-1/2 w-auto max-w-[80%] bg-black bg-opacity-80 rounded-lg p-4 shadow-lg flex items-center">
          <Text className="text-white text-center">{prompt}</Text>
          <TouchableOpacity onPress={togglePrompt} className="mt-2">
            <Text className="text-blue-400">Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default VideoCard;
