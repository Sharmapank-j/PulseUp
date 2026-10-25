import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function OpportunityBarChart({ isDarkMode = true }) {
  const data = [
    { name: 'Certifications', count: 22, avgCredits: 185 },
    { name: 'Med Fests', count: 14, avgCredits: 95 },
    { name: 'Quizzes', count: 12, avgCredits: 120 },
    { name: 'Research Grants', count: 10, avgCredits: 220 },
    { name: 'Observerships', count: 10, avgCredits: 140 },
  ];

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '12%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDarkMode ? '#1A2235' : '#ffffff',
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
      textStyle: {
        color: isDarkMode ? '#F1F5F9' : '#0F172A',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
      },
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: {
        lineStyle: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
      },
      axisLabel: {
        color: isDarkMode ? '#94A3B8' : '#64748B',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      },
    },
    yAxis: {
      type: 'value',
      name: 'Opportunities Cataloged',
      nameTextStyle: {
        color: isDarkMode ? '#94A3B8' : '#64748B',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
      },
      splitLine: {
        lineStyle: { color: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }
      },
      axisLabel: {
        color: isDarkMode ? '#94A3B8' : '#64748B',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
      },
    },
    series: [
      {
        name: 'Cataloged Items',
        type: 'bar',
        data: data.map(d => d.count),
        barWidth: '36%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#10B981' },
              { offset: 1, color: '#059669' }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        },
      }
    ]
  };

  return (
    <div className="w-full h-64">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />
    </div>
  );
}
