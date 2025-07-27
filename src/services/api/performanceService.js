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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const performanceService = new PerformanceService();