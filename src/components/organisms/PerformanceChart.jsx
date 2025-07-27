import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";

const PerformanceChart = ({ performanceData, athletes }) => {
  const [chartType, setChartType] = useState("goals");
  const [chartData, setChartData] = useState({
    series: [],
    options: {}
  });

  useEffect(() => {
    if (!performanceData.length || !athletes.length) return;

    const athletePerformance = performanceData
      .map(perf => {
        const athlete = athletes.find(a => a.Id === perf.athleteId);
        return athlete ? { ...perf, athleteName: athlete.name } : null;
      })
      .filter(Boolean)
      .slice(0, 10); // Top 10 performers

    let series = [];
    let categories = [];
    let title = "";

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
      default:
        break;
    }

    const options = {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: "60%"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            fontSize: "12px"
          },
          rotate: -45
        }
      },
      yaxis: {
        title: {
          text: title
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.25,
          gradientToColors: ["#4ade80"],
          inverseColors: false,
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [50, 0, 100]
        }
      },
      colors: ["#2D7A3E"],
      tooltip: {
        y: {
          formatter: function (val) {
            return chartType === "accuracy" ? val + "%" : val.toString();
          }
        }
      },
      grid: {
        show: true,
        borderColor: "#e2e8f0",
        strokeDashArray: 0,
        position: "back"
      }
    };

    setChartData({ series, options });
  }, [chartType, performanceData, athletes]);

  const chartOptions = [
    { value: "goals", label: "Goals Scored" },
    { value: "assists", label: "Assists Made" },
    { value: "minutes", label: "Minutes Played" },
    { value: "accuracy", label: "Pass Accuracy" }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Analytics</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        {chartData.series.length > 0 ? (
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={350}
          />
        ) : (
          <div className="flex items-center justify-center h-350 text-secondary-500">
            <p>No performance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;