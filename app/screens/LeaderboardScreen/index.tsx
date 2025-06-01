import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetLeaderboard } from '@/api/leaderboard';
import { LeaderboardUser } from '@/types/Leaderboard';
import { useRouter } from 'expo-router';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly' | 'nearby'>('global');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [profileImageModalVisible, setProfileImageModalVisible] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string>('');
  const { width } = Dimensions.get('window');

  const { data: leaderboardData, isLoading: leaderboardLoading, error: leaderboardError } = useGetLeaderboard(activeTab,page,pageSize,categoryId,latitude,longitude,maxDistance);
  
  // Function to get tab title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'nearby':
        return 'Nearby Ranking (200m)';
      case 'weekly':
        return 'Weekly Leaders';
      case 'monthly':
        return 'Monthly Leaders';
      default:
        return 'Global Leaders';
    }
  };

  // Handle category selection
  const handleCategorySelect = (id: string | null) => {
    setCategoryId(id);
    setPage(1); // Reset to first page when changing category
  };

  // Refresh leaderboard data
  const handleRefresh = () => {
    setPage(1); // Reset to first page on refresh
  };

  // Load more data when reaching the end of the list
  const handleLoadMore = () => {
    if (!leaderboardLoading && leaderboardData?.pagination && page < leaderboardData.pagination.total_pages) {
      setPage(prev => prev + 1);
    }
  };

  // Navigate to user profile
  const handleUserPress = (userId: string) => {
    router.push(`/screens/UserProfileScreen?userId=${userId}`);
  };

  // Show profile image modal
  const handleProfileImagePress = (imageUrl: string) => {
    setSelectedProfileImage(imageUrl);
    setProfileImageModalVisible(true);
  };

  // Render item for the leaderboard
  const renderLeaderItem = ({ item, index }: { item: any; index: number }) => {
    const isTopThree = item.rank <= 3;
    
    return (
      <View className={`flex-row items-center p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
        {/* Rank Badge */}
        <View className={`w-10 h-10 rounded-full justify-center items-center ${
          item.rank === 1 ? 'bg-yellow-100 border-2 border-yellow-400' : 
          item.rank === 2 ? 'bg-gray-100 border-2 border-gray-400' : 
          item.rank === 3 ? 'bg-amber-100 border-2 border-amber-500' : 
          'bg-white border border-gray-200'
        }`}>
          <Text className={`font-bold ${
            item.rank === 1 ? 'text-yellow-700' : 
            item.rank === 2 ? 'text-gray-600' : 
            item.rank === 3 ? 'text-amber-700' : 
            'text-gray-700'
          }`}>{item.rank}</Text>
        </View>
        
        {/* User Profile */}
        <TouchableOpacity onPress={() => handleProfileImagePress(item.avatar)}>
          <Image 
            source={{ uri: item.avatar }} 
            className="w-12 h-12 rounded-full ml-3 border-2 border-white"
            style={{ backgroundColor: '#f3f4f6' }}
          />
        </TouchableOpacity>
        
        <View className="flex-1 ml-3">
          <TouchableOpacity onPress={() => handleUserPress(item.id.toString())}>
            <Text className="font-bold text-gray-900">{item.username}</Text>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm">{item.points?.toLocaleString() || 0} points</Text>
        </View>
        
        {/* Trophy Icons for top 3 */}
        {isTopThree && (
          <Ionicons 
            name="trophy" 
            size={20} 
            color={item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : '#CD7F32'} 
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    );
  };

  // Render loading state
  if (leaderboardLoading && !leaderboardData) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading leaderboard...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (leaderboardError) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-red-600 font-bold text-center">Unable to load leaderboard</Text>
        <Text className="mt-2 text-gray-600 text-center">Please check your connection and try again</Text>
        <TouchableOpacity 
          className="mt-6 bg-blue-600 px-6 py-3 rounded-full"
          onPress={handleRefresh}
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const leaderboardItems = leaderboardData?.leaderboard || [];
  const userRank = leaderboardData?.user_rank;
  const topThree = leaderboardItems.length >= 3 ? leaderboardItems.slice(0, 3) : leaderboardItems;

  return (
    <SafeAreaView className="flex-1 bg-white"  >
      {/* Header */}
      <View className="bg-blue-600 px-4 pt-2 pb-4">
        <Text className="text-2xl font-bold text-white text-center mb-2">Leaderboard</Text>
        <Text className="text-blue-100 text-center">{getTabTitle()}</Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity 
          className={`flex-1 py-3 justify-center items-center ${activeTab === 'global' ? 'border-b-2 border-blue-600' : ''}`}
          onPress={() => setActiveTab('global')}
        >
          <Ionicons name="globe-outline" size={20} color={activeTab === 'global' ? '#2563eb' : '#6b7280'} />
          <Text className={`text-xs mt-1 ${activeTab === 'global' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Global</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-3 justify-center items-center ${activeTab === 'nearby' ? 'border-b-2 border-blue-600' : ''}`}
          onPress={() => setActiveTab('nearby')}
        >
          <Ionicons name="location-outline" size={20} color={activeTab === 'nearby' ? '#2563eb' : '#6b7280'} />
          <Text className={`text-xs mt-1 ${activeTab === 'nearby' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Nearby</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-3 justify-center items-center ${activeTab === 'weekly' ? 'border-b-2 border-blue-600' : ''}`}
          onPress={() => setActiveTab('weekly')}
        >
          <Ionicons name="calendar-outline" size={20} color={activeTab === 'weekly' ? '#2563eb' : '#6b7280'} />
          <Text className={`text-xs mt-1 ${activeTab === 'weekly' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Weekly</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-3 justify-center items-center ${activeTab === 'monthly' ? 'border-b-2 border-blue-600' : ''}`}
          onPress={() => setActiveTab('monthly')}
        >
          <Ionicons name="calendar" size={20} color={activeTab === 'monthly' ? '#2563eb' : '#6b7280'} />
          <Text className={`text-xs mt-1 ${activeTab === 'monthly' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Top 3 Podium (only for global and monthly) */}
      {(activeTab === 'global' || activeTab === 'monthly') && topThree.length >= 3 && (
        <View className="py-4 px-2 bg-gray-50">
          <View className="flex-row justify-center items-end mb-2">
            {/* Second Place */}
            <View className="flex-col items-center mx-2">
              <TouchableOpacity onPress={() => handleProfileImagePress(topThree[1].avatar)}>
                <Image 
                  source={{ uri: topThree[1].avatar }} 
                  className="w-16 h-16 rounded-full border-4 border-gray-300"
                />
              </TouchableOpacity>
              <View className="bg-gray-200 h-16 w-20 rounded-t-lg justify-end items-center">
                <Text className="font-bold text-gray-600 text-xl mb-1">2</Text>
              </View>
              <TouchableOpacity onPress={() => handleUserPress(topThree[1].id.toString())}>
                <Text className="text-xs font-medium mt-1">{topThree[1].username}</Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500">{topThree[1].points?.toLocaleString() || 0} pts</Text>
            </View>

            {/* First Place */}
            <View className="flex-col items-center mx-2">
              <TouchableOpacity onPress={() => handleProfileImagePress(topThree[0].avatar)}>
                <Image 
                  source={{ uri: topThree[0].avatar }} 
                  className="w-20 h-20 rounded-full border-4 border-yellow-400"
                />
              </TouchableOpacity>
              <View className="bg-yellow-100 h-20 w-24 rounded-t-lg justify-end items-center">
                <Text className="font-bold text-yellow-700 text-2xl mb-1">1</Text>
              </View>
              <TouchableOpacity onPress={() => handleUserPress(topThree[0].id.toString())}>
                <Text className="text-xs font-bold mt-1">{topThree[0].username}</Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500">{topThree[0].points?.toLocaleString() || 0} pts</Text>
            </View>

            {/* Third Place */}
            <View className="flex-col items-center mx-2">
              <TouchableOpacity onPress={() => handleProfileImagePress(topThree[2].avatar)}>
                <Image 
                  source={{ uri: topThree[2].avatar }} 
                  className="w-14 h-14 rounded-full border-4 border-amber-500"
                />
              </TouchableOpacity>
              <View className="bg-amber-100 h-12 w-18 rounded-t-lg justify-end items-center">
                <Text className="font-bold text-amber-700 text-lg mb-1">3</Text>
              </View>
              <TouchableOpacity onPress={() => handleUserPress(topThree[2].id.toString())}>
                <Text className="text-xs font-medium mt-1">{topThree[2].username}</Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500">{topThree[2].points?.toLocaleString() || 0} pts</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Leaderboard List */}
      <FlatList
        data={leaderboardItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLeaderItem}
        onRefresh={handleRefresh}
        refreshing={leaderboardLoading}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <>
            {/* Filter Chips - categories */}
            <View className="flex-row flex-wrap p-3 bg-gray-50 border-b border-gray-200">
              <TouchableOpacity 
                className={`${categoryId === null ? 'bg-blue-100' : 'bg-white border border-gray-200'} rounded-full px-3 py-1 mr-2 mb-2`}
                onPress={() => handleCategorySelect(null)}
              >
                <Text className={`${categoryId === null ? 'text-blue-700' : 'text-gray-700'} text-xs font-medium`}>All Categories</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`${categoryId === '1' ? 'bg-blue-100' : 'bg-white border border-gray-200'} rounded-full px-3 py-1 mr-2 mb-2`}
                onPress={() => handleCategorySelect('1')}
              >
                <Text className={`${categoryId === '1' ? 'text-blue-700' : 'text-gray-700'} text-xs`}>Food</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`${categoryId === '2' ? 'bg-blue-100' : 'bg-white border border-gray-200'} rounded-full px-3 py-1 mr-2 mb-2`}
                onPress={() => handleCategorySelect('2')}
              >
                <Text className={`${categoryId === '2' ? 'text-blue-700' : 'text-gray-700'} text-xs`}>Attractions</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`${categoryId === '3' ? 'bg-blue-100' : 'bg-white border border-gray-200'} rounded-full px-3 py-1 mr-2 mb-2`}
                onPress={() => handleCategorySelect('3')}
              >
                <Text className={`${categoryId === '3' ? 'text-blue-700' : 'text-gray-700'} text-xs`}>Nightlife</Text>
              </TouchableOpacity>
            </View>

            {/* Section Title */}
            <View className="flex-row justify-between items-center bg-gray-50 px-4 py-2">
              <Text className="font-bold text-gray-900">Ranking</Text>
              {leaderboardData?.pagination && leaderboardData.pagination.total_pages > 1 && (
                <Text className="text-gray-600 text-sm">
                  Page {leaderboardData.pagination.current_page} of {leaderboardData.pagination.total_pages}
                </Text>
              )}
            </View>
          </>
        )}
        ListFooterComponent={() => (
          <>
            {/* Loading indicator for pagination */}
            {leaderboardLoading && page > 1 && (
              <View className="py-4 flex items-center">
                <ActivityIndicator size="small" color="#2563eb" />
                <Text className="text-gray-500 text-sm mt-2">Loading more...</Text>
              </View>
            )}
            
            {/* My Ranking Card */}
            {userRank && (
              <View className="mt-4 p-4 mx-4 rounded-lg bg-blue-50 border border-blue-100">
                <Text className="text-sm font-bold text-gray-700 mb-2">Your Ranking</Text>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-white justify-center items-center border border-gray-200">
                    <Text className="font-bold text-gray-700">{userRank.rank}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleProfileImagePress(userRank.avatar)}>
                    <Image 
                      source={{ uri: userRank.avatar }} 
                      className="w-10 h-10 rounded-full ml-3"
                    />
                  </TouchableOpacity>
                  <View className="flex-1 ml-3">
                    <TouchableOpacity onPress={() => handleUserPress(userRank.id.toString())}>
                      <Text className="font-bold text-gray-900">{userRank.username}</Text>
                    </TouchableOpacity>
                    <Text className="text-gray-600 text-sm">{userRank.points?.toLocaleString() || 0} points</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Explanation Card */}
            <View className="mt-4 p-4 mx-4 mb-8 rounded-lg bg-white border border-gray-200">
              <Text className="text-sm font-bold text-gray-700 mb-2">How to Increase Your Rank</Text>
              <View className="flex-row items-center mb-2">
                <Ionicons name="location" size={16} color="#2563eb" style={{ marginRight: 8 }} />
                <Text className="text-gray-600 text-sm">Visit marked locations on the map</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="camera" size={16} color="#2563eb" style={{ marginRight: 8 }} />
                <Text className="text-gray-600 text-sm">Create posts at visited locations</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="heart" size={16} color="#2563eb" style={{ marginRight: 8 }} />
                <Text className="text-gray-600 text-sm">Get likes on your posts</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#2563eb" style={{ marginRight: 8 }} />
                <Text className="text-gray-600 text-sm">Complete daily challenges</Text>
              </View>
            </View>
          </>
        )}
      />

      {/* Profile Image Modal */}
      <Modal
        visible={profileImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileImageModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-12 right-4 z-10"
            onPress={() => setProfileImageModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 justify-center items-center w-full"
            onPress={() => setProfileImageModalVisible(false)}
          >
            <Image 
              source={{ uri: selectedProfileImage }}
              style={{ 
                width: width * 0.8, 
                height: width * 0.8,
                borderRadius: (width * 0.8) / 2
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
