import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Application = {
  id: string;
  created_at: string;
  status: string;
  type: string;
  description: string;
};

const Dashboard = () => {
  const { user, supabase, isAuthority } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      const query = isAuthority
        ? supabase.from('applications').select('*')
        : supabase.from('applications').select('*').eq('user_id', user.id);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      setApplications(data || []);
    };

    fetchApplications();
  }, [user, isAuthority]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">
          {isAuthority ? 'All Applications' : 'My Applications'}
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <CardTitle>{application.type}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Status: {application.status}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(application.created_at).toLocaleDateString()}
                </p>
                <p className="mt-2">{application.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;