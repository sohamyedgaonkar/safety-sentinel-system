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
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error) {
        console.error('Error fetching incidents:', error);
        toast.error('Failed to fetch incidents');
        return;
      }

      if (!data) {
        console.log('No incidents found');
        setIncidents([]);
        return;
      }

      console.log('Fetched incidents:', data);
      setIncidents(data);
    } catch (error) {
      console.error('Error in fetchIncidents:', error);
      toast.error('An error occurred while fetching incidents');
    }
  };

  const updateIncidentStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating incident status:', error);
        toast.error('Failed to update incident status');
        return;
      }

      toast.success('Incident status updated successfully');
      fetchIncidents();
    } catch (error) {
      console.error('Error in updateIncidentStatus:', error);
      toast.error('An error occurred while updating the status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Authority Dashboard</h1>
        {incidents.length === 0 ? (
          <p className="text-center text-gray-500">No incidents reported yet.</p>
        ) : (
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
        )}
      </main>
    </div>
  );
};

export default AuthorityDashboard;