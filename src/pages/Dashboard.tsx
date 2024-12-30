import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

type Incident = {
  id: string;
  created_at: string;
  status: string;
  type: string;  // Changed back to type to match database schema
  description: string;
};

const Dashboard = () => {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('id, created_at, type, description, status')  // Changed back to type
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching incidents:', error);
        return;
      }

      setIncidents(data || []);

      // Calculate statistics
      const stats = data?.reduce((acc: any, incident: Incident) => {
        acc[incident.type] = (acc[incident.type] || 0) + 1;  // Changed back to type
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
                    <CardTitle>{incident.type}</CardTitle>  {/* Changed back to type */}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Status: {incident.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(incident.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2">{incident.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;