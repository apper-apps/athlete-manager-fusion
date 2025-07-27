import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { toast } from "react-toastify";
import { athleteService } from "@/services/api/athleteService";
import { trainingService } from "@/services/api/trainingService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Athletes from "@/components/pages/Athletes";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";

const Training = () => {
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: '',
    duration: '',
    location: '',
    assignmentType: 'team',
    assignedAthletes: [],
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTrainingSessions = async () => {
    try {
      setLoading(true);
      const data = await trainingService.getAll();
      setTrainingSessions(data);
    } catch (err) {
      console.error("Failed to load training sessions:", err);
      toast.error("Failed to load training sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadAthletes = async () => {
    try {
      const data = await athleteService.getAll();
      setAthletes(data);
    } catch (err) {
      console.error("Failed to load athletes:", err);
    }
  };

  useEffect(() => {
    loadTrainingSessions();
    loadAthletes();
  }, []);

const getSessionsForDate = (date) => {
    return trainingSessions.filter(session => {
      const sessionDate = new Date(session.date).toISOString().split("T")[0];
      return sessionDate === date;
    });
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      Technical: "primary",
      Physical: "success", 
      Tactical: "warning",
      Recovery: "secondary"
    };
    return colors[type] || "secondary";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        assignedAthletes: checked 
          ? [...prev.assignedAthletes, parseInt(value)]
          : prev.assignedAthletes.filter(id => id !== parseInt(value))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    if (!formData.type) errors.type = 'Training type is required';
    if (!formData.duration) errors.duration = 'Duration is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (formData.assignmentType === 'individual' && formData.assignedAthletes.length === 0) {
      errors.assignedAthletes = 'At least one athlete must be selected';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionData = {
        ...formData,
        duration: parseInt(formData.duration),
        date: new Date(formData.date).toISOString(),
        assignedAthletes: formData.assignmentType === 'team' ? [] : formData.assignedAthletes
      };
      
      await trainingService.create(sessionData);
      toast.success("Training session scheduled successfully!");
      
      // Reset form and close modal
      setFormData({
        title: '',
        date: '',
        time: '',
        type: '',
        duration: '',
        location: '',
        assignmentType: 'team',
        assignedAthletes: [],
        notes: ''
      });
      setShowCreateModal(false);
      
      // Reload sessions
      loadTrainingSessions();
    } catch (err) {
      console.error("Failed to create session:", err);
      toast.error("Failed to schedule training session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this training session?")) {
      return;
    }

    try {
      await trainingService.delete(sessionId);
      toast.success("Training session deleted successfully!");
      loadTrainingSessions();
    } catch (err) {
      console.error("Failed to delete session:", err);
      toast.error("Failed to delete training session");
    }
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startDate = startOfWeek(firstDayOfMonth);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = addDays(startDate, i);
      const dateStr = date.toISOString().split("T")[0];
      const sessions = getSessionsForDate(dateStr);
      const isCurrentMonth = date.getMonth() === today.getMonth();
      const isToday = isSameDay(date, today);
      const isSelected = dateStr === selectedDate;
      
      days.push({
        date,
        dateStr,
        sessions,
        isCurrentMonth,
        isToday,
        isSelected
      });
    }
    
    return days;
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
        <Button onClick={() => setShowCreateModal(true)}>
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
                    {generateCalendarDays().map((day, i) => (
                      <div
                        key={i}
                        className={`relative p-2 cursor-pointer rounded transition-colors ${
                          day.isSelected
                            ? "bg-primary-100 text-primary-900"
                            : day.isToday
                            ? "bg-secondary-100 text-secondary-900"
                            : "hover:bg-secondary-50"
                        }`}
                        onClick={() => setSelectedDate(day.dateStr)}
                      >
                        <span className={`text-sm ${!day.isCurrentMonth ? "text-secondary-400" : ""}`}>
                          {day.date.getDate()}
                        </span>
                        {day.sessions.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
                        )}
                      </div>
                    ))}
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
                                <p className="text-sm text-secondary-600">
                                  {session.time} • {session.duration} min • {session.location}
                                </p>
                                {session.assignmentType === 'individual' && session.assignedAthletes?.length > 0 && (
                                  <p className="text-xs text-secondary-500 mt-1">
                                    Individual training ({session.assignedAthletes.length} athletes)
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getSessionTypeColor(session.type)}>
                                {session.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSession(session.Id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <ApperIcon name="Trash2" className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Session Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display text-secondary-900">Schedule Training Session</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <ApperIcon name="X" className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Session Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Technical Skills Training"
                      required
                      error={formErrors.title}
                    />

                    <FormField
                      label="Training Type"
                      type="select"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Technical', label: 'Technical' },
                        { value: 'Physical', label: 'Physical' },
                        { value: 'Tactical', label: 'Tactical' },
                        { value: 'Recovery', label: 'Recovery' }
                      ]}
                      required
                      error={formErrors.type}
                    />

                    <FormField
                      label="Date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      error={formErrors.date}
                    />

                    <FormField
                      label="Time"
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      error={formErrors.time}
                    />

                    <FormField
                      label="Duration (minutes)"
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="90"
                      required
                      error={formErrors.duration}
                    />

                    <FormField
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Field"
                      required
                      error={formErrors.location}
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Assignment Type *
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="assignmentType"
                            value="team"
                            checked={formData.assignmentType === 'team'}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          Team Training
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="assignmentType"
                            value="individual"
                            checked={formData.assignmentType === 'individual'}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          Individual Training
                        </label>
                      </div>
                    </div>

                    {formData.assignmentType === 'individual' && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Select Athletes *
                        </label>
                        <div className="max-h-32 overflow-y-auto border border-secondary-300 rounded p-2 space-y-1">
                          {athletes.map(athlete => (
                            <label key={athlete.Id} className="flex items-center">
                              <input
                                type="checkbox"
                                value={athlete.Id}
                                checked={formData.assignedAthletes.includes(athlete.Id)}
                                onChange={handleInputChange}
                                className="mr-2"
                              />
                              <span className="text-sm">{athlete.name} - {athlete.position}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors.assignedAthletes && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.assignedAthletes}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <FormField
                    label="Notes"
                    type="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes or instructions..."
                    className="col-span-2"
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Scheduling..." : "Schedule Session"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
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