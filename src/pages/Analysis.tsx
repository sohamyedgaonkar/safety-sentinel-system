import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Map from "@/components/Map";
import { supabase } from "@/integrations/supabase/client";

type IncidentData = {
  category: string;
  count: number;
  location: string;
};

const Analysis = () => {
  const [incidentData, setIncidentData] = useState<IncidentData[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchIncidentData();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'incidents'
        },
        () => {
          // Refetch data when any change occurs
          fetchIncidentData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIncidentData = async () => {
    try {
      const { data: incidents } = await supabase
        .from('incidents')
        .select('type, location');

      if (incidents) {
        // Process incidents data for visualization
        const categoryCounts = incidents.reduce((acc: { [key: string]: any }, incident) => {
          const category = incident.type;
          if (!acc[category]) {
            acc[category] = {
              category,
              count: 0,
              location: incident.location
            };
          }
          acc[category].count += 1;
          return acc;
        }, {});

        setIncidentData(Object.values(categoryCounts));
      }
    } catch (error) {
      console.error('Error fetching incident data:', error);
    }
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary mb-6">Incident Analysis</h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Incidents by Category</h2>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  category: { theme: { light: "#2563eb", dark: "#3b82f6" } },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="count" name="Number of Incidents" fill="var(--color-category)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Location Heat Map</h2>
            <div className="h-[300px]">
              <Map />
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Most incidents are reported in {incidentData[0]?.location || 'loading...'}</li>
              <li>• {incidentData[0]?.category || 'Incident'} reports are highest ({incidentData[0]?.count || 0} reports)</li>
              <li>• Total number of reported incidents: {incidentData.reduce((sum, item) => sum + item.count, 0)}</li>
              <li>• {incidentData.length} different types of incidents reported</li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Analysis;