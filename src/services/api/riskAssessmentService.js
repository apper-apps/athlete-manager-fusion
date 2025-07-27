class RiskAssessmentService {
  calculateRiskScore(athlete, trainingData = {}, injuryData = {}, performanceData = {}) {
    let riskScore = 0;
    const riskFactors = [];
    
    // Training Load Risk (0-40 points)
    const trainingRisk = this.calculateTrainingRisk(trainingData);
    riskScore += trainingRisk.score;
    if (trainingRisk.factors.length > 0) {
      riskFactors.push(...trainingRisk.factors);
    }
    
    // Injury History Risk (0-35 points)
    const injuryRisk = this.calculateInjuryRisk(injuryData);
    riskScore += injuryRisk.score;
    if (injuryRisk.factors.length > 0) {
      riskFactors.push(...injuryRisk.factors);
    }
    
    // Performance Risk (0-25 points)
    const performanceRisk = this.calculatePerformanceRisk(performanceData);
    riskScore += performanceRisk.score;
    if (performanceRisk.factors.length > 0) {
      riskFactors.push(...performanceRisk.factors);
    }
    
    const riskLevel = this.determineRiskLevel(riskScore);
    const recommendations = this.generateRecommendations(riskLevel, riskFactors);
    
    return {
      athleteId: athlete.Id,
      athleteName: athlete.name,
      position: athlete.position,
      riskScore,
      riskLevel,
      riskFactors,
      recommendations,
      lastUpdated: new Date().toISOString(),
      trainingRisk: trainingRisk.score,
      injuryRisk: injuryRisk.score,
      performanceRisk: performanceRisk.score
    };
  }
  
  calculateTrainingRisk(trainingData) {
    let score = 0;
    const factors = [];
    
    if (!trainingData || Object.keys(trainingData).length === 0) {
      return { score: 10, factors: ['Insufficient training data'] };
    }
    
    // High training load
    if (trainingData.avgIntensity > 8) {
      score += 15;
      factors.push('High average training intensity');
    } else if (trainingData.avgIntensity > 6) {
      score += 8;
      factors.push('Moderate training intensity');
    }
    
    // Load spike detection
    if (trainingData.loadSpike) {
      score += 20;
      factors.push('Recent training load spike detected');
    }
    
    // Insufficient training
    if (trainingData.sessionCount < 8) {
      score += 12;
      factors.push('Low training frequency');
    }
    
    // Very high recent load
    if (trainingData.recentLoad > trainingData.totalLoad * 0.6) {
      score += 8;
      factors.push('Concentrated recent training load');
    }
    
    return { score: Math.min(score, 40), factors };
  }
  
  calculateInjuryRisk(injuryData) {
    let score = 0;
    const factors = [];
    
    if (!injuryData || Object.keys(injuryData).length === 0) {
      return { score: 0, factors: [] };
    }
    
    // Recent injuries
    if (injuryData.recentInjuries > 0) {
      score += injuryData.recentInjuries * 10;
      factors.push(`${injuryData.recentInjuries} recent injury(ies) in last 6 months`);
    }
    
    // Severe injuries
    if (injuryData.severeInjuries > 0) {
      score += injuryData.severeInjuries * 8;
      factors.push(`${injuryData.severeInjuries} severe injury(ies) in history`);
    }
    
    // Total injury count
    if (injuryData.totalInjuries > 5) {
      score += 10;
      factors.push('High total injury count');
    } else if (injuryData.totalInjuries > 2) {
      score += 5;
      factors.push('Moderate injury history');
    }
    
    // Very recent injury
    if (injuryData.lastInjuryDate) {
      const daysSinceInjury = (new Date() - new Date(injuryData.lastInjuryDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceInjury < 30) {
        score += 12;
        factors.push('Very recent injury (within 30 days)');
      } else if (daysSinceInjury < 90) {
        score += 6;
        factors.push('Recent injury (within 90 days)');
      }
    }
    
    return { score: Math.min(score, 35), factors };
  }
  
  calculatePerformanceRisk(performanceData) {
    let score = 0;
    const factors = [];
    
    if (!performanceData || Object.keys(performanceData).length === 0) {
      return { score: 5, factors: ['Limited performance data'] };
    }
    
    // Performance decline
    if (performanceData.recentDecline) {
      score += 15;
      factors.push('Recent performance decline detected');
    }
    
    // Low average performance
    if (performanceData.avgScore < 60) {
      score += 10;
      factors.push('Below average performance scores');
    } else if (performanceData.avgScore < 70) {
      score += 5;
      factors.push('Moderate performance concerns');
    }
    
    // Fatigue indicators
    if (performanceData.fatigueIndicators > 3) {
      score += 8;
      factors.push('Multiple fatigue indicators detected');
    } else if (performanceData.fatigueIndicators > 1) {
      score += 4;
      factors.push('Some fatigue indicators present');
    }
    
    // Stale performance data
    if (performanceData.lastPerformanceDate) {
      const daysSincePerformance = (new Date() - new Date(performanceData.lastPerformanceDate)) / (1000 * 60 * 60 * 24);
      if (daysSincePerformance > 14) {
        score += 3;
        factors.push('No recent performance data');
      }
    }
    
    return { score: Math.min(score, 25), factors };
  }
  
  determineRiskLevel(score) {
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }
  
  generateRecommendations(riskLevel, riskFactors) {
    const recommendations = [];
    
    switch (riskLevel) {
      case 'high':
        recommendations.push('Immediate rest period recommended (2-3 days)');
        recommendations.push('Reduce training intensity by 40-50%');
        recommendations.push('Schedule medical evaluation');
        recommendations.push('Implement active recovery protocols');
        break;
        
      case 'medium':
        recommendations.push('Monitor closely for next 7 days');
        recommendations.push('Reduce training intensity by 20-30%');
        recommendations.push('Focus on recovery and mobility work');
        recommendations.push('Consider lighter training sessions');
        break;
        
      case 'low':
        recommendations.push('Continue current training regimen');
        recommendations.push('Maintain regular monitoring');
        recommendations.push('Focus on injury prevention exercises');
        break;
    }
    
    // Specific recommendations based on risk factors
    if (riskFactors.some(f => f.includes('load spike'))) {
      recommendations.push('Implement gradual load progression');
    }
    
    if (riskFactors.some(f => f.includes('recent injury'))) {
      recommendations.push('Focus on injury site rehabilitation');
    }
    
    if (riskFactors.some(f => f.includes('performance decline'))) {
      recommendations.push('Review training methodology');
      recommendations.push('Consider sports psychology consultation');
    }
    
    if (riskFactors.some(f => f.includes('fatigue'))) {
      recommendations.push('Prioritize sleep and nutrition optimization');
    }
    
    return recommendations;
  }
  
  getRiskLevelColor(riskLevel) {
    switch (riskLevel) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  }
  
  getRiskLevelText(riskLevel) {
    switch (riskLevel) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      case 'low': return 'Low Risk';
      default: return 'Unknown';
    }
  }
}

export const riskAssessmentService = new RiskAssessmentService();