import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SingleSeriesChartProps {
  title: string;
  data: [number, number | null][];
}

const SingleSeriesChart: React.FC<SingleSeriesChartProps> = ({ title, data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Filter out null values for domain calculation
    const validData = data.filter(([, value]) => value !== null) as [number, number][];
    
    if (validData.length === 0) return;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(validData, d => d[0]) as [number, number])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(validData, d => d[1]) as [number, number])
      .nice()
      .range([height, 0]);

    // Line generator that skips null values
    const line = d3.line<[number, number | null]>()
      .x(d => xScale(d[0]))
      .y(d => d[1] !== null ? yScale(d[1]) : 0)
      .defined(d => d[1] !== null)
      .curve(d3.curveMonotoneX);

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

    // Add the line with gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(var(--chart-blue))")
      .attr("stop-opacity", 0.6);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "hsl(var(--chart-blue))")
      .attr("stop-opacity", 1);

    // Add area under the curve
    const area = d3.area<[number, number | null]>()
      .x(d => xScale(d[0]))
      .y0(height)
      .y1(d => d[1] !== null ? yScale(d[1]) : height)
      .defined(d => d[1] !== null)
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "url(#line-gradient)")
      .attr("opacity", 0.2)
      .attr("d", area);

    // Add the main line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--chart-blue))")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("d", line);

    // Add data points for valid values
    g.selectAll(".dot")
      .data(validData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 4)
      .attr("fill", "hsl(var(--chart-blue))")
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
          .attr("x", -25)
          .attr("y", -20)
          .attr("width", 50)
          .attr("height", 15)
          .attr("fill", "hsl(var(--popover))")
          .attr("stroke", "hsl(var(--border))")
          .attr("rx", 3);
        
        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -10)
          .attr("fill", "hsl(var(--popover-foreground))")
          .attr("font-size", "12px")
          .text(d[1].toFixed(3));
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 0);
        g.select(".tooltip").remove();
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

export default SingleSeriesChart;