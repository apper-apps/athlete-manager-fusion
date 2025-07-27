import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MetricCard from "@/components/molecules/MetricCard";
import PerformanceChart from "@/components/organisms/PerformanceChart";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { performanceService } from "@/services/api/performanceService";
import { athleteService } from "@/services/api/athleteService";

const Performance = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError("Failed to load performance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateMetrics = () => {
    if (!performanceData.length) {
      return {
        totalGoals: 0,
        totalAssists: 0,
        totalMinutes: 0,
        avgPassAccuracy: 0,
        totalMatches: 0,
        topScorer: null,
        topAssister: null
      };
    }

    const totalGoals = performanceData.reduce((sum, p) => sum + (p.goals || 0), 0);
    const totalAssists = performanceData.reduce((sum, p) => sum + (p.assists || 0), 0);
    const totalMinutes = performanceData.reduce((sum, p) => sum + (p.minutesPlayed || 0), 0);
    const totalMatches = performanceData.reduce((sum, p) => sum + (p.matchesPlayed || 0), 0);
    
    const avgPassAccuracy = performanceData.length > 0
      ? Math.round(performanceData.reduce((sum, p) => sum + (p.passAccuracy || 0), 0) / performanceData.length)
      : 0;

    const topScorerData = performanceData.reduce((max, p) => (p.goals || 0) > (max.goals || 0) ? p : max, {});
    const topAssisterData = performanceData.reduce((max, p) => (p.assists || 0) > (max.assists || 0) ? p : max, {});

    const topScorer = athletes.find(a => a.Id === topScorerData.athleteId);
    const topAssister = athletes.find(a => a.Id === topAssisterData.athleteId);

    return {
      totalGoals,
      totalAssists,
      totalMinutes,
      avgPassAccuracy,
      totalMatches,
      topScorer,
      topAssister
    };
  };

  const metrics = calculateMetrics();

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
        <h1 className="text-2xl font-bold font-display text-secondary-900">Performance</h1>
        <p className="text-secondary-600 mt-1">
          Track and analyze team and individual performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Goals"
          value={metrics.totalGoals.toString()}
          icon="Target"
          trend="up"
          trendValue="+12%"
          color="success"
        />
        <MetricCard
          title="Total Assists"
          value={metrics.totalAssists.toString()}
          icon="Users"
          trend="up"
          trendValue="+8%"
          color="info"
        />
        <MetricCard
          title="Minutes Played"
          value={metrics.totalMinutes.toLocaleString()}
          icon="Clock"
          trend="up"
          trendValue="+15%"
          color="warning"
        />
        <MetricCard
          title="Pass Accuracy"
          value={`${metrics.avgPassAccuracy}%`}
          icon="CheckCircle"
          trend="up"
          trendValue="+3%"
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart 
            performanceData={performanceData}
            athletes={athletes}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {metrics.topScorer && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🥅</span>
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{metrics.topScorer.name}</p>
                    <p className="text-sm text-secondary-600">Top Scorer • {performanceData.find(p => p.athleteId === metrics.topScorer.Id)?.goals || 0} goals</p>
                  </div>
                </div>
              )}

              {metrics.topAssister && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{metrics.topAssister.name}</p>
                    <p className="text-sm text-secondary-600">Top Assister • {performanceData.find(p => p.athleteId === metrics.topAssister.Id)?.assists || 0} assists</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Team Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Total Matches</span>
                <span className="font-semibold text-secondary-900">{Math.max(...performanceData.map(p => p.matchesPlayed || 0))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Active Players</span>
                <span className="font-semibold text-secondary-900">{performanceData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Goals per Match</span>
                <span className="font-semibold text-secondary-900">
                  {metrics.totalMatches > 0 ? (metrics.totalGoals / Math.max(...performanceData.map(p => p.matchesPlayed || 1))).toFixed(1) : "0.0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Team Discipline</span>
                <span className="font-semibold text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Performance;