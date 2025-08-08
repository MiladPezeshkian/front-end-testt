import React from 'react';
import { useChartData } from '@/hooks/useChartData';
import ChartDetector from '@/components/charts/ChartDetector';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';

const ChartDashboard: React.FC = () => {
  const { chartData, loading, error } = useChartData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h1 className="page-header">D3.js Chart Dashboard</h1>
              </div>
              <p className="creator-badge">Created by Milad Pezeshkian</p>
            </div>
            <div className="hidden md:block">
              <div className="px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
                <span className="text-sm font-medium text-secondary-foreground">
                  {chartData.length} Chart{chartData.length !== 1 ? 's' : ''} Loaded
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <h2 className="text-2xl font-semibold text-foreground">No Charts Found</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                The data.json file appears to be empty or contains no valid chart data.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-2xl font-semibold text-foreground">
                Interactive Data Visualization
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Automatically detecting chart types and rendering beautiful, interactive visualizations 
                using D3.js. Hover over data points to see detailed values.
              </p>
            </div>

            <div className="grid gap-8">
              {chartData.map((chart, index) => (
                <div key={index} className="w-full">
                  <ChartDetector chartData={chart} />
                </div>
              ))}
            </div>

            {/* Footer info */}
            <div className="mt-16 text-center space-y-4 py-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Built with React, TypeScript, D3.js, and Tailwind CSS
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>Auto-detection of chart types</span>
                <span>•</span>
                <span>Null value handling</span>
                <span>•</span>
                <span>Interactive tooltips</span>
                <span>•</span>
                <span>Responsive design</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChartDashboard;