import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { healthService } from "@/services/api/healthService";
import { athleteService } from "@/services/api/athleteService";

const Health = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [health, athleteList] = await Promise.all([
        healthService.getAll(),
        athleteService.getAll()
      ]);
      setHealthRecords(health);
      setAthletes(athleteList);
    } catch (err) {
      console.error("Failed to load health data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      "Healthy": "success",
      "Minor Injury": "warning",
      "Major Injury": "danger",
      "Recovering": "info",
      "Under Observation": "secondary"
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Healthy": "CheckCircle",
      "Minor Injury": "AlertTriangle",
      "Major Injury": "XCircle",
      "Recovering": "Clock",
      "Under Observation": "Eye"
    };
    return icons[status] || "Heart";
  };

  const healthStats = {
    healthy: healthRecords.filter(r => r.status === "Healthy").length,
    injured: healthRecords.filter(r => r.status.includes("Injury")).length,
    recovering: healthRecords.filter(r => r.status === "Recovering").length,
    total: healthRecords.length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-secondary-200 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Loading type="metrics" />
        </div>
        <Loading type="grid" count={6} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-900">Health</h1>
          <p className="text-secondary-600 mt-1">
            Monitor athlete health status and medical records
          </p>
        </div>
        <Button>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Health Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                  Healthy Athletes
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {healthStats.healthy}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <ApperIcon name="CheckCircle" className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                  Injured Athletes
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {healthStats.injured}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <ApperIcon name="AlertTriangle" className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                  Recovering
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {healthStats.recovering}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <ApperIcon name="Clock" className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  {healthStats.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary-100 text-secondary-600">
                <ApperIcon name="FileText" className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {healthRecords.length === 0 ? (
        <Empty
          title="No Health Records"
          message="Start tracking your team's health by adding the first health record"
          actionLabel="Add First Record"
          icon="Heart"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {healthRecords.map((record, index) => {
            const athlete = athletes.find(a => a.Id === record.athleteId);
            return (
              <motion.div
                key={record.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:scale-[1.02] transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={athlete?.photo || "/api/placeholder/48/48"}
                          alt={athlete?.name || "Unknown"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-secondary-200"
                        />
                        <div>
                          <h3 className="font-semibold text-secondary-900">
                            {athlete?.name || "Unknown Athlete"}
                          </h3>
                          <p className="text-sm text-secondary-600">
                            {athlete?.position}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <ApperIcon 
                          name={getStatusIcon(record.status)} 
                          className="h-4 w-4 text-secondary-500" 
                        />
                        <span className="text-sm text-secondary-600">
                          Last Updated: {new Date(record.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>

                      {record.condition && (
                        <div className="flex items-start space-x-2">
                          <ApperIcon name="FileText" className="h-4 w-4 text-secondary-500 mt-0.5" />
                          <span className="text-sm text-secondary-700">
                            {record.condition}
                          </span>
                        </div>
                      )}

                      {record.notes && (
                        <div className="bg-secondary-50 rounded-lg p-3">
                          <p className="text-sm text-secondary-700">
                            <strong>Notes:</strong> {record.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-secondary-500">
                          Record #{record.Id}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <ApperIcon name="Edit" className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ApperIcon name="Eye" className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Health Management Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="ghost" className="h-auto p-4 flex flex-col items-center space-y-2">
              <ApperIcon name="UserPlus" className="h-8 w-8 text-primary-600" />
              <span className="font-medium">Medical Checkup</span>
              <span className="text-xs text-secondary-500 text-center">
                Schedule routine health assessments
              </span>
            </Button>

            <Button variant="ghost" className="h-auto p-4 flex flex-col items-center space-y-2">
              <ApperIcon name="Activity" className="h-8 w-8 text-blue-600" />
              <span className="font-medium">Injury Report</span>
              <span className="text-xs text-secondary-500 text-center">
                Document and track injuries
              </span>
            </Button>

            <Button variant="ghost" className="h-auto p-4 flex flex-col items-center space-y-2">
              <ApperIcon name="TrendingUp" className="h-8 w-8 text-green-600" />
              <span className="font-medium">Recovery Plan</span>
              <span className="text-xs text-secondary-500 text-center">
                Create rehabilitation programs
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Health;