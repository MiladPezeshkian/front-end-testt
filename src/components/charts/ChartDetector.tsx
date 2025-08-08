import React from 'react';
import SingleSeriesChart from './SingleSeriesChart';
import MultiSeriesChart from './MultiSeriesChart';

interface ChartData {
  title: string;
  data: [number, number | null | (number | null)[]][];
}

interface ChartDetectorProps {
  chartData: ChartData;
}

const ChartDetector: React.FC<ChartDetectorProps> = ({ chartData }) => {
  const { title, data } = chartData;

  // Detect chart type by checking the first valid data point
  const isMultiSeries = data.some(([, value]) => Array.isArray(value));

  if (isMultiSeries) {
    // Type assertion for multi-series data
    const multiSeriesData = data as [number, (number | null)[]][];
    return <MultiSeriesChart title={title} data={multiSeriesData} />;
  } else {
    // Type assertion for single-series data
    const singleSeriesData = data as [number, number | null][];
    return <SingleSeriesChart title={title} data={singleSeriesData} />;
  }
};

export default ChartDetector;