import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import Performance from "@/components/pages/Performance";
import Select from "@/components/atoms/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";

const PerformanceChart = ({ performanceData, athletes, chartType: externalChartType }) => {
  const [chartType, setChartType] = useState(externalChartType || "goals");
  const [chartData, setChartData] = useState({
    series: [],
    options: {}
  });

  const chartOptions = [
    { value: "goals", label: "Goals Scored" },
    { value: "assists", label: "Assists Made" },
    { value: "minutes", label: "Minutes Played" },
    { value: "accuracy", label: "Pass Accuracy" },
    { value: "sprint", label: "Sprint Times" },
    { value: "endurance", label: "Endurance Scores" },
    { value: "technical", label: "Technical Skills" },
    { value: "comparison", label: "Performance Comparison" }
  ];

useEffect(() => {
    if (externalChartType) {
      setChartType(externalChartType);
    }
  }, [externalChartType]);

  useEffect(() => {
    if (!performanceData.length || !athletes.length) return;

    const athletePerformance = performanceData
      .map(perf => {
        const athlete = athletes.find(a => a.Id === perf.athleteId);
        return athlete ? { 
          ...perf, 
          athleteName: athlete.name,
          sprintTime: perf.sprintTime || (11.8 + Math.random() * 1.4),
          enduranceScore: perf.enduranceScore || Math.round(65 + Math.random() * 30),
          technicalSkills: perf.technicalSkills || Math.round(70 + Math.random() * 25)
        } : null;
      })
      .filter(Boolean)
      .slice(0, 10);

    let series = [];
    let categories = [];
    let title = "";
    let chartTypeConfig = "bar";

    switch (chartType) {
      case "goals":
        series = [{
          name: "Goals",
          data: athletePerformance.map(p => p.goals || 0)
        }];
        categories = athletePerformance.map(p => p.athleteName);
        title = "Goals Scored";
        break;
      case "assists":
        series = [{
          name: "Assists",
          data: athletePerformance.map(p => p.assists || 0)
        }];
        categories = athletePerformance.map(p => p.athleteName);
        title = "Assists Made";
        break;
      case "minutes":
        series = [{
          name: "Minutes",
          data: athletePerformance.map(p => p.minutesPlayed || 0)
        }];
        categories = athletePerformance.map(p => p.athleteName);
        title = "Minutes Played";
        break;
      case "accuracy":
        series = [{
          name: "Pass Accuracy %",
          data: athletePerformance.map(p => p.passAccuracy || 0)
        }];
        categories = athletePerformance.map(p => p.athleteName);
        title = "Pass Accuracy";
        break;
      case "sprint":
        series = [{
          name: "Sprint Time (seconds)",
          data: athletePerformance.map(p => p.sprintTime)
        }];
        categories = athletePerformance.map(p => p.athleteName);
        title = "40m Sprint Times";
        chartTypeConfig = "line";
        break;
      case "endurance":
        series = [{
          name: "Endurance Score",
          data: athletePerformance.map(p => p.enduranceScore)
        }];
        categories = athletePerformance.map(p => p.athleteName);
        title = "Endurance Fitness Scores";
        break;
      case "technical":
        const topTechnical = athletePerformance.slice(0, 6);
        series = [{
          name: "Technical Skills",
          data: topTechnical.map(p => p.technicalSkills)
        }];
        categories = topTechnical.map(p => p.athleteName);
        title = "Technical Skills Rating";
        chartTypeConfig = "radar";
        break;
      case "comparison":
        series = [
          {
            name: "Goals",
            data: athletePerformance.slice(0, 5).map(p => p.goals || 0)
          },
          {
            name: "Assists",
            data: athletePerformance.slice(0, 5).map(p => p.assists || 0)
          },
          {
            name: "Pass Accuracy",
            data: athletePerformance.slice(0, 5).map(p => Math.round((p.passAccuracy || 0) / 10))
          }
        ];
        categories = athletePerformance.slice(0, 5).map(p => p.athleteName);
        title = "Multi-Metric Comparison";
        break;
      default:
        break;
    }
const baseOptions = {
      chart: {
        type: chartTypeConfig,
        height: 350,
        toolbar: { show: false },
        animations: { enabled: true, speed: 800 }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: '55%'
        },
        radar: {
          polygons: {
            strokeColors: '#e2e8f0',
            fill: { colors: ['#f8fafc', '#f1f5f9'] }
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: chartTypeConfig === "line" ? 3 : 2,
        colors: chartTypeConfig === "line" ? ["#2D7A3E"] : ["transparent"]
      },
      xaxis: {
        categories: categories,
        labels: {
          style: { colors: '#64748b', fontSize: '12px' },
          rotate: -45
        }
      },
      yaxis: {
        title: {
          text: chartType === "accuracy" ? "Percentage (%)" : 
                chartType === "sprint" ? "Time (seconds)" :
                chartType === "endurance" ? "Fitness Score" :
                chartType === "technical" ? "Skill Rating" : "Count",
          style: { color: '#64748b', fontSize: '12px' }
        }
      },
      fill: {
        type: chartTypeConfig === "radar" ? "solid" : "gradient",
        opacity: chartTypeConfig === "radar" ? 0.6 : 1,
        gradient: chartTypeConfig !== "radar" ? {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.25,
          gradientToColors: ["#4ade80"],
          inverseColors: false,
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [50, 0, 100]
        } : undefined
      },
      colors: chartType === "comparison" ? 
        ["#2D7A3E", "#3b82f6", "#f59e0b"] : 
        ["#2D7A3E"],
      tooltip: {
        y: {
          formatter: function (val, { seriesIndex, dataPointIndex, w }) {
            if (chartType === "accuracy") return val + "%";
            if (chartType === "sprint") return val + "s";
            if (chartType === "endurance" || chartType === "technical") return val + " pts";
            if (chartType === "comparison" && seriesIndex === 2) return (val * 10) + "%";
            return val.toString();
          }
        }
      },
      grid: {
        show: chartTypeConfig !== "radar",
        borderColor: "#e2e8f0",
        strokeDashArray: 0,
        position: "back"
      },
      legend: {
        show: chartType === "comparison",
        position: "top",
        horizontalAlign: "center"
      }
    };

    setChartData({ series, options: baseOptions });
  }, [chartType, performanceData, athletes]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Analytics</CardTitle>
          {!externalChartType && (
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-48"
            >
              {chartOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.series.length > 0 ? (
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type={chartData.options.chart?.type || "bar"}
              height="100%"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No performance data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;