import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { axiosBackendInstance } from '@/api/config';

const Activate = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | '404'>('loading');
  const [message, setMessage] = useState<string>('');
  const token = useParams();

  useEffect(() => {
    
    if (!token) {
      setStatus('404');
      return;
    }

    const activateAccount = async () => {
      try {
        const response = await axiosBackendInstance.patch(`/accounts/activate/`, { token });
        setStatus('success');
        setMessage(response.data.message || 'Account activated successfully!');
        
        // Redirect to login after successful activation
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        if (error.response) {
          setMessage(error.response.data.message || 'Activation failed!');
        } else {
          setMessage('An unexpected error occurred during activation.');
        }
      }
    };

    activateAccount();
  }, [token, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-12 animate-in slide-up fade-in duration-300">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Activating your account...</h3>
            <p className="text-muted-foreground">Please wait while we verify your account.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-12 animate-in slide-up fade-in duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Activation Successful!</h3>
            <p className="mb-6">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page in a few seconds...
            </p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center py-12 animate-in slide-up fade-in duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <XCircle className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Activation Failed</h3>
            <p className="mb-6">{message}</p>
            <Button 
              onClick={() => navigate('/login')}
              className="mt-2"
            >
              Go to Login
            </Button>
          </div>
        );
      case '404':
        return (
          <div className="text-center py-12 animate-in slide-up fade-in duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertCircle className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Invalid Activation Link</h3>
            <p className="mb-6">The activation link is invalid or has expired.</p>
            <Button 
              onClick={() => navigate('/login')}
              className="mt-2"
            >
              Go to Login
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl opacity-60" />
      </div>
      
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              A
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Account Activation</h1>
          <p className="mt-2 text-muted-foreground">
            Verify your email to complete registration
          </p>
        </div>

        <Card className="overflow-hidden border shadow-lg">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/80" />
          <div className="p-6 sm:p-8">
            {renderContent()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Activate;
