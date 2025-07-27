import healthData from "@/services/mockData/health.json";

class HealthService {
  constructor() {
    this.healthRecords = [...healthData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.healthRecords];
  }

  async getById(id) {
    await this.delay(200);
    const record = this.healthRecords.find(h => h.Id === parseInt(id));
    if (!record) {
      throw new Error("Health record not found");
    }
    return { ...record };
  }

  async getByAthleteId(athleteId) {
    await this.delay(250);
    const records = this.healthRecords.filter(h => h.athleteId === parseInt(athleteId));
    return records.map(record => ({ ...record }));
  }

  async create(healthData) {
    await this.delay(400);
    const newId = Math.max(...this.healthRecords.map(h => h.Id)) + 1;
    const newRecord = {
      Id: newId,
      ...healthData,
      lastUpdated: new Date().toISOString()
    };
    this.healthRecords.push(newRecord);
    return { ...newRecord };
  }

  async update(id, healthData) {
    await this.delay(350);
    const index = this.healthRecords.findIndex(h => h.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Health record not found");
    }
    this.healthRecords[index] = { 
      ...this.healthRecords[index], 
      ...healthData,
      lastUpdated: new Date().toISOString()
    };
    return { ...this.healthRecords[index] };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.healthRecords.findIndex(h => h.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Health record not found");
    }
    this.healthRecords.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const healthService = new HealthService();