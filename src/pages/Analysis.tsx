import React from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Map from "@/components/Map";

// Mock data - replace with real data when connected to backend
const mockIncidentData = [
  { category: "Harassment", count: 12, location: "Downtown" },
  { category: "Stalking", count: 8, location: "Suburbs" },
  { category: "Suspicious Activity", count: 15, location: "City Center" },
  { category: "Unsafe Environment", count: 10, location: "Industrial Area" },
  { category: "Other", count: 5, location: "Residential" },
];

const Analysis = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Incident Analysis</h1>
      
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
                <BarChart data={mockIncidentData}>
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
            <li>• Most incidents are reported in the City Center area</li>
            <li>• Harassment reports are highest during evening hours</li>
            <li>• Suspicious activity reports have increased by 20% this month</li>
            <li>• Downtown area shows the highest concentration of incidents</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;