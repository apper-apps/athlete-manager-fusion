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
      title: sessionData.title,
      date: sessionData.date,
      time: sessionData.time,
      type: sessionData.type,
      duration: sessionData.duration,
      location: sessionData.location,
      assignmentType: sessionData.assignmentType || 'team',
      assignedAthletes: sessionData.assignedAthletes || [],
      notes: sessionData.notes || '',
      description: sessionData.notes || sessionData.description || ''
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
    
    const updatedSession = {
      ...this.trainingSessions[index],
      title: sessionData.title || this.trainingSessions[index].title,
      date: sessionData.date || this.trainingSessions[index].date,
      time: sessionData.time || this.trainingSessions[index].time,
      type: sessionData.type || this.trainingSessions[index].type,
      duration: sessionData.duration || this.trainingSessions[index].duration,
      location: sessionData.location || this.trainingSessions[index].location,
      assignmentType: sessionData.assignmentType || this.trainingSessions[index].assignmentType,
      assignedAthletes: sessionData.assignedAthletes !== undefined ? sessionData.assignedAthletes : this.trainingSessions[index].assignedAthletes,
      notes: sessionData.notes !== undefined ? sessionData.notes : this.trainingSessions[index].notes,
      description: sessionData.description || sessionData.notes || this.trainingSessions[index].description
    };
    
    this.trainingSessions[index] = updatedSession;
    return { ...updatedSession };
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

async getRiskAssessmentData(athleteId = null) {
    await this.delay(200);
    let sessions = [...this.trainingSessions];
    
    if (athleteId) {
      sessions = sessions.filter(session => session.athleteId === parseInt(athleteId));
    }

    // Calculate training load over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = sessions.filter(session => 
      new Date(session.date) >= thirtyDaysAgo
    );

    const riskData = sessions.reduce((acc, session) => {
      const athleteId = session.athleteId;
      if (!acc[athleteId]) {
        acc[athleteId] = {
          athleteId,
          totalLoad: 0,
          sessionCount: 0,
          avgIntensity: 0,
          recentLoad: 0,
          loadSpike: false
        };
      }

      acc[athleteId].totalLoad += session.intensity || 0;
      acc[athleteId].sessionCount += 1;
      
      // Recent load calculation
      if (recentSessions.find(rs => rs.Id === session.Id)) {
        acc[athleteId].recentLoad += session.intensity || 0;
      }

      return acc;
    }, {});

    // Calculate averages and load spikes
    Object.values(riskData).forEach(data => {
      data.avgIntensity = data.sessionCount > 0 ? data.totalLoad / data.sessionCount : 0;
      data.loadSpike = data.recentLoad > (data.avgIntensity * 1.5);
    });

    return athleteId ? riskData[athleteId] : riskData;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const trainingService = new TrainingService();