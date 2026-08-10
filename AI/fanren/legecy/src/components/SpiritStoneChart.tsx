import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface StoneRecord {
  timestamp: string;
  stones: number;
  change: number;
  source: string;
}

interface SpiritStoneChartProps {
  history: StoneRecord[];
  currentStones: number;
}

export const SpiritStoneChart: React.FC<SpiritStoneChartProps> = ({ history, currentStones }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawings

    const width = svgRef.current.clientWidth || 500;
    const height = 180;
    const margin = { top: 20, right: 30, bottom: 30, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Data Indices)
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, history.length - 1)])
      .range([0, innerWidth]);

    // Y Scale (Spirit Stones count)
    const minVal = d3.min(history, (d: StoneRecord) => d.stones) ?? 0;
    const maxVal = d3.max(history, (d: StoneRecord) => d.stones) ?? 100;
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, minVal - 20), maxVal + 30])
      .nice()
      .range([innerHeight, 0]);

    // Define Linear Gradients for Area & Line
    const defs = svg.append('defs');

    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'stoneAreaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#e9c176').attr('stop-opacity', 0.4);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#2d5a43').attr('stop-opacity', 0.0);

    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'stoneLineGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#34d399');
    lineGradient.append('stop').attr('offset', '50%').attr('stop-color', '#facc15');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#e9c176');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(history.length, 6)).tickFormat((d) => `#${Number(d) + 1}`);
    const yAxis = d3.axisLeft(yScale).ticks(4);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#8b938c')
      .selectAll('text')
      .attr('style', 'font-size: 10px; fill: #8b938c;');

    g.append('g')
      .call(yAxis)
      .attr('color', '#8b938c')
      .selectAll('text')
      .attr('style', 'font-size: 10px; fill: #e9c176;');

    // Area Generator
    const area = d3
      .area<StoneRecord>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1((d: StoneRecord) => yScale(d.stones))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(history)
      .attr('fill', 'url(#stoneAreaGradient)')
      .attr('d', area);

    // Line Generator
    const line = d3
      .line<StoneRecord>()
      .x((_, i) => xScale(i))
      .y((d: StoneRecord) => yScale(d.stones))
      .curve(d3.curveMonotoneX);

    // Render Path
    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', 'url(#stoneLineGradient)')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Render Data Points
    g.selectAll('.dot')
      .data(history)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (_, i) => xScale(i))
      .attr('cy', (d: StoneRecord) => yScale(d.stones))
      .attr('r', 4)
      .attr('fill', (d: StoneRecord) => (d.change >= 0 ? '#34d399' : '#ef4444'))
      .attr('stroke', '#1a1c18')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

    // Labels above dots
    g.selectAll('.dot-label')
      .data(history)
      .enter()
      .append('text')
      .attr('x', (_, i) => xScale(i))
      .attr('y', (d: StoneRecord) => yScale(d.stones) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', (d: StoneRecord) => (d.change >= 0 ? '#6ee7b7' : '#fca5a5'))
      .attr('style', 'font-size: 9px; font-weight: bold;')
      .text((d: StoneRecord) => `${d.change >= 0 ? '+' : ''}${d.change}`);
  }, [history]);

  return (
    <div className="w-full bg-[#121410]/80 border border-[#414943] rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-[#a1d1b4] flex items-center gap-1">
          📊 灵石变动曲线 (D3 统计)
        </span>
        <span className="text-[#e9c176]">当前灵石: {currentStones}</span>
      </div>
      <div className="w-full relative">
        <svg ref={svgRef} className="w-full h-44 overflow-visible" />
      </div>
    </div>
  );
};
