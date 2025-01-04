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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

type Incident = {
  id: string;
  reported_at: string | null;
  status: string;
  type: string;
  description: string;
  user_id: string | null;
  location: string | null;
  reporter_name: string | null;
};

const AuthorityDashboard = () => {
  const { user, supabase, isAuthority } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{id: string, status: string} | null>(null);

  useEffect(() => {
    if (!user || !isAuthority) {
      navigate('/authority-login');
    } else {
      fetchIncidents();
    }
  }, [user, isAuthority]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      console.log('Fetching incidents...');
      const { data, error } = await supabase
        .from('incidents')
        .select('*');

      if (error) {
        console.error('Error fetching incidents:', error);
        toast.error('Failed to fetch incidents');
        setIncidents([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No incidents found');
        setIncidents([]);
      } else {
        console.log('Fetched incidents:', data);
        setIncidents(data);
      }
    } catch (error) {
      console.error('Error in fetchIncidents:', error);
      toast.error('An error occurred while fetching incidents');
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (id: string, newStatus: string) => {
    try {
      console.log('Updating incident status:', { id, newStatus });
      
      // First get the current incident to access its log
      const { data: currentIncident, error: fetchError } = await supabase
        .from('incidents')
        .select('log')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching incident:', fetchError);
        toast.error('Failed to update incident status');
        return;
      }

      const timestamp = new Date().toISOString();
      const newLogEntry = `[${timestamp}] Status changed to "${newStatus}" by authority\n`;
      const updatedLog = currentIncident.log 
        ? `${currentIncident.log}${newLogEntry}`
        : newLogEntry;

      const { error } = await supabase
        .from('incidents')
        .update({ 
          status: newStatus,
          log: updatedLog
        })
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

  const handleStatusChange = (id: string, newStatus: string) => {
    setPendingStatusChange({ id, status: newStatus });
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      updateIncidentStatus(pendingStatusChange.id, pendingStatusChange.status);
      setPendingStatusChange(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Authority Dashboard</h1>
        <div className="mb-4">
          <p className="text-gray-600">Total Incidents: {incidents.length}</p>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Loading incidents...</p>
        ) : incidents.length === 0 ? (
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
                      onValueChange={(value) => handleStatusChange(incident.id, value)}
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
                    Reported on:{' '}
                    {incident.reported_at
                      ? new Date(incident.reported_at).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Location: {incident.location || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Reporter: {incident.reporter_name || 'Anonymous'}
                  </p>
                  <p className="mt-4">{incident.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog 
          open={pendingStatusChange !== null}
          onOpenChange={(open) => !open && setPendingStatusChange(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the status of this incident?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStatusChange}>
                Yes, change status
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default AuthorityDashboard;