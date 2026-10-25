import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function CareerScoreRadar({ isDarkMode = true }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDarkMode ? '#1A2235' : '#ffffff',
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
      textStyle: {
        color: isDarkMode ? '#F1F5F9' : '#0F172A',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
      },
    },
    radar: {
      indicator: [
        { name: 'Research & Publications', max: 100 },
        { name: 'Clinical Competency', max: 100 },
        { name: 'Mentorship Standing', max: 100 },
        { name: 'Bioethics & AETCOM', max: 100 },
        { name: 'Procedural Logbook', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: isDarkMode ? '#94A3B8' : '#64748B',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDarkMode
            ? ['rgba(255, 255, 255, 0.01)', 'rgba(255, 255, 255, 0.03)']
            : ['rgba(0, 0, 0, 0.01)', 'rgba(0, 0, 0, 0.02)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    series: [
      {
        name: 'Dr. Aarav Sharma Competency',
        type: 'radar',
        data: [
          {
            value: [82, 88, 72, 91, 85],
            name: 'Current Performance Score',
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#10B981',
            },
            lineStyle: {
              width: 2,
              color: '#10B981',
            },
            areaStyle: {
              color: 'rgba(16, 185, 129, 0.25)',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-64">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />
    </div>
  );
}
