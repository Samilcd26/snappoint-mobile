import React, { useCallback, useMemo } from 'react';
import { View, Text, Dimensions, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { PlaceDetails, Post } from '@/types/place';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const POST_SIZE = (width - 32) / 3;

const getPlaceholderImage = (seed?: number) => `https://picsum.photos/seed/${seed || Math.random()}/300/300`;

interface PlaceBottomSheetProps {
  placeDetails: PlaceDetails | null;
  isLoading: boolean;
  onClose?: () => void;
}

const PlaceBottomSheet: React.FC<PlaceBottomSheetProps> = ({ placeDetails, isLoading, onClose }) => {
  const snapPoints = useMemo(() => ['60%', '95%'], []);

  const handleSheetClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const renderPost = useCallback(({ item, index }: { item: Post; index: number }) => (
    <Animated.View 
      key={`post-${item.ID}`}
      entering={FadeInDown.delay(50 * index).springify()}
      style={[{ width: POST_SIZE, height: POST_SIZE }, styles.postContainer]}
    >
      <Pressable style={styles.postPressable}>
        <Image
          source={getPlaceholderImage(item.ID) || item.postMedia?.[0]?.media_url}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      </Pressable>
    </Animated.View>
  ), []);

  if (!placeDetails) return null;
  
  return (
    <BottomSheet
      snapPoints={snapPoints}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      enablePanDownToClose
      onClose={handleSheetClose}
    >
      <BottomSheetScrollView>
        <View style={styles.placeHeader}>
          <Image
            source={placeDetails.placeImage || getPlaceholderImage(placeDetails.ID)}
            style={styles.placeImage}
            contentFit="cover"
            transition={200}
          />
          
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.placeName}>{placeDetails.name}</Text>
              <Text style={styles.postCount}>
                {placeDetails.posts?.length || 0} gönderi
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.collectButton}
              activeOpacity={0.8}
              onPress={() => {
                // Handle point collection
              }}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.pointValueText}>{placeDetails.pointValue}</Text>
                <View style={styles.buttonTextContainer}>
                  <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
                  <Text style={styles.buttonText}>Puanı Topla</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {placeDetails.posts && placeDetails.posts.length > 0 ? (
          <View style={styles.postsContainer}>
            <View style={styles.postsGrid}>
              {placeDetails.posts.map((post, index) => (
                <React.Fragment key={post.ID}>
                  {renderPost({ item: post, index })}
                </React.Fragment>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="image-off" size={32} color="#374151" />
            <Text style={styles.emptyText}>Henüz gönderi bulunmuyor</Text>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#0A0A0A',
  },
  handleIndicator: {
    backgroundColor: '#374151',
    width: 40,
  },
  placeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postCount: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  collectButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointValueText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginVertical: 8,
  },
  postsContainer: {
    paddingHorizontal: 16,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  postContainer: {
    padding: 2,
  },
  postPressable: {
    flex: 1,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F2937',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PlaceBottomSheet;
