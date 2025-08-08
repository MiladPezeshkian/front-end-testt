import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface MultiSeriesChartProps {
  title: string;
  data: [number, (number | null)[]][];
}

const MultiSeriesChart: React.FC<MultiSeriesChartProps> = ({ title, data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 120, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract series data
    const series = [0, 1, 2].map(seriesIndex => 
      data.map(([timestamp, values]) => [timestamp, values[seriesIndex]] as [number, number | null])
        .filter(([, value]) => value !== null) as [number, number][]
    );

    // Get all valid values for domain calculation
    const allValidValues = series.flat().map(d => d[1]);
    const allTimestamps = data.map(d => d[0]);

    if (allValidValues.length === 0) return;

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(allTimestamps) as [number, number])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(allValidValues) as [number, number])
      .nice()
      .range([height, 0]);

    // Colors for the three series
    const colors = ['hsl(var(--chart-blue))', 'hsl(var(--chart-green))', 'hsl(var(--chart-red))'];
    const seriesNames = ['Series 1', 'Series 2', 'Series 3'];

    // Add grid lines
    g.selectAll(".grid-line-x")
      .data(xScale.ticks())
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);

    g.selectAll(".grid-line-y")
      .data(yScale.ticks())
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "hsl(var(--muted-foreground))");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "hsl(var(--muted-foreground))");

    // Style axis lines
    g.selectAll(".domain")
      .attr("stroke", "hsl(var(--border))");

    g.selectAll(".tick line")
      .attr("stroke", "hsl(var(--border))");

    // Line generator
    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw each series
    series.forEach((seriesData, index) => {
      if (seriesData.length === 0) return;

      // Create gradient for each series
      const gradientId = `line-gradient-${index}`;
      const gradient = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
      
      gradient.append("linearGradient")
        .attr("id", gradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", height)
        .attr("x2", 0).attr("y2", 0);

      gradient.select(`#${gradientId}`)
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colors[index])
        .attr("stop-opacity", 0.3);

      gradient.select(`#${gradientId}`)
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colors[index])
        .attr("stop-opacity", 0.6);

      // Add area under the curve
      const area = d3.area<[number, number]>()
        .x(d => xScale(d[0]))
        .y0(height)
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(seriesData)
        .attr("fill", `url(#${gradientId})`)
        .attr("opacity", 0.15)
        .attr("d", area);

      // Add the line
      g.append("path")
        .datum(seriesData)
        .attr("fill", "none")
        .attr("stroke", colors[index])
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("d", line);

      // Add data points
      g.selectAll(`.dot-${index}`)
        .data(seriesData)
        .enter().append("circle")
        .attr("class", `dot-${index}`)
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
        .attr("r", 4)
        .attr("fill", colors[index])
        .attr("stroke", "hsl(var(--background))")
        .attr("stroke-width", 2)
        .style("opacity", 0)
        .on("mouseover", function(event, d) {
          d3.select(this).style("opacity", 1);
          // Add tooltip
          const tooltip = g.append("g")
            .attr("class", "tooltip")
            .attr("transform", `translate(${xScale(d[0])},${yScale(d[1]) - 10})`);
          
          tooltip.append("rect")
            .attr("x", -30)
            .attr("y", -35)
            .attr("width", 60)
            .attr("height", 30)
            .attr("fill", "hsl(var(--popover))")
            .attr("stroke", "hsl(var(--border))")
            .attr("rx", 3);
          
          tooltip.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -25)
            .attr("fill", "hsl(var(--popover-foreground))")
            .attr("font-size", "10px")
            .text(seriesNames[index]);
          
          tooltip.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -12)
            .attr("fill", "hsl(var(--popover-foreground))")
            .attr("font-size", "12px")
            .text(d[1].toFixed(3));
        })
        .on("mouseout", function() {
          d3.select(this).style("opacity", 0);
          g.select(".tooltip").remove();
        });
    });

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 20}, 20)`);

    seriesNames.forEach((name, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * 25})`);

      legendItem.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", colors[index])
        .attr("stroke-width", 3);

      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .attr("fill", "hsl(var(--foreground))")
        .attr("font-size", "14px")
        .text(name);
    });

  }, [data, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full h-auto min-w-[800px]"></svg>
      </div>
    </div>
  );
};

export default MultiSeriesChart;