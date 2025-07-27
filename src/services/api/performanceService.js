import performanceData from "@/services/mockData/performance.json";
import React from "react";
import Error from "@/components/ui/Error";

class PerformanceService {
  constructor() {
    this.performance = [...performanceData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.performance];
  }

  async getById(id) {
    await this.delay(200);
    const record = this.performance.find(p => p.Id === parseInt(id));
    if (!record) {
      throw new Error("Performance record not found");
    }
    return { ...record };
  }

async getByAthleteId(athleteId) {
    await this.delay(250);
    const records = this.performance.filter(p => p.athleteId === parseInt(athleteId));
    return records.map(record => ({ ...record }));
  }

  async getPerformanceByDateRange(startDate, endDate) {
    await this.delay(300);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.performance.filter(p => {
      const recordDate = new Date(p.lastUpdated);
      return recordDate >= start && recordDate <= end;
    }).map(record => ({ ...record }));
  }

  async getPerformanceMetrics(athleteId = null, metricType = null) {
    await this.delay(250);
    let data = [...this.performance];
    
    if (athleteId) {
      data = data.filter(p => p.athleteId === parseInt(athleteId));
    }

    const metrics = {
      totalGoals: data.reduce((sum, p) => sum + (p.goals || 0), 0),
      totalAssists: data.reduce((sum, p) => sum + (p.assists || 0), 0),
      totalMinutes: data.reduce((sum, p) => sum + (p.minutesPlayed || 0), 0),
      avgPassAccuracy: data.length > 0 ? Math.round(data.reduce((sum, p) => sum + (p.passAccuracy || 0), 0) / data.length) : 0,
      totalMatches: data.reduce((sum, p) => sum + (p.matchesPlayed || 0), 0),
      avgSprintTime: data.length > 0 ? parseFloat((data.reduce((sum, p) => sum + (p.sprintTime || 12.5), 0) / data.length).toFixed(2)) : 12.5,
      avgEnduranceScore: data.length > 0 ? Math.round(data.reduce((sum, p) => sum + (p.enduranceScore || 75), 0) / data.length) : 75,
      technicalSkillsAvg: data.length > 0 ? Math.round(data.reduce((sum, p) => sum + (p.technicalSkills || 80), 0) / data.length) : 80
    };

    return metricType ? metrics[metricType] : metrics;
  }

  async getSprintTimes(limit = 10) {
    await this.delay(200);
    return this.performance
      .map(p => ({
        ...p,
        sprintTime: p.sprintTime || (11.8 + Math.random() * 1.4) // Generate realistic sprint times 11.8-13.2s
      }))
      .sort((a, b) => a.sprintTime - b.sprintTime)
      .slice(0, limit);
  }

  async getEnduranceScores(limit = 10) {
    await this.delay(200);
    return this.performance
      .map(p => ({
        ...p,
        enduranceScore: p.enduranceScore || Math.round(65 + Math.random() * 30) // Generate scores 65-95
      }))
      .sort((a, b) => b.enduranceScore - a.enduranceScore)
      .slice(0, limit);
  }

  async getTechnicalSkills() {
    await this.delay(200);
    return this.performance.map(p => ({
      ...p,
      technicalSkills: {
        shooting: p.shooting || Math.round(70 + Math.random() * 25),
        passing: p.passing || Math.round(75 + Math.random() * 20),
        dribbling: p.dribbling || Math.round(65 + Math.random() * 30),
        defending: p.defending || Math.round(60 + Math.random() * 35),
        crossing: p.crossing || Math.round(65 + Math.random() * 30),
        finishing: p.finishing || Math.round(70 + Math.random() * 25)
      }
    }));
  }

  async create(performanceData) {
    await this.delay(400);
    const newId = Math.max(...this.performance.map(p => p.Id)) + 1;
    const newRecord = {
      Id: newId,
      ...performanceData,
      lastUpdated: new Date().toISOString()
    };
    this.performance.push(newRecord);
    return { ...newRecord };
  }

  async update(id, performanceData) {
    await this.delay(350);
    const index = this.performance.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Performance record not found");
    }
    this.performance[index] = { 
      ...this.performance[index], 
      ...performanceData,
      lastUpdated: new Date().toISOString()
    };
    return { ...this.performance[index] };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.performance.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Performance record not found");
    }
    this.performance.splice(index, 1);
    return true;
  }

async getPerformanceRiskData(athleteId = null) {
    await this.delay(200);
    let performances = [...this.performance];
    
    if (athleteId) {
      performances = performances.filter(perf => perf.athleteId === parseInt(athleteId));
    }

    const riskData = performances.reduce((acc, performance) => {
      const athleteId = performance.athleteId;
      if (!acc[athleteId]) {
        acc[athleteId] = {
          athleteId,
          performanceCount: 0,
          avgScore: 0,
          recentDecline: false,
          fatigueIndicators: 0,
          lastPerformanceDate: null
        };
      }

      acc[athleteId].performanceCount += 1;
      acc[athleteId].avgScore += performance.overallScore || 0;

      // Check for fatigue indicators
      if (performance.overallScore < 60) {
        acc[athleteId].fatigueIndicators += 1;
      }

      // Update last performance date
      if (!acc[athleteId].lastPerformanceDate || new Date(performance.date) > new Date(acc[athleteId].lastPerformanceDate)) {
        acc[athleteId].lastPerformanceDate = performance.date;
      }

      return acc;
    }, {});

    // Calculate averages and trends
    Object.values(riskData).forEach(data => {
      data.avgScore = data.performanceCount > 0 ? data.avgScore / data.performanceCount : 0;
      
      // Check for recent performance decline
      const recentPerfs = performances
        .filter(p => p.athleteId === data.athleteId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
        
      if (recentPerfs.length >= 3) {
        const recentAvg = recentPerfs.reduce((sum, p) => sum + (p.overallScore || 0), 0) / recentPerfs.length;
        data.recentDecline = recentAvg < (data.avgScore * 0.85);
      }
});

    return athleteId ? riskData[athleteId] : riskData;
  }

  async getTrendAnalysis(athleteId = null, metricType = 'all', periods = 6) {
    await this.delay(300);
    let data = [...this.performance];
    
    if (athleteId) {
      data = data.filter(p => p.athleteId === parseInt(athleteId));
    }

    const generateHistoricalTrend = (current, periods) => {
      const trend = [];
      const baseVariance = 0.15; // 15% base variance
      
      for (let i = periods - 1; i >= 0; i--) {
        const timeDecay = i / periods; // More recent = less variance
        const variance = 1 + (Math.random() - 0.5) * baseVariance * (1 + timeDecay);
        trend.push({
          period: `Period ${periods - i}`,
          value: Math.round(current * variance),
          change: i === periods - 1 ? 0 : Math.round(((current * variance) - trend[trend.length - 1]?.value || current) / (trend[trend.length - 1]?.value || current) * 100)
        });
      }
      return trend;
    };

    const calculateTrendMetrics = (trendData) => {
      const values = trendData.map(t => t.value);
      const changes = trendData.slice(1).map(t => t.change);
      
      return {
        average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        min: Math.min(...values),
        max: Math.max(...values),
        volatility: Math.round(Math.sqrt(changes.reduce((a, b) => a + b * b, 0) / changes.length) * 100) / 100,
        trend: changes.length > 0 ? (changes.reduce((a, b) => a + b, 0) > 0 ? 'increasing' : 'decreasing') : 'stable'
      };
    };

    const metrics = await this.getPerformanceMetrics(athleteId);
    
    const trendAnalysis = {
      goals: {
        historical: generateHistoricalTrend(metrics.totalGoals / 8, periods), // Per athlete average
        metrics: null
      },
      assists: {
        historical: generateHistoricalTrend(metrics.totalAssists / 8, periods),
        metrics: null
      },
      passAccuracy: {
        historical: generateHistoricalTrend(metrics.avgPassAccuracy, periods),
        metrics: null
      },
      sprintTime: {
        historical: generateHistoricalTrend(metrics.avgSprintTime, periods),
        metrics: null
      },
      endurance: {
        historical: generateHistoricalTrend(metrics.avgEnduranceScore, periods),
        metrics: null
      },
      technicalSkills: {
        historical: generateHistoricalTrend(metrics.technicalSkillsAvg, periods),
        metrics: null
      }
    };

    // Calculate trend metrics for each
    Object.keys(trendAnalysis).forEach(key => {
      trendAnalysis[key].metrics = calculateTrendMetrics(trendAnalysis[key].historical);
    });

    return metricType === 'all' ? trendAnalysis : trendAnalysis[metricType];
  }

  async getPerformanceForecast(athleteId = null, forecastPeriods = 3) {
    await this.delay(350);
    
    const trendData = await this.getTrendAnalysis(athleteId, 'all', 6);
    
    const linearRegression = (data) => {
      const n = data.length;
      const x = data.map((_, i) => i + 1);
      const y = data.map(d => d.value);
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept };
    };

    const generateForecast = (historical, periods) => {
      const { slope, intercept } = linearRegression(historical);
      const forecast = [];
      
      for (let i = 1; i <= periods; i++) {
        const predictedValue = slope * (historical.length + i) + intercept;
        const confidence = Math.max(0.6, 1 - (i * 0.1)); // Decreasing confidence
        
        forecast.push({
          period: `Forecast ${i}`,
          predictedValue: Math.max(0, Math.round(predictedValue)),
          confidence: Math.round(confidence * 100),
          range: {
            min: Math.max(0, Math.round(predictedValue * 0.85)),
            max: Math.round(predictedValue * 1.15)
          }
        });
      }
      
      return forecast;
    };

    const forecasts = {};
    Object.keys(trendData).forEach(metric => {
      forecasts[metric] = {
        historical: trendData[metric].historical,
        forecast: generateForecast(trendData[metric].historical, forecastPeriods),
        reliability: trendData[metric].metrics.volatility < 15 ? 'high' : 
                    trendData[metric].metrics.volatility < 30 ? 'medium' : 'low'
      };
    });

    return forecasts;
  }

  async getPerformanceInsights(athleteId = null) {
    await this.delay(250);
    
    const [metrics, trends, forecasts] = await Promise.all([
      this.getPerformanceMetrics(athleteId),
      this.getTrendAnalysis(athleteId, 'all', 6),
      this.getPerformanceForecast(athleteId, 3)
    ]);

    const generateInsights = () => {
      const insights = [];
      
      // Performance trend insights
      Object.keys(trends).forEach(metric => {
        const trend = trends[metric];
        if (trend.metrics.trend === 'increasing' && trend.metrics.volatility < 20) {
          insights.push({
            type: 'positive',
            metric: metric,
            message: `${metric.charAt(0).toUpperCase() + metric.slice(1)} showing consistent improvement over recent periods`,
            impact: 'high',
            recommendation: `Continue current training approach for ${metric}`
          });
        } else if (trend.metrics.trend === 'decreasing' && trend.metrics.volatility > 25) {
          insights.push({
            type: 'warning',
            metric: metric,
            message: `${metric.charAt(0).toUpperCase() + metric.slice(1)} showing declining trend with high volatility`,
            impact: 'high',
            recommendation: `Review training methods and consider performance analysis for ${metric}`
          });
        }
      });

      // Forecast insights
      Object.keys(forecasts).forEach(metric => {
        const forecast = forecasts[metric];
        if (forecast.reliability === 'high' && forecast.forecast[0].predictedValue > trends[metric].metrics.average * 1.1) {
          insights.push({
            type: 'positive',
            metric: metric,
            message: `${metric.charAt(0).toUpperCase() + metric.slice(1)} forecasted to exceed historical average by 10%+`,
            impact: 'medium',
            recommendation: `Maintain current performance trajectory for ${metric}`
          });
        }
      });

      // Performance balance insights
      const goalAssistRatio = metrics.totalGoals / Math.max(metrics.totalAssists, 1);
      if (goalAssistRatio > 2) {
        insights.push({
          type: 'info',
          metric: 'balance',
          message: 'High goal-to-assist ratio indicates strong finishing ability',
          impact: 'medium',
          recommendation: 'Consider developing playmaking skills to complement scoring ability'
        });
      }

      return insights.slice(0, 5); // Limit to top 5 insights
    };

    return {
      summary: {
        overallTrend: Object.values(trends).filter(t => t.metrics.trend === 'increasing').length > 3 ? 'improving' : 'stable',
        keyStrengths: Object.keys(trends).filter(key => trends[key].metrics.trend === 'increasing').slice(0, 3),
        areasForImprovement: Object.keys(trends).filter(key => trends[key].metrics.trend === 'decreasing').slice(0, 2),
        forecastReliability: Object.values(forecasts).filter(f => f.reliability === 'high').length / Object.keys(forecasts).length
      },
      insights: generateInsights(),
      recommendations: [
        'Focus on consistency in training to reduce performance volatility',
        'Monitor declining metrics closely and adjust training accordingly', 
        'Leverage strong performing areas to boost overall team contribution'
      ]
};
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const performanceService = new PerformanceService();