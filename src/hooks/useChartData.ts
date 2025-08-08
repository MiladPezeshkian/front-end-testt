import { useState, useEffect } from 'react';

interface ChartData {
  title: string;
  data: [number, number | null | (number | null)[]][];
}

export const useChartData = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array');
        }
        
        // Validate data structure
        const validatedData = data.map((chart, index) => {
          if (!chart.title || !Array.isArray(chart.data)) {
            throw new Error(`Invalid chart format at index ${index}`);
          }
          return chart;
        });
        
        setChartData(validatedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error loading chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { chartData, loading, error };
};