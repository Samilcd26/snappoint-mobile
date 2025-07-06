import React from 'react';
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { useToast } from "@/components/ui/toast";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Icon, CloseIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon, HelpCircleIcon } from "@/components/ui/icon";

export type ToastAction = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description: string;
  action: ToastAction;
  onRetry?: () => void;
  duration?: number;
  placement?: 'top' | 'bottom' | 'top left' | 'top right' | 'bottom left' | 'bottom right';
}

// Her toast türü için icon ve stil yapılandırması
const getToastConfig = (action: ToastAction) => {
  const configs = {
    success: {
      icon: CheckCircleIcon,
      iconClassName: "stroke-success-600",
      variant: "solid" as const,
      containerClassName: "border-success-500"
    },
    error: {
      icon: AlertCircleIcon,
      iconClassName: "stroke-error-600",
      variant: "outline" as const,
      containerClassName: "border-error-500"
    },
    warning: {
      icon: HelpCircleIcon,
      iconClassName: "stroke-warning-600",
      variant: "outline" as const,
      containerClassName: "border-warning-500"
    },
    info: {
      icon: InfoIcon,
      iconClassName: "stroke-info-600",
      variant: "outline" as const,
      containerClassName: "border-info-500"
    }
  };
  return configs[action];
};

export const useShowToast = () => {
  const toast = useToast();
  const [activeToastId, setActiveToastId] = React.useState<string | null>(null);

  const showToast = ({ 
    title, 
    description, 
    action, 
    onRetry, 
    duration = 4000,
    placement = 'top'
  }: ToastOptions) => {
    // Eğer aktif toast varsa kapat
    if (activeToastId !== null && toast.isActive(activeToastId)) {
      toast.close(activeToastId);
    }

    const id = Math.random().toString();
    setActiveToastId(id);

    const config = getToastConfig(action);
    const IconComponent = config.icon;

    toast.show({
      id,
      placement,
      duration,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            action={action}
            variant={config.variant}
            nativeID={uniqueToastId}
            className={`p-4 gap-3 w-full sm:min-w-[386px] max-w-[386px] shadow-hard-2 flex-row justify-between ${config.containerClassName}`}
          >
            <HStack space="md" className="flex-1">
              <Icon
                as={IconComponent}
                size="lg"
                className={`mt-0.5 ${config.iconClassName}`}
              />
              <VStack space="xs" className="flex-1">
                <ToastTitle 
                  className={`font-semibold ${
                    config.variant === 'solid' 
                      ? 'text-typography-50' 
                      : action === 'success' ? 'text-success-700' :
                        action === 'error' ? 'text-error-700' :
                        action === 'warning' ? 'text-warning-700' :
                        'text-info-700'
                  }`}
                >
                  {title}
                </ToastTitle>
                <ToastDescription 
                  size="sm" 
                  className={`${
                    config.variant === 'solid' 
                      ? 'text-typography-100' 
                      : 'text-typography-700'
                  }`}
                >
                  {description}
                </ToastDescription>
              </VStack>
            </HStack>
            
            <HStack className="gap-2 items-center">
              {onRetry && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-2" 
                  onPress={onRetry}
                >
                  <ButtonText 
                    className={`text-sm ${
                      config.variant === 'solid' 
                        ? 'text-typography-50' 
                        : action === 'success' ? 'text-success-700' :
                          action === 'error' ? 'text-error-700' :
                          action === 'warning' ? 'text-warning-700' :
                          'text-info-700'
                    }`}
                  >
                    Tekrar Dene
                  </ButtonText>
                </Button>
              )}
              <Pressable onPress={() => toast.close(id)} className="p-1">
                <Icon 
                  as={CloseIcon} 
                  size="md"
                  className={`${
                    config.variant === 'solid' 
                      ? 'stroke-typography-50' 
                      : 'stroke-typography-500'
                  }`}
                />
              </Pressable>
            </HStack>
          </Toast>
        );
      },
    });

    // Auto-clear active toast ID after duration
    setTimeout(() => {
      if (activeToastId === id) {
        setActiveToastId(null);
      }
    }, duration);

    return id;
  };

  const showSuccessToast = (title: string, description: string, options?: Partial<ToastOptions>) => {
    return showToast({ title, description, action: 'success', ...options });
  };

  const showErrorToast = (title: string, description: string, options?: Partial<ToastOptions>) => {
    return showToast({ title, description, action: 'error', ...options });
  };

  const showWarningToast = (title: string, description: string, options?: Partial<ToastOptions>) => {
    return showToast({ title, description, action: 'warning', ...options });
  };

  const showInfoToast = (title: string, description: string, options?: Partial<ToastOptions>) => {
    return showToast({ title, description, action: 'info', ...options });
  };

  const closeActiveToast = () => {
    if (activeToastId !== null && toast.isActive(activeToastId)) {
      toast.close(activeToastId);
      setActiveToastId(null);
    }
  };

  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    closeActiveToast,
    isActive: (id: string) => toast.isActive(id),
    close: (id: string) => toast.close(id)
  };
};


