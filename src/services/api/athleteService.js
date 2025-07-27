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
      joinDate: new Date().toISOString()
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

  async delete(id) {
    await this.delay(250);
    const index = this.athletes.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Athlete not found");
    }
    this.athletes.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const athleteService = new AthleteService();