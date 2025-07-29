import React from 'react';
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Pressable } from "@/components/ui/pressable";
import { ToastDescription, useToast } from "@/components/ui/toast";
import { Toast, ToastTitle } from "@/components/ui/toast";
import { Icon, CloseIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon, HelpCircleIcon } from "@/components/ui/icon";
import { useTranslation } from "@/utils/useTranslation";

export type ToastAction = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  description: string;
  action: ToastAction;
  onRetry?: () => void;
  duration?: number;
}

// Her toast türü için icon ve stil yapılandırması
const getToastConfig = (action: ToastAction) => {
  const configs = {
    success: {
      icon: CheckCircleIcon,
      iconClassName: "stroke-success-600 fill-success-100",
      dividerClassName: "bg-success-200",
      retryClassName: "text-success-700",
      toastVariant: 'outline' as const,
      toastAction: 'success' as const
    },
    error: {
      icon: AlertCircleIcon,
      iconClassName: "stroke-error-600 fill-error-100",
      dividerClassName: "bg-error-200",
      retryClassName: "text-error-700",
      toastVariant: 'outline' as const,
      toastAction: 'error' as const
    },
    warning: {
      icon: HelpCircleIcon,
      iconClassName: "stroke-warning-600 fill-warning-100",
      dividerClassName: "bg-warning-200",
      retryClassName: "text-warning-700",
      toastVariant: 'outline' as const,
      toastAction: 'warning' as const
    },
    info: {
      icon: InfoIcon,
      iconClassName: "stroke-info-600 fill-info-100",
      dividerClassName: "bg-info-200",
      retryClassName: "text-info-700",
      toastVariant: 'outline' as const,
      toastAction: 'info' as const
    }
  };
  return configs[action];
};

export const useShowToast = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [activeToastId, setActiveToastId] = React.useState<string | null>(null);

  const showToast = ({ 
    description, 
    action, 
    onRetry, 
    duration = 4000
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
      placement: 'top',
      duration,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            nativeID={uniqueToastId}
            variant={config.toastVariant}
            action={config.toastAction}
            className="mx-4 mt-12 px-5 py-4 gap-4 shadow-soft-1 items-center flex-row rounded-2xl"
          >
            <Icon
              as={IconComponent}
              size="xl"
              className={config.iconClassName}
            />
          
            <ToastDescription className='text-sm leading-5'>
            {description}
            </ToastDescription>
            
            {onRetry && (
              <>
                <Divider
                  orientation="vertical"
                  className={`h-[35px] ${config.dividerClassName}`}
                />
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-2" 
                  onPress={onRetry}
                >
                  <ButtonText 
                    className={`text-sm font-medium ${config.retryClassName}`}
                  >
                    {t('toast.retry')}
                  </ButtonText>
                </Button>
              </>
            )}
            
            <Divider
              orientation="vertical"
              className={`h-[35px] ${config.dividerClassName}`}
            />
            <Pressable onPress={() => toast.close(id)} className="p-1">
              <Icon 
                as={CloseIcon} 
                size="md"
                className="stroke-typography-500"
              />
            </Pressable>
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

  const showSuccessToast = (description: string, options?: Partial<ToastOptions>) => {
    return showToast({ description, action: 'success', ...options });
  };

  const showErrorToast = (description: string, options?: Partial<ToastOptions>) => {
    return showToast({ description, action: 'error', ...options });
  };

  const showWarningToast = (description: string, options?: Partial<ToastOptions>) => {
    return showToast({ description, action: 'warning', ...options });
  };

  const showInfoToast = (description: string, options?: Partial<ToastOptions>) => {
    return showToast({ description, action: 'info', ...options });
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


