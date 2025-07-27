import performanceData from "@/services/mockData/performance.json";

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
    let performances = [...this.performanceData];
    
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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const performanceService = new PerformanceService();