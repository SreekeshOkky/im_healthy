import React from 'react';
import ReactECharts from 'echarts-for-react';
import { FastingSession } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface MonthlyChartProps {
  history: FastingSession[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ history }) => {
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });

  // Process data for the chart
  const dates: string[] = [];
  const actualHours: number[] = [];
  const targetHours: number[] = [];

  daysInMonth.forEach(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const sessionsForDay = history.filter(session => {
      const sessionDate = format(new Date(session.startTime), 'yyyy-MM-dd');
      return sessionDate === dayStr && session.endTime;
    });

    const totalHours = sessionsForDay.reduce((total, session) => {
      if (session.endTime) {
        return total + (session.endTime - session.startTime) / (1000 * 60 * 60);
      }
      return total;
    }, 0);

    dates.push(format(day, 'dd'));
    actualHours.push(Math.round(totalHours * 10) / 10);
    targetHours.push(sessionsForDay[0]?.targetHours || 0);
  });

  const option = {
    title: {
      text: 'Monthly Fasting Pattern',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let result = `Day ${params[0].name}<br/>`;
        params.forEach((param: any) => {
          const hours = param.value || 0;
          const color = param.color;
          result += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
          result += `${param.seriesName}: ${hours} hours<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Actual Hours', 'Target Hours'],
      bottom: 0
    },
    grid: {
      left: 65,
      right: 20,
      bottom: 80,
      top: 60,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: dates,
      name: 'Day of Month',
      nameLocation: 'middle',
      nameGap: 35,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: 'Hours',
      nameLocation: 'middle',
      nameGap: 45,
      nameRotate: 90,
      axisLabel: {
        formatter: '{value} h',
        margin: 12
      }
    },
    series: [
      {
        name: 'Actual Hours',
        type: 'bar',
        data: actualHours,
        itemStyle: {
          color: '#3B82F6'
        },
        barMaxWidth: 20,
        emphasis: {
          itemStyle: {
            color: '#2563EB'
          }
        }
      },
      {
        name: 'Target Hours',
        type: 'line',
        data: targetHours,
        itemStyle: {
          color: '#EF4444'
        },
        lineStyle: {
          width: 2
        },
        symbol: 'none',
        emphasis: {
          lineStyle: {
            width: 3
          }
        }
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-[400px]">
        <ReactECharts 
          option={option}
          style={{ height: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  );
}; 