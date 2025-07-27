import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { trainingService } from "@/services/api/trainingService";
import { format } from "date-fns";

const Training = () => {
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const loadTrainingSessions = async () => {
    try {
      setLoading(true);
      const data = await trainingService.getAll();
      setTrainingSessions(data);
    } catch (err) {
      console.error("Failed to load training sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainingSessions();
  }, []);

  const getSessionsForDate = (date) => {
    return trainingSessions.filter(session => 
      session.date.split("T")[0] === date
    );
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      "Technical": "primary",
      "Physical": "success",
      "Tactical": "warning",
      "Recovery": "secondary"
    };
    return colors[type] || "default";
  };

  const upcomingSessions = trainingSessions
    .filter(session => new Date(session.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-secondary-200 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Loading type="chart" />
          </div>
          <div>
            <Loading type="grid" count={3} />
          </div>
        </div>
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
          <h1 className="text-2xl font-bold font-display text-secondary-900">Training</h1>
          <p className="text-secondary-600 mt-1">
            Schedule and manage team training sessions
          </p>
        </div>
        <Button>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Training Calendar</CardTitle>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </CardHeader>
            <CardContent>
              {trainingSessions.length === 0 ? (
                <Empty
                  title="No Training Sessions"
                  message="Start planning your team's training by scheduling your first session"
                  actionLabel="Schedule First Session"
                  icon="Calendar"
                />
              ) : (
                <div className="space-y-6">
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="font-medium text-secondary-600 p-2">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - date.getDay() + i);
                      const dateStr = date.toISOString().split("T")[0];
                      const sessions = getSessionsForDate(dateStr);
                      const isToday = dateStr === new Date().toISOString().split("T")[0];
                      const isSelected = dateStr === selectedDate;

                      return (
                        <div
                          key={i}
                          className={`relative p-2 cursor-pointer rounded transition-colors ${
                            isSelected
                              ? "bg-primary-100 text-primary-900"
                              : isToday
                              ? "bg-secondary-100 text-secondary-900"
                              : "hover:bg-secondary-50"
                          }`}
                          onClick={() => setSelectedDate(dateStr)}
                        >
                          <span className={`text-sm ${date.getMonth() !== new Date().getMonth() ? "text-secondary-400" : ""}`}>
                            {date.getDate()}
                          </span>
                          {sessions.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Date Sessions */}
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-3">
                      Sessions for {format(new Date(selectedDate), "MMMM d, yyyy")}
                    </h3>
                    {getSessionsForDate(selectedDate).length === 0 ? (
                      <p className="text-secondary-500 text-sm">No training sessions scheduled for this date.</p>
                    ) : (
                      <div className="space-y-2">
                        {getSessionsForDate(selectedDate).map(session => (
                          <div key={session.Id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <ApperIcon name="Clock" className="h-4 w-4 text-secondary-500" />
                              <div>
                                <p className="font-medium text-secondary-900">{session.title}</p>
                                <p className="text-sm text-secondary-600">{session.time}</p>
                              </div>
                            </div>
                            <Badge variant={getSessionTypeColor(session.type)}>
                              {session.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <p className="text-secondary-500 text-sm">No upcoming sessions scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map(session => (
                    <div key={session.Id} className="flex items-start space-x-3 p-3 border border-secondary-200 rounded-lg">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">{session.title}</p>
                        <p className="text-sm text-secondary-600">
                          {format(new Date(session.date), "MMM d")} at {session.time}
                        </p>
                        <Badge variant={getSessionTypeColor(session.type)} className="mt-1">
                          {session.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Sessions This Week</span>
                <span className="font-semibold text-secondary-900">
                  {trainingSessions.filter(session => {
                    const sessionDate = new Date(session.date);
                    const now = new Date();
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return sessionDate >= weekStart;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Total Sessions</span>
                <span className="font-semibold text-secondary-900">{trainingSessions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Most Common Type</span>
                <span className="font-semibold text-secondary-900">Technical</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Avg Duration</span>
                <span className="font-semibold text-secondary-900">90 min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                Schedule Training
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <ApperIcon name="Users" className="h-4 w-4 mr-2" />
                View Attendance
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <ApperIcon name="FileText" className="h-4 w-4 mr-2" />
                Training Plans
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <ApperIcon name="BarChart3" className="h-4 w-4 mr-2" />
                Progress Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Training;