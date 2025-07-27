import athletesData from "@/services/mockData/athletes.json";

class AthleteService {
  constructor() {
    this.athletes = [...athletesData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.athletes];
  }

  async getById(id) {
    await this.delay(200);
    const athlete = this.athletes.find(a => a.Id === parseInt(id));
    if (!athlete) {
      throw new Error("Athlete not found");
    }
    return { ...athlete };
  }

  async create(athleteData) {
    await this.delay(400);
    const newId = Math.max(...this.athletes.map(a => a.Id)) + 1;
    const newAthlete = {
      Id: newId,
      ...athleteData,
      joinDate: new Date().toISOString(),
      physicalStats: {
        height: "",
        weight: "",
        bodyFatPercentage: ""
      },
      medicalHistory: [],
      performanceHistory: []
    };
    this.athletes.push(newAthlete);
    return { ...newAthlete };
  }

  async update(id, athleteData) {
    await this.delay(350);
    const index = this.athletes.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Athlete not found");
    }
    this.athletes[index] = { ...this.athletes[index], ...athleteData };
    return { ...this.athletes[index] };
  }

  async updatePhysicalStats(id, physicalStats) {
    await this.delay(300);
    const index = this.athletes.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Athlete not found");
    }
    this.athletes[index].physicalStats = { ...this.athletes[index].physicalStats, ...physicalStats };
    return { ...this.athletes[index] };
  }

  async updateMedicalHistory(id, medicalHistory) {
    await this.delay(300);
    const index = this.athletes.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Athlete not found");
    }
    this.athletes[index].medicalHistory = medicalHistory;
    return { ...this.athletes[index] };
  }

  async updatePerformanceHistory(id, performanceHistory) {
    await this.delay(300);
    const index = this.athletes.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Athlete not found");
    }
    this.athletes[index].performanceHistory = performanceHistory;
    return { ...this.athletes[index] };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.athletes.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Athlete not found");
    }
    this.athletes.splice(index, 1);
    return true;
  }

async getRiskAssessment(athleteId = null) {
    await this.delay(300);
    const { trainingService } = await import('./trainingService');
    const { healthService } = await import('./healthService');
    const { performanceService } = await import('./performanceService');
    const { riskAssessmentService } = await import('./riskAssessmentService');

    try {
      const [trainingData, injuryData, performanceData] = await Promise.all([
        trainingService.getRiskAssessmentData(athleteId),
        healthService.getInjuryHistory(athleteId),
        performanceService.getPerformanceRiskData(athleteId)
      ]);

      if (athleteId) {
        const athlete = await this.getById(athleteId);
        return riskAssessmentService.calculateRiskScore(athlete, trainingData, injuryData, performanceData);
      } else {
        const athletes = await this.getAll();
        const riskAssessments = athletes.map(athlete => {
          const athleteTraining = trainingData[athlete.Id] || {};
          const athleteInjury = injuryData[athlete.Id] || {};
          const athletePerformance = performanceData[athlete.Id] || {};
          
          return riskAssessmentService.calculateRiskScore(athlete, athleteTraining, athleteInjury, athletePerformance);
        });

        return riskAssessments;
      }
    } catch (error) {
      console.error('Error calculating risk assessment:', error);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const athleteService = new AthleteService();