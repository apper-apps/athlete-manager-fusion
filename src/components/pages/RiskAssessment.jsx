import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { athleteService } from '@/services/api/athleteService';
import { riskAssessmentService } from '@/services/api/riskAssessmentService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RiskAssessment = () => {
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRiskAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [riskAssessments, searchTerm, riskFilter]);

  const loadRiskAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const assessments = await athleteService.getRiskAssessment();
      setRiskAssessments(assessments);
      toast.success('Risk assessments loaded successfully');
    } catch (err) {
      setError('Failed to load risk assessments');
      toast.error('Failed to load risk assessments');
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    let filtered = [...riskAssessments];

    if (searchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.riskLevel === riskFilter);
    }

    // Sort by risk score (highest first)
    filtered.sort((a, b) => b.riskScore - a.riskScore);

    setFilteredAssessments(filtered);
  };

  const handleRefreshAssessment = async (athleteId) => {
    try {
      const updatedAssessment = await athleteService.getRiskAssessment(athleteId);
      setRiskAssessments(prev => 
        prev.map(assessment => 
          assessment.athleteId === athleteId ? updatedAssessment : assessment
        )
      );
      toast.success('Risk assessment updated');
    } catch (err) {
      toast.error('Failed to update risk assessment');
    }
  };

  const handleViewAthlete = (athleteId) => {
    navigate(`/athletes/${athleteId}`);
  };

  const getRiskBadgeVariant = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'low': return 'CheckCircle';
      default: return 'HelpCircle';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-secondary-600';
    }
  };

  const getRiskStats = () => {
    const total = riskAssessments.length;
    const high = riskAssessments.filter(a => a.riskLevel === 'high').length;
    const medium = riskAssessments.filter(a => a.riskLevel === 'medium').length;
    const low = riskAssessments.filter(a => a.riskLevel === 'low').length;
    
    return { total, high, medium, low };
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadRiskAssessments} />;

  const stats = getRiskStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-900">
            Injury Risk Assessment
          </h1>
          <p className="text-secondary-600 mt-1">
            Monitor athlete injury risk based on training load, injury history, and performance data
          </p>
        </div>
        <Button onClick={loadRiskAssessments} variant="outline">
          <ApperIcon name="RefreshCw" size={16} />
          Refresh All
        </Button>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Total Athletes</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              </div>
              <ApperIcon name="Users" size={24} className="text-secondary-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
              </div>
              <ApperIcon name="AlertTriangle" size={24} className="text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
              <ApperIcon name="AlertCircle" size={24} className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{stats.low}</p>
              </div>
              <ApperIcon name="CheckCircle" size={24} className="text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search athletes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={riskFilter}
                onValueChange={setRiskFilter}
                options={[
                  { value: 'all', label: 'All Risk Levels' },
                  { value: 'high', label: 'High Risk Only' },
                  { value: 'medium', label: 'Medium Risk Only' },
                  { value: 'low', label: 'Low Risk Only' }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessments Grid */}
      {filteredAssessments.length === 0 ? (
        <Empty
          title="No risk assessments found"
          description="No athletes match your current filters."
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.athleteId} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-secondary-900">
                        {assessment.athleteName}
                      </h3>
                      <p className="text-sm text-secondary-600">{assessment.position}</p>
                    </div>
                    <Badge variant={getRiskBadgeVariant(assessment.riskLevel)}>
                      {riskAssessmentService.getRiskLevelText(assessment.riskLevel)}
                    </Badge>
                  </div>

                  {/* Risk Score */}
                  <div className="flex items-center gap-3">
                    <ApperIcon 
                      name={getRiskIcon(assessment.riskLevel)} 
                      size={20} 
                      className={getRiskColor(assessment.riskLevel)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Risk Score</span>
                        <span className="font-medium">{assessment.riskScore}/100</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            assessment.riskLevel === 'high' ? 'bg-red-500' :
                            assessment.riskLevel === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(assessment.riskScore, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-secondary-50 rounded">
                      <p className="text-xs text-secondary-600">Training</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {assessment.trainingRisk}
                      </p>
                    </div>
                    <div className="p-2 bg-secondary-50 rounded">
                      <p className="text-xs text-secondary-600">Injury</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {assessment.injuryRisk}
                      </p>
                    </div>
                    <div className="p-2 bg-secondary-50 rounded">
                      <p className="text-xs text-secondary-600">Performance</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {assessment.performanceRisk}
                      </p>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {assessment.riskFactors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-secondary-900 mb-2">Key Risk Factors:</p>
                      <div className="space-y-1">
                        {assessment.riskFactors.slice(0, 3).map((factor, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                              assessment.riskLevel === 'high' ? 'bg-red-500' :
                              assessment.riskLevel === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <p className="text-xs text-secondary-600">{factor}</p>
                          </div>
                        ))}
                        {assessment.riskFactors.length > 3 && (
                          <p className="text-xs text-secondary-500 ml-4">
                            +{assessment.riskFactors.length - 3} more factors
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowRecommendations(true);
                      }}
                    >
                      <ApperIcon name="FileText" size={14} />
                      Recommendations
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRefreshAssessment(assessment.athleteId)}
                    >
                      <ApperIcon name="RefreshCw" size={14} />
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleViewAthlete(assessment.athleteId)}
                    >
                      <ApperIcon name="Eye" size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendations && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">
                      Risk Management Recommendations
                    </h2>
                    <p className="text-secondary-600">
                      {selectedAssessment.athleteName} • {selectedAssessment.position}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRecommendations(false)}
                  >
                    <ApperIcon name="X" size={16} />
                  </Button>
                </div>

                {/* Risk Summary */}
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <ApperIcon 
                      name={getRiskIcon(selectedAssessment.riskLevel)} 
                      size={24} 
                      className={getRiskColor(selectedAssessment.riskLevel)}
                    />
                    <div>
                      <Badge variant={getRiskBadgeVariant(selectedAssessment.riskLevel)} size="lg">
                        {riskAssessmentService.getRiskLevelText(selectedAssessment.riskLevel)}
                      </Badge>
                      <p className="text-sm text-secondary-600 mt-1">
                        Risk Score: {selectedAssessment.riskScore}/100
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-3">
                    Recommended Actions
                  </h3>
                  <div className="space-y-2">
                    {selectedAssessment.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white border border-secondary-200 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          selectedAssessment.riskLevel === 'high' ? 'bg-red-500' :
                          selectedAssessment.riskLevel === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <p className="text-sm text-secondary-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factor Details */}
                {selectedAssessment.riskFactors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-3">
                      Identified Risk Factors
                    </h3>
                    <div className="space-y-2">
                      {selectedAssessment.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-red-50 border border-red-200 rounded">
                          <ApperIcon name="AlertCircle" size={16} className="text-red-500 mt-0.5" />
                          <p className="text-sm text-red-700">{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-secondary-200">
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={() => handleViewAthlete(selectedAssessment.athleteId)}
                  >
                    <ApperIcon name="User" size={16} />
                    View Athlete Profile
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowRecommendations(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;