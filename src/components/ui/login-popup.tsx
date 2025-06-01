'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';

interface LoginPopupProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  closable?: boolean;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({
  isOpen,
  onClose,
  title = "Continue with an Account",
  description = "You've reached the limit for guest usage. Please sign in to continue using all features.",
  closable = false
}) => {
  const router = useRouter();
  
  if (!isOpen) return null;

  const handleSignIn = () => {
    signIn('google', { callbackUrl: window.location.href });
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 relative">
        {closable && onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground text-sm">
            {description}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleSignIn}
              className="w-full"
              size="lg"
            >
              Sign in with Google
            </Button>
            
            <Button 
              onClick={handleReturnHome}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Return to Home Page
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
