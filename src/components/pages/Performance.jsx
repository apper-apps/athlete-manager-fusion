import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { performanceService } from "@/services/api/performanceService";
import { athleteService } from "@/services/api/athleteService";
import ApperIcon from "@/components/ApperIcon";
import FilterBar from "@/components/molecules/FilterBar";
import MetricCard from "@/components/molecules/MetricCard";
import PerformanceChart from "@/components/organisms/PerformanceChart";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Athletes from "@/components/pages/Athletes";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";

const Performance = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    athlete: "",
    startDate: "",
    endDate: "",
    metricType: "all"
  });
  const [selectedChart, setSelectedChart] = useState("goals");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [performance, athleteList] = await Promise.all([
        performanceService.getAll(),
        athleteService.getAll()
      ]);
      setPerformanceData(performance);
      setAthletes(athleteList);
      setFilteredData(performance);
      toast.success("Performance data loaded successfully");
    } catch (err) {
      setError("Failed to load performance data. Please try again.");
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, performanceData]);

  const applyFilters = () => {
    let filtered = [...performanceData];

    if (filters.athlete) {
      filtered = filtered.filter(p => p.athleteId === parseInt(filters.athlete));
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      filtered = filtered.filter(p => {
        const recordDate = new Date(p.lastUpdated);
        return recordDate >= start && recordDate <= end;
      });
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      athlete: "",
      startDate: "",
      endDate: "",
      metricType: "all"
    });
    toast.info("Filters cleared");
  };
const calculateMetrics = () => {
    const data = filteredData.length ? filteredData : performanceData;
    
    if (!data.length) {
      return {
        totalGoals: 0,
        totalAssists: 0,
        totalMinutes: 0,
        avgPassAccuracy: 0,
        totalMatches: 0,
        avgSprintTime: 0,
        avgEnduranceScore: 0,
        avgTechnicalSkills: 0,
        topScorer: null,
        topAssister: null,
        trends: {
          goals: { trend: 'neutral', value: '0%', prediction: 0 },
          assists: { trend: 'neutral', value: '0%', prediction: 0 },
          sprintTime: { trend: 'neutral', value: '0%', prediction: 0 },
          endurance: { trend: 'neutral', value: '0%', prediction: 0 },
          passAccuracy: { trend: 'neutral', value: '0%', prediction: 0 },
          technicalSkills: { trend: 'neutral', value: '0%', prediction: 0 },
          minutes: { trend: 'neutral', value: '0%', prediction: 0 },
          matches: { trend: 'neutral', value: '0%', prediction: 0 }
        }
      };
    }

    // Current period calculations
    const totalGoals = data.reduce((sum, p) => sum + (p.goals || 0), 0);
    const totalAssists = data.reduce((sum, p) => sum + (p.assists || 0), 0);
    const totalMinutes = data.reduce((sum, p) => sum + (p.minutesPlayed || 0), 0);
    const totalMatches = data.reduce((sum, p) => sum + (p.matchesPlayed || 0), 0);
    
    const avgPassAccuracy = data.length > 0
      ? Math.round(data.reduce((sum, p) => sum + (p.passAccuracy || 0), 0) / data.length)
      : 0;

    const avgSprintTime = data.length > 0
      ? parseFloat((data.reduce((sum, p) => sum + (p.sprintTime || 12.5), 0) / data.length).toFixed(2))
      : 12.5;

    const avgEnduranceScore = data.length > 0
      ? Math.round(data.reduce((sum, p) => sum + (p.enduranceScore || 75), 0) / data.length)
      : 75;

    const avgTechnicalSkills = data.length > 0
      ? Math.round(data.reduce((sum, p) => sum + (p.technicalSkills || 80), 0) / data.length)
      : 80;

    // Historical trend analysis (simulate previous period)
    const calculateTrend = (current, baseline, isLowerBetter = false) => {
      const variance = Math.random() * 0.3 + 0.85; // 85-115% variance
      const previous = baseline * variance;
      const change = ((current - previous) / previous) * 100;
      const trend = Math.abs(change) < 2 ? 'neutral' : 
                   (isLowerBetter ? (change < 0 ? 'up' : 'down') : (change > 0 ? 'up' : 'down'));
      const prediction = current + (current * (change / 100) * 0.5); // Predict next period
      
      return {
        trend,
        value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
        prediction: Math.round(prediction * 100) / 100
      };
    };

    const trends = {
      goals: calculateTrend(totalGoals, 35),
      assists: calculateTrend(totalAssists, 42),
      sprintTime: calculateTrend(avgSprintTime, 12.8, true),
      endurance: calculateTrend(avgEnduranceScore, 72),
      passAccuracy: calculateTrend(avgPassAccuracy, 83),
      technicalSkills: calculateTrend(avgTechnicalSkills, 78),
      minutes: calculateTrend(totalMinutes, 11200),
      matches: calculateTrend(totalMatches, 135)
    };

    const topScorerData = data.reduce((max, p) => (p.goals || 0) > (max.goals || 0) ? p : max, {});
    const topAssisterData = data.reduce((max, p) => (p.assists || 0) > (max.assists || 0) ? p : max, {});

    const topScorer = athletes.find(a => a.Id === topScorerData.athleteId);
    const topAssister = athletes.find(a => a.Id === topAssisterData.athleteId);

    return {
      totalGoals,
      totalAssists,
      totalMinutes,
      avgPassAccuracy,
      totalMatches,
      avgSprintTime,
      avgEnduranceScore,
      avgTechnicalSkills,
      topScorer,
      topAssister,
      trends
    };
  };

  const metrics = calculateMetrics();

  const metricTypes = [
    { value: "all", label: "All Metrics" },
    { value: "goals", label: "Goals" },
    { value: "assists", label: "Assists" },
    { value: "accuracy", label: "Pass Accuracy" },
    { value: "sprint", label: "Sprint Times" },
    { value: "endurance", label: "Endurance" },
    { value: "technical", label: "Technical Skills" }
  ];
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-secondary-200 rounded w-48 animate-pulse"></div>
        <Loading type="metrics" />
        <Loading type="chart" />
      </div>
    );
  }

  if (error) {
    return (
      <Error 
        title="Failed to Load Performance Data"
        message={error}
        onRetry={loadData}
      />
    );
  }

  if (!performanceData.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-900">Performance</h1>
          <p className="text-secondary-600 mt-1">
            Track and analyze team and individual performance metrics
          </p>
        </div>
        <Empty
          title="No Performance Data"
          message="Performance metrics will appear here once athletes start competing and training data is recorded"
          icon="TrendingUp"
        />
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold font-display text-secondary-900">Performance Dashboard</h1>
        <p className="text-secondary-600 mt-1">
          Comprehensive analysis of team and individual soccer performance metrics
        </p>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ApperIcon name="Filter" className="h-5 w-5 mr-2" />
            Performance Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select
              value={filters.athlete}
              onChange={(e) => handleFilterChange("athlete", e.target.value)}
              className="w-full"
            >
              <option value="">All Athletes</option>
              {athletes.map(athlete => (
                <option key={athlete.Id} value={athlete.Id}>
                  {athlete.name}
                </option>
              ))}
            </Select>
            
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              placeholder="Start Date"
              className="w-full"
            />
            
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              placeholder="End Date"
              className="w-full"
            />
            
            <Select
              value={filters.metricType}
              onChange={(e) => handleFilterChange("metricType", e.target.value)}
              className="w-full"
            >
              {metricTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              <ApperIcon name="RotateCcw" className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
{/* Enhanced Metrics Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Goals"
          value={metrics.totalGoals.toString()}
          icon="Target"
          trend={metrics.trends.goals.trend}
          trendValue={metrics.trends.goals.value}
          color="success"
          prediction={metrics.trends.goals.prediction}
        />
        <MetricCard
          title="Total Assists"
          value={metrics.totalAssists.toString()}
          icon="Users"
          trend={metrics.trends.assists.trend}
          trendValue={metrics.trends.assists.value}
          color="info"
          prediction={metrics.trends.assists.prediction}
        />
        <MetricCard
          title="Avg Sprint Time"
          value={`${metrics.avgSprintTime}s`}
          icon="Zap"
          trend={metrics.trends.sprintTime.trend}
          trendValue={metrics.trends.sprintTime.value}
          color="primary"
          prediction={`${metrics.trends.sprintTime.prediction}s`}
        />
        <MetricCard
          title="Endurance Score"
          value={`${metrics.avgEnduranceScore}`}
          icon="Activity"
          trend={metrics.trends.endurance.trend}
          trendValue={metrics.trends.endurance.value}
          color="warning"
          prediction={`${metrics.trends.endurance.prediction} pts`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pass Accuracy"
          value={`${metrics.avgPassAccuracy}%`}
          icon="CheckCircle"
          trend={metrics.trends.passAccuracy.trend}
          trendValue={metrics.trends.passAccuracy.value}
          color="primary"
          prediction={`${metrics.trends.passAccuracy.prediction}%`}
        />
        <MetricCard
          title="Technical Skills"
          value={`${metrics.avgTechnicalSkills}`}
          icon="Star"
          trend={metrics.trends.technicalSkills.trend}
          trendValue={metrics.trends.technicalSkills.value}
          color="info"
          prediction={`${metrics.trends.technicalSkills.prediction} pts`}
        />
        <MetricCard
          title="Minutes Played"
          value={metrics.totalMinutes.toLocaleString()}
          icon="Clock"
          trend={metrics.trends.minutes.trend}
          trendValue={metrics.trends.minutes.value}
          color="warning"
          prediction={metrics.trends.minutes.prediction.toLocaleString()}
        />
        <MetricCard
          title="Total Matches"
          value={metrics.totalMatches.toString()}
          icon="Calendar"
          trend={metrics.trends.matches.trend}
          trendValue={metrics.trends.matches.value}
          color="success"
          prediction={metrics.trends.matches.prediction.toString()}
        />
      </div>

{/* Chart Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
{['goals', 'assists', 'sprint', 'endurance', 'technical', 'comparison', 'trends', 'forecast'].map(chart => (
              <Button
                key={chart}
                variant={selectedChart === chart ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart(chart)}
              >
                {chart.charAt(0).toUpperCase() + chart.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart 
          performanceData={filteredData}
          athletes={athletes}
          chartType={selectedChart}
        />
        <PerformanceChart 
          performanceData={filteredData}
          athletes={athletes}
          chartType={selectedChart === 'goals' ? 'assists' : 'goals'}
        />
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="TrendingUp" className="h-5 w-5 mr-2" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topScorer ? (
              <div>
                <p className="font-semibold">{metrics.topScorer.name}</p>
                <p className="text-sm text-secondary-600">Goals Leader</p>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  {performanceData.find(p => p.athleteId === metrics.topScorer.Id)?.goals || 0} goals
                </p>
              </div>
            ) : (
              <p className="text-secondary-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="Users" className="h-5 w-5 mr-2" />
              Team Playmaker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topAssister ? (
              <div>
                <p className="font-semibold">{metrics.topAssister.name}</p>
                <p className="text-sm text-secondary-600">Assists Leader</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {performanceData.find(p => p.athleteId === metrics.topAssister.Id)?.assists || 0} assists
                </p>
              </div>
            ) : (
              <p className="text-secondary-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="BarChart3" className="h-5 w-5 mr-2" />
              Team Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Players</span>
                <span className="font-semibold">{filteredData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Goals</span>
                <span className="font-semibold">{metrics.totalGoals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Accuracy</span>
                <span className="font-semibold">{metrics.avgPassAccuracy}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
</div>
    </motion.div>
  );
};

export default Performance;