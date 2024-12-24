import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const ApplicantForm = () => {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to submit an application',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase.from('applications').insert([
        {
          user_id: user.id,
          type,
          description,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Submit Application</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Application Type
              </label>
              <Select onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select application type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety_concern">Safety Concern</SelectItem>
                  <SelectItem value="incident_report">Incident Report</SelectItem>
                  <SelectItem value="assistance_request">
                    Assistance Request
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about your application"
                required
                className="min-h-[150px]"
              />
            </div>
            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ApplicantForm;