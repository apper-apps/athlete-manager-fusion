import trainingData from "@/services/mockData/training.json";

class TrainingService {
  constructor() {
    this.trainingSessions = [...trainingData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.trainingSessions];
  }

  async getById(id) {
    await this.delay(200);
    const session = this.trainingSessions.find(t => t.Id === parseInt(id));
    if (!session) {
      throw new Error("Training session not found");
    }
    return { ...session };
  }

  async create(sessionData) {
    await this.delay(400);
    const newId = Math.max(...this.trainingSessions.map(t => t.Id)) + 1;
    const newSession = {
      Id: newId,
      ...sessionData
    };
    this.trainingSessions.push(newSession);
    return { ...newSession };
  }

  async update(id, sessionData) {
    await this.delay(350);
    const index = this.trainingSessions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Training session not found");
    }
    this.trainingSessions[index] = { ...this.trainingSessions[index], ...sessionData };
    return { ...this.trainingSessions[index] };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.trainingSessions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Training session not found");
    }
    this.trainingSessions.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const trainingService = new TrainingService();