import React from 'react';
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { useToast } from "@/components/ui/toast";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Icon, CloseIcon, HelpCircleIcon } from "@/components/ui/icon";

export type ToastAction = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description: string;
  action: ToastAction;
  onRetry?: () => void;
}

export const useShowToast = () => {
  const toast = useToast();
  const [activeToastId, setActiveToastId] = React.useState<string | null>(null);

  const showToast = ({ title, description, action, onRetry }: ToastOptions) => {
    if (activeToastId !== null && toast.isActive(activeToastId)) {
      toast.close(activeToastId);
    }

    const id = Math.random().toString();
    setActiveToastId(id);

    toast.show({
      id,
      placement: 'top',
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            action={action}
            variant="solid"
            nativeID={uniqueToastId}
            className="p-4 gap-3 w-full sm:min-w-[386px] max-w-[386px] bg-background-0 shadow-hard-2 flex-row"
          >
            <HStack space="md">
              <Icon
                as={HelpCircleIcon}
              />
              <VStack space="xs">
                <ToastTitle className="font-semibold text-gray-900">{title}</ToastTitle>
                <ToastDescription size="sm" className="text-gray-500">{description}</ToastDescription>
              </VStack>
            </HStack>
            <HStack className="min-[450px]:gap-3 gap-1">
              {onRetry && (
                <Button variant="link" size="sm" className="px-3.5 self-center" onPress={onRetry}>
                  <ButtonText>Retry</ButtonText>
                </Button>
              )}
              <Pressable onPress={() => toast.close(id)}>
                <Icon as={CloseIcon} />
              </Pressable>
            </HStack>
          </Toast>
        );
      },
    });

    return id;
  };

  return showToast;
};


