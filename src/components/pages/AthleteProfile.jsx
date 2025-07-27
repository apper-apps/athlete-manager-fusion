import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { athleteService } from "@/services/api/athleteService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});

  const positionColors = {
    Goalkeeper: "secondary",
    Defender: "success", 
    Midfielder: "warning",
    Forward: "danger"
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "User" },
    { id: "physical", label: "Physical Stats", icon: "Activity" },
    { id: "medical", label: "Medical History", icon: "Heart" },
    { id: "performance", label: "Performance History", icon: "TrendingUp" }
  ];

  useEffect(() => {
    loadAthlete();
  }, [id]);

  const loadAthlete = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await athleteService.getById(id);
      setAthlete(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load athlete profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setIsEditing(true);
    
    switch (section) {
      case "basic":
        setFormData({
          name: athlete.name,
          position: athlete.position,
          age: athlete.age.toString(),
          contactEmail: athlete.contactEmail,
          contactPhone: athlete.contactPhone,
          jerseyNumber: athlete.jerseyNumber.toString(),
          photo: athlete.photo || ""
        });
        break;
      case "physical":
        setFormData({
          height: athlete.physicalStats?.height || "",
          weight: athlete.physicalStats?.weight || "", 
          bodyFatPercentage: athlete.physicalStats?.bodyFatPercentage || ""
        });
        break;
      default:
        setFormData({});
    }
  };

  const handleSave = async () => {
    try {
      let updatedAthlete;
      
      switch (editingSection) {
        case "basic":
          const basicData = {
            ...formData,
            age: parseInt(formData.age),
            jerseyNumber: parseInt(formData.jerseyNumber)
          };
          updatedAthlete = await athleteService.update(id, basicData);
          break;
        case "physical":
          updatedAthlete = await athleteService.updatePhysicalStats(id, formData);
          break;
        default:
          return;
      }
      
      setAthlete(updatedAthlete);
      setIsEditing(false);
      setEditingSection(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingSection(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addMedicalRecord = () => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: "",
      description: "",
      status: "",
      doctor: ""
    };
    
    const updatedHistory = [...(athlete.medicalHistory || []), newRecord];
    athleteService.updateMedicalHistory(id, updatedHistory)
      .then(updatedAthlete => {
        setAthlete(updatedAthlete);
        toast.success("Medical record added");
      })
      .catch(() => toast.error("Failed to add medical record"));
  };

  const addPerformanceRecord = () => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      match: "",
      goals: 0,
      assists: 0,
      minutesPlayed: 0,
      rating: 0
    };
    
    const updatedHistory = [...(athlete.performanceHistory || []), newRecord];
    athleteService.updatePerformanceHistory(id, updatedHistory)
      .then(updatedAthlete => {
        setAthlete(updatedAthlete);
        toast.success("Performance record added");
      })
      .catch(() => toast.error("Failed to add performance record"));
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAthlete} />;
  if (!athlete) return <Error message="Athlete not found" />;

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/athletes")}
              className="h-10 w-10"
            >
              <ApperIcon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900">
                {athlete.name}
              </h1>
              <p className="text-secondary-600">Athlete Profile</p>
            </div>
          </div>

          {/* Profile Header Card */}  
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <img
                    src={athlete.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(athlete.name)}&size=120&background=22c55e&color=ffffff`}
                    alt={athlete.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <Badge
                    variant={positionColors[athlete.position]}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  >
                    #{athlete.jerseyNumber}
                  </Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-secondary-900">{athlete.name}</h2>
                    <Badge variant={positionColors[athlete.position]}>
                      {athlete.position}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-600">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Calendar" className="h-4 w-4" />
                      Age: {athlete.age}
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Mail" className="h-4 w-4" />
                      {athlete.contactEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Phone" className="h-4 w-4" />
                      {athlete.contactPhone}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                }`}
              >
                <ApperIcon name={tab.icon} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit("basic")}
                  disabled={isEditing}
                >
                  <ApperIcon name="Edit2" className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && editingSection === "basic" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <FormField
                        label="Position"
                        type="select"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        options={[
                          { value: "Goalkeeper", label: "Goalkeeper" },
                          { value: "Defender", label: "Defender" },
                          { value: "Midfielder", label: "Midfielder" },
                          { value: "Forward", label: "Forward" }
                        ]}
                        required
                      />
                      <FormField
                        label="Age"
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                      />
                      <FormField
                        label="Jersey Number"
                        type="number"
                        name="jerseyNumber"
                        value={formData.jerseyNumber}
                        onChange={handleInputChange}
                        required
                      />
                      <FormField
                        label="Email"
                        type="email" 
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                      <FormField
                        label="Phone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <FormField
                      label="Photo URL"
                      name="photo"
                      value={formData.photo}
                      onChange={handleInputChange}
                      placeholder="https://example.com/photo.jpg (optional)"
                    />
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave}>
                        <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="secondary" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">Personal Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Full Name:</span>
                          <span className="font-medium">{athlete.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Position:</span>
                          <Badge variant={positionColors[athlete.position]}>{athlete.position}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Age:</span>
                          <span className="font-medium">{athlete.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Jersey Number:</span>
                          <span className="font-medium">#{athlete.jerseyNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Email:</span>
                          <span className="font-medium">{athlete.contactEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Phone:</span>
                          <span className="font-medium">{athlete.contactPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Join Date:</span>
                          <span className="font-medium">
                            {format(new Date(athlete.joinDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Physical Stats Tab */}
          {activeTab === "physical" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Physical Statistics</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit("physical")}
                  disabled={isEditing}
                >
                  <ApperIcon name="Edit2" className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {isEditing && editingSection === "physical" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        label="Height"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="e.g., 185 cm"
                      />
                      <FormField
                        label="Weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="e.g., 78 kg"
                      />
                      <FormField
                        label="Body Fat %"
                        name="bodyFatPercentage"
                        value={formData.bodyFatPercentage}
                        onChange={handleInputChange}
                        placeholder="e.g., 12%"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave}>
                        <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="secondary" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-secondary-50 rounded-lg">
                      <ApperIcon name="Ruler" className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-secondary-900">
                        {athlete.physicalStats?.height || "N/A"}
                      </div>
                      <div className="text-sm text-secondary-600">Height</div>
                    </div>
                    <div className="text-center p-6 bg-secondary-50 rounded-lg">
                      <ApperIcon name="Weight" className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-secondary-900">
                        {athlete.physicalStats?.weight || "N/A"}
                      </div>
                      <div className="text-sm text-secondary-600">Weight</div>
                    </div>
                    <div className="text-center p-6 bg-secondary-50 rounded-lg">
                      <ApperIcon name="Zap" className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-secondary-900">
                        {athlete.physicalStats?.bodyFatPercentage || "N/A"}
                      </div>
                      <div className="text-sm text-secondary-600">Body Fat</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medical History Tab */}
          {activeTab === "medical" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Medical History</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addMedicalRecord}
                >
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </CardHeader>
              <CardContent>
                {athlete.medicalHistory && athlete.medicalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {athlete.medicalHistory.map((record) => (
                      <div key={record.id} className="p-4 border border-secondary-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={record.status === "Recovered" ? "success" : 
                                       record.status === "Recovering" ? "warning" : "secondary"}
                            >
                              {record.status}
                            </Badge>
                            <span className="text-sm text-secondary-600">
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <Badge variant="secondary">{record.type}</Badge>
                        </div>
                        <p className="text-secondary-900 mb-1">{record.description}</p>
                        {record.doctor && (
                          <p className="text-sm text-secondary-600">Doctor: {record.doctor}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-secondary-600">
                    <ApperIcon name="Heart" className="h-12 w-12 mx-auto mb-4 text-secondary-400" />
                    <p>No medical records available</p>
                    <p className="text-sm">Click "Add Record" to create the first entry</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Performance History Tab */}
          {activeTab === "performance" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Performance History</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addPerformanceRecord}
                >
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </CardHeader>
              <CardContent>
                {athlete.performanceHistory && athlete.performanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {athlete.performanceHistory.map((record) => (
                      <div key={record.id} className="p-4 border border-secondary-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-secondary-900">{record.match}</h4>
                            <p className="text-sm text-secondary-600">
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <Badge variant="secondary">Rating: {record.rating}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-secondary-900">{record.goals}</div>
                            <div className="text-secondary-600">Goals</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-secondary-900">{record.assists}</div>
                            <div className="text-secondary-600">Assists</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-secondary-900">{record.minutesPlayed}</div>
                            <div className="text-secondary-600">Minutes</div>
                          </div>
                          {record.saves && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-secondary-900">{record.saves}</div>
                              <div className="text-secondary-600">Saves</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-secondary-600">
                    <ApperIcon name="TrendingUp" className="h-12 w-12 mx-auto mb-4 text-secondary-400" />
                    <p>No performance records available</p>
                    <p className="text-sm">Click "Add Record" to create the first entry</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AthleteProfile;