import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
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
import { toast } from 'sonner';

type Incident = {
  id: string;
  reported_at: string;
  status: string;
  type: string;
  description: string;
  user_id: string;
};

const AuthorityDashboard = () => {
  const { user, supabase, isAuthority } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    if (!user || !isAuthority) {
      navigate('/authority-login');
      return;
    }

    fetchIncidents();
  }, [user, isAuthority]);

  const fetchIncidents = async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('reported_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch incidents');
      console.error('Error:', error);
      return;
    }

    setIncidents(data || []);
  };

  const updateIncidentStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update incident status');
      console.error('Error:', error);
      return;
    }

    toast.success('Incident status updated successfully');
    fetchIncidents();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Authority Dashboard</h1>
        <div className="grid gap-6">
          {incidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{incident.type}</span>
                  <Select
                    defaultValue={incident.status}
                    onValueChange={(value) =>
                      updateIncidentStatus(incident.id, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Reported on: {new Date(incident.reported_at).toLocaleDateString()}
                </p>
                <p className="mt-4">{incident.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AuthorityDashboard;