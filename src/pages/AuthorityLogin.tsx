import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const AuthorityLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, checkUserRole } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateInputs = () => {
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      await signIn(email, password);
      
      // Wait for user to be set after sign in
      const checkAccess = async () => {
        if (user?.id) {
          console.log('Checking authority access for user:', user.id);
          const isAuthorityUser = await checkUserRole(user.id);
          console.log('Is authority user:', isAuthorityUser);
          
          if (isAuthorityUser) {
            toast.success('Signed in successfully');
            navigate('/authority');
          } else {
            toast.error('This account does not have authority access');
            navigate('/login');
          }
        } else {
          console.log('No user ID available');
        }
      };

      // Give some time for the auth state to update
      setTimeout(async () => {
        await checkAccess();
        setIsLoading(false);
      }, 1000);

    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);

      if (error.message?.includes('invalid_credentials')) {
        toast.error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message?.includes('network_error')) {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Authority Sign In
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in with your authority credentials
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;