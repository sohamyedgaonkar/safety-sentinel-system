import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Map from '@/components/Map';

type Incident = {
  id: string;
  reported_at: string;
  status: string;
  type: string;
  description: string;
  location: string | null;
};

const Dashboard = () => {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('id, reported_at, type, description, status, location')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching incidents:', error);
        return;
      }

      setIncidents(data || []);

      const stats = data?.reduce((acc: any, incident: Incident) => {
        acc[incident.type] = (acc[incident.type] || 0) + 1;
        return acc;
      }, {});

      const formattedStats = Object.entries(stats || {}).map(([name, value]) => ({
        name,
        value,
      }));

      setStatistics(formattedStats);
    };

    fetchIncidents();
  }, [user]);

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setEditDescription(incident.description);
    setEditLocation(incident.location || '');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingIncident) return;

    const { error } = await supabase
      .from('incidents')
      .update({
        description: editDescription.trim(),
        location: editLocation.trim() || null,
      })
      .eq('id', editingIncident.id)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident');
      return;
    }

    // Update local state
    setIncidents(incidents.map(incident => 
      incident.id === editingIncident.id 
        ? { ...incident, description: editDescription, location: editLocation }
        : incident
    ));

    toast.success('Incident updated successfully');
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="incidents">My Reported Incidents</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Statistics</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer
                  config={{
                    incidents: {
                      color: "hsl(var(--primary))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statistics}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="value" fill="currentColor" />
                      <Tooltip content={<ChartTooltipContent />} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {incidents.map((incident) => (
                <Card key={incident.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{incident.type}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(incident)}
                      >
                        Edit
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Status: {incident.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(incident.reported_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2">{incident.description}</p>
                    {incident.location && (
                      <p className="text-sm text-gray-500 mt-2">
                        Location: {incident.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Incident Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Update incident description..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location (Optional)</label>
                <div className="h-[200px] rounded-md overflow-hidden mb-2">
                  <Map onLocationSelect={(loc) => setEditLocation(loc)} />
                </div>
                <Input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Update location..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;