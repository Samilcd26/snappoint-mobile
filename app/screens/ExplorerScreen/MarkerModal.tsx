import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Heading } from "@/components/ui/heading";
import { Modal, ModalBackdrop, ModalContent, ModalCloseButton, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { Ionicons } from '@expo/vector-icons';

interface MarkerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPostAt: () => void;
  onGoToProfile: () => void;
}

const MarkerModal: React.FC<MarkerModalProps> = ({ isVisible, onClose, onPostAt, onGoToProfile }) => {
  return (
    <Modal
      isOpen={isVisible}
      onClose={onClose}
      size="sm"
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader className="flex-col items-center gap-0.5 bg-white border-b border-gray-200">
          <Heading size="md" className="text-center text-gray-900">Location Actions</Heading>
          <Text size="sm" className="text-center mt-2 text-gray-500">Mekandaki Postları görebilmek için önce post atın.</Text>
        </ModalHeader>
        <ModalBody className="bg-white pt-6 pb-4">
          <View className="flex-row justify-center items-center space-x-6 gap-4">
            <TouchableOpacity
              className="w-24 h-24 rounded-xl justify-center items-center bg-blue-50 border border-blue-100"
              onPress={onGoToProfile}
            >
              <Ionicons name="person" size={32} color="#3b82f6" />
              <Text className="text-blue-600 mt-2 font-semibold">Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-24 h-24 rounded-xl justify-center items-center bg-blue-50 border border-blue-100"
              onPress={onPostAt}
            >
              <Ionicons name="create" size={32} color="#3b82f6" />
              <Text className="text-blue-600 mt-2 font-semibold">Create Post</Text>
            </TouchableOpacity>
          </View>
        </ModalBody>
       
      </ModalContent>
    </Modal>
  );
};

export default MarkerModal;
