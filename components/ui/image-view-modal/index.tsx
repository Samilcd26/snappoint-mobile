import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageViewModalProps {
  isVisible: boolean;
  onClose: () => void;
  imageUri?: string;
  placeName?: string;
  pointValue?: number;
}

const ImageViewModal: React.FC<ImageViewModalProps> = ({ 
  isVisible, 
  onClose, 
  imageUri, 
  placeName,
  pointValue 
}) => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  if (!imageUri) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black justify-center items-center">
        {/* Close Button */}
        <TouchableOpacity 
          className="absolute top-12 right-6 z-10 bg-black/50 rounded-full p-3"
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Place Name */}
        {placeName && (
          <View className="absolute top-12 left-6 z-10">
            <Text className="text-white text-lg font-bold">{placeName}</Text>
          </View>
        )}

        {/* Fullscreen Image */}
        <TouchableOpacity 
          className="flex-1 justify-center items-center w-full"
          activeOpacity={1}
          onPress={onClose}
        >
          <Image 
            source={{ uri: imageUri }}
            style={{
              width: windowWidth,
              height: windowHeight * 0.7,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Bottom Info */}
        {(placeName || pointValue) && (
          <View className="absolute bottom-12 left-6 right-6 bg-black/50 rounded-2xl p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="white" />
                <Text className="text-white text-sm ml-2">{placeName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3b82f6" style={{ marginLeft: 4 }} />
              </View>
              {pointValue && (
                <View className="flex-row items-center">
                  <Ionicons name="trophy" size={16} color="#f59e0b" />
                  <Text className="text-white text-sm font-bold ml-1">{pointValue} pts</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ImageViewModal; 