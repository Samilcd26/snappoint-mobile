import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserProfile,getUserPosts } from '@/api/user';
import { UserProfile } from '@/types/user.type';
import { ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { PostResponse } from '@/types/Post.type';


const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { id } = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<PostResponse>();
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.token);


  useEffect(() => {
    // Token yoksa login sayfasına yönlendir
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile(id as string);
        
        setUserProfile(data);
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const data = await getUserPosts(id as string,1,10);
        setUserPosts(data);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };


    fetchUserProfile();
    fetchUserPosts();
  }, [id, token]);


  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white">User not found</Text>
      </View>
    );
  }

  

  return (
    <ScrollView className="flex-1 ">
      {/* Header Card */}
      <ImageBackground
        source={require('../../assets/images/profile-background.jpg')}
        className="p-6 pt-12 overflow-hidden"
        style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
        blurRadius={20}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center space-x-4">
            <View className="shadow-xl">
              <Image 
                source={{ uri: userProfile.avatarUrl }}
                className="w-24 h-24 rounded-2xl border-2 border-white"
              />
            </View>
            <View className='ml-3'>
              <Text className="text-white text-2xl font-bold">{userProfile.username}</Text>
              <Text className="text-gray-100 text-base">{userProfile.bio}</Text>
            </View>
          </View>

          {userProfile.isOwner && (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              className="absolute right-0 top-0 bg-white/10 rounded-full"
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>

      {/* Stats Cards */}
      <View className="flex-row justify-between px-4 mt-4">
        <LinearGradient
          colors={['#580d46', '#ba1154']}
          style={{ borderRadius: 12 }}
          className="p-4 shadow-lg w-[48%]"
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        >
          <Text className="text-white font-semibold text-lg">Total Score</Text>
          <Text className="text-3xl font-bold mt-2 text-white">{userProfile.statistics.totalPoints}</Text>
          <Text className="text-gray-100 mt-1">Top {userProfile.statistics.percentile}%</Text>
        </LinearGradient>
        
        <LinearGradient
          colors={['#003b73', '#0067a9']}
          style={{ borderRadius: 12 }}
          className="p-4 shadow-lg w-[48%]"
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        >
          <Text className="text-white font-semibold text-lg">Achievement</Text>
          <Text className="text-white mt-2">{userProfile.mainAchievement?.name}</Text>
        </LinearGradient>
      </View>

      {/* Activity Stats */}
      <LinearGradient
        colors={['#00395c', '#006b78']}
        style={{ borderRadius: 12 }}
        className="mx-4 mt-6 shadow-lg"
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      >
        <View className="flex-row justify-around p-6">
          <View className="items-center">
            <Text className="text-3xl font-bold text-white">{userProfile.statistics.totalPosts}</Text>
            <Text className="text-gray-100 mt-1">Posts</Text>
          </View>
          <View className="items-center border-x border-white/20 px-8">
            <Text className="text-3xl font-bold text-white">{userProfile.statistics.followers}</Text>
            <Text className="text-gray-100 mt-1">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-white">{userProfile.statistics.following}</Text>
            <Text className="text-gray-100 mt-1">Following</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content Grid */}
      <View className="flex-row flex-wrap px-2 mt-6">
        {userPosts?.photos.map((post, index) => (
          <TouchableOpacity 
            key={index}
            className="w-1/3 aspect-square p-1"
            onPress={() => router.push(`/post/${id}/${index}`)}
          >
            <View className="relative w-full h-full shadow-md">
              <Image
                source={{ uri: post.imageUrl }}
                className="w-full h-full rounded-xl"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                className="absolute bottom-0 left-0 right-0 h-12 rounded-b-xl"
              >
                <View className="absolute bottom-2 left-2 flex-row items-center">
                  <View className="flex-row items-center">
                    <Ionicons name="heart" size={16} color="white" />
                    <Text className="text-white text-sm ml-1">{post.likeCount}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
