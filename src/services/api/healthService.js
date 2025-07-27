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
    
    // Validate required fields
    if (!healthData.athleteId || !healthData.status || !healthData.condition) {
      throw new Error("Athlete ID, status, and condition are required");
    }

    // Validate injury-specific fields for injury statuses
    const isInjuryStatus = healthData.status.includes("Injury") || healthData.status === "Recovering";
    if (isInjuryStatus) {
      if (!healthData.injuryType || !healthData.severity || !healthData.bodyPart) {
        throw new Error("Injury type, severity, and body part are required for injury status");
      }
    }

    const newId = Math.max(...this.healthRecords.map(h => h.Id)) + 1;
    const newRecord = {
      Id: newId,
      ...healthData,
      athleteId: parseInt(healthData.athleteId),
      injuryType: isInjuryStatus ? healthData.injuryType : null,
      severity: isInjuryStatus ? healthData.severity : null,
      bodyPart: isInjuryStatus ? healthData.bodyPart : null,
      treatmentPlan: isInjuryStatus ? healthData.treatmentPlan : null,
      recoveryTimeline: isInjuryStatus ? healthData.recoveryTimeline : null,
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

    // Validate injury-specific fields for injury statuses
    const isInjuryStatus = healthData.status && (healthData.status.includes("Injury") || healthData.status === "Recovering");
    if (isInjuryStatus) {
      if (!healthData.injuryType || !healthData.severity || !healthData.bodyPart) {
        throw new Error("Injury type, severity, and body part are required for injury status");
      }
    }

    this.healthRecords[index] = { 
      ...this.healthRecords[index], 
      ...healthData,
      athleteId: healthData.athleteId ? parseInt(healthData.athleteId) : this.healthRecords[index].athleteId,
      injuryType: isInjuryStatus ? healthData.injuryType : null,
      severity: isInjuryStatus ? healthData.severity : null,
      bodyPart: isInjuryStatus ? healthData.bodyPart : null,
      treatmentPlan: isInjuryStatus ? healthData.treatmentPlan : null,
      recoveryTimeline: isInjuryStatus ? healthData.recoveryTimeline : null,
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