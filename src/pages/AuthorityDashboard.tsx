import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

type Application = {
  id: string;
  created_at: string;
  status: string;
  type: string;
  description: string;
  user_id: string;
};

const AuthorityDashboard = () => {
  const { user, supabase, isAuthority } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!user || !isAuthority) {
      navigate('/login');
      return;
    }

    fetchApplications();
  }, [user, isAuthority]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        variant: 'destructive',
      });
      return;
    }

    setApplications(data || []);
  };

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Application status updated successfully',
    });
    fetchApplications();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Authority Dashboard</h1>
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{application.type}</span>
                  <Select
                    defaultValue={application.status}
                    onValueChange={(value) =>
                      updateApplicationStatus(application.id, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Submitted on:{' '}
                  {new Date(application.created_at).toLocaleDateString()}
                </p>
                <p className="mt-4">{application.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AuthorityDashboard;