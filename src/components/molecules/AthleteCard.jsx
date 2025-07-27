import { Card, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useState, useEffect } from "react";
import { athleteService } from "@/services/api/athleteService";

const AthleteCard = ({ athlete, onView, onEdit, onDelete, showRiskIndicator = false }) => {
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  useEffect(() => {
    if (showRiskIndicator) {
      loadRiskAssessment();
    }
  }, [showRiskIndicator, athlete.Id]);

  const loadRiskAssessment = async () => {
    setLoadingRisk(true);
    try {
      const assessment = await athleteService.getRiskAssessment(athlete.Id);
      setRiskAssessment(assessment);
    } catch (error) {
      console.error('Error loading risk assessment:', error);
    } finally {
      setLoadingRisk(false);
    }
  };

  const getRiskBadgeVariant = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };
  const positionColors = {
    Goalkeeper: "secondary",
    Defender: "success",
    Midfielder: "warning",
    Forward: "danger"
  };

  return (
    <Card className="hover:scale-[1.02] transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={athlete.photo || "/api/placeholder/80/80"}
              alt={athlete.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-secondary-200"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {athlete.jerseyNumber}
</div>
            {showRiskIndicator && (
              <div className="flex items-center gap-2">
                {loadingRisk ? (
                  <div className="w-4 h-4 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
                ) : riskAssessment ? (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      riskAssessment.riskLevel === 'high' ? 'bg-red-500' :
                      riskAssessment.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <Badge variant={getRiskBadgeVariant(riskAssessment.riskLevel)} size="sm">
                      {riskAssessment.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 truncate">
                  {athlete.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={positionColors[athlete.position] || "default"}>
                    {athlete.position}
                  </Badge>
                  <span className="text-sm text-secondary-500">Age {athlete.age}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(athlete)}
                  className="h-8 w-8"
                >
                  <ApperIcon name="Eye" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(athlete)}
                  className="h-8 w-8"
                >
                  <ApperIcon name="Pencil" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(athlete)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center space-x-4 text-sm text-secondary-600">
              <div className="flex items-center">
                <ApperIcon name="Mail" className="h-4 w-4 mr-1" />
                <span className="truncate">{athlete.contactEmail}</span>
              </div>
              <div className="flex items-center">
                <ApperIcon name="Phone" className="h-4 w-4 mr-1" />
                <span>{athlete.contactPhone}</span>
              </div>
</div>
            {showRiskIndicator && riskAssessment && (
              <div className="mt-3 p-2 bg-secondary-50 rounded-lg">
                <div className="text-xs text-secondary-600 mb-1">Risk Score: {riskAssessment.riskScore}/100</div>
                <div className="text-xs text-secondary-500">
                  {riskAssessment.riskFactors.length > 0 ? 
                    riskAssessment.riskFactors.slice(0, 2).join(', ') + 
                    (riskAssessment.riskFactors.length > 2 ? '...' : '') :
                    'No significant risk factors'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AthleteCard;