import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const HealthModal = ({ isOpen, onClose, healthRecord, onSave, mode = "add", athleteId = null }) => {
  const [formData, setFormData] = useState({
    athleteId: "",
    status: "",
    condition: "",
    notes: "",
    injuryType: "",
    severity: "",
    bodyPart: "",
    treatmentPlan: "",
    recoveryTimeline: "",
    nextCheckup: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "Healthy", label: "Healthy" },
    { value: "Minor Injury", label: "Minor Injury" },
    { value: "Major Injury", label: "Major Injury" },
    { value: "Recovering", label: "Recovering" },
    { value: "Under Observation", label: "Under Observation" }
  ];

  const injuryTypeOptions = [
    { value: "Acute", label: "Acute Injury" },
    { value: "Chronic", label: "Chronic Condition" },
    { value: "Overuse", label: "Overuse Injury" },
    { value: "Contact", label: "Contact Injury" },
    { value: "Non-Contact", label: "Non-Contact Injury" }
  ];

  const severityOptions = [
    { value: "Minor", label: "Minor (1-2 days)" },
    { value: "Moderate", label: "Moderate (3-7 days)" },
    { value: "Severe", label: "Severe (1-4 weeks)" },
    { value: "Critical", label: "Critical (1+ months)" }
  ];

  const bodyPartOptions = [
    { value: "Head", label: "Head" },
    { value: "Neck", label: "Neck" },
    { value: "Shoulder", label: "Shoulder" },
    { value: "Arm", label: "Arm" },
    { value: "Elbow", label: "Elbow" },
    { value: "Wrist", label: "Wrist" },
    { value: "Hand", label: "Hand" },
    { value: "Chest", label: "Chest" },
    { value: "Back", label: "Back" },
    { value: "Abdomen", label: "Abdomen" },
    { value: "Hip", label: "Hip" },
    { value: "Thigh", label: "Thigh" },
    { value: "Knee", label: "Knee" },
    { value: "Calf", label: "Calf" },
    { value: "Ankle", label: "Ankle" },
    { value: "Foot", label: "Foot" }
  ];

  useEffect(() => {
    if (healthRecord && mode === "edit") {
      setFormData({
        athleteId: healthRecord.athleteId?.toString() || "",
        status: healthRecord.status || "",
        condition: healthRecord.condition || "",
        notes: healthRecord.notes || "",
        injuryType: healthRecord.injuryType || "",
        severity: healthRecord.severity || "",
        bodyPart: healthRecord.bodyPart || "",
        treatmentPlan: healthRecord.treatmentPlan || "",
        recoveryTimeline: healthRecord.recoveryTimeline || "",
        nextCheckup: healthRecord.nextCheckup ? new Date(healthRecord.nextCheckup).toISOString().split('T')[0] : ""
      });
    } else {
      setFormData({
        athleteId: athleteId?.toString() || "",
        status: "",
        condition: "",
        notes: "",
        injuryType: "",
        severity: "",
        bodyPart: "",
        treatmentPlan: "",
        recoveryTimeline: "",
        nextCheckup: ""
      });
    }
    setErrors({});
  }, [healthRecord, mode, isOpen, athleteId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

const validateForm = () => {
    const newErrors = {};

    if (!formData.athleteId) {
      newErrors.athleteId = "Athlete selection is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.condition.trim()) {
      newErrors.condition = "Condition description is required";
    }

    // If injury status, require injury-specific fields
    const isInjuryStatus = formData.status.includes("Injury") || formData.status === "Recovering";
    if (isInjuryStatus) {
      if (!formData.injuryType) {
        newErrors.injuryType = "Injury type is required for injury status";
      }
      if (!formData.severity) {
        newErrors.severity = "Severity is required for injury status";
      }
      if (!formData.bodyPart) {
        newErrors.bodyPart = "Body part is required for injury status";
      }
      if (!formData.treatmentPlan.trim()) {
        newErrors.treatmentPlan = "Treatment plan is required for injuries";
      }
      if (!formData.recoveryTimeline.trim()) {
        newErrors.recoveryTimeline = "Recovery timeline is required for injuries";
      }
    }

    // Validate next checkup date if provided
    if (formData.nextCheckup) {
      const checkupDate = new Date(formData.nextCheckup);
      const today = new Date();
      if (checkupDate <= today) {
        newErrors.nextCheckup = "Next checkup must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const healthData = {
        ...formData,
        athleteId: parseInt(formData.athleteId),
        nextCheckup: formData.nextCheckup ? new Date(formData.nextCheckup).toISOString() : null,
        lastUpdated: new Date().toISOString()
      };

      await onSave(healthData);
      toast.success(`Health record ${mode === "edit" ? "updated" : "created"} successfully!`);
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode === "edit" ? "update" : "create"} health record`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isInjuryStatus = formData.status.includes("Injury") || formData.status === "Recovering";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-bold font-display text-secondary-900">
            {mode === "edit" ? "Edit Health Record" : "Add Health Record"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ApperIcon name="X" className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Athlete ID"
              type="number"
              name="athleteId"
              value={formData.athleteId}
              onChange={handleInputChange}
              placeholder="Enter athlete ID"
              required
              error={errors.athleteId}
            />

            <FormField
              label="Health Status"
              type="select"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={statusOptions}
              placeholder="Select status"
              required
              error={errors.status}
            />
          </div>

          <FormField
            label="Condition Description"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            placeholder="Describe the health condition or injury"
            required
            error={errors.condition}
          />

          {isInjuryStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <ApperIcon name="AlertTriangle" className="h-5 w-5 mr-2 text-orange-500" />
                  Injury Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Injury Type"
                    type="select"
                    name="injuryType"
                    value={formData.injuryType}
                    onChange={handleInputChange}
                    options={injuryTypeOptions}
                    placeholder="Select injury type"
                    required={isInjuryStatus}
                    error={errors.injuryType}
                  />

                  <FormField
                    label="Severity Level"
                    type="select"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    options={severityOptions}
                    placeholder="Select severity"
                    required={isInjuryStatus}
                    error={errors.severity}
                  />
                </div>

                <FormField
                  label="Affected Body Part"
                  type="select"
                  name="bodyPart"
                  value={formData.bodyPart}
                  onChange={handleInputChange}
                  options={bodyPartOptions}
                  placeholder="Select body part"
                  required={isInjuryStatus}
                  error={errors.bodyPart}
                />

                <FormField
                  label="Treatment Plan"
                  name="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={handleInputChange}
                  placeholder="Describe the treatment plan and procedures"
                />

                <FormField
                  label="Expected Recovery Timeline"
                  name="recoveryTimeline"
                  value={formData.recoveryTimeline}
                  onChange={handleInputChange}
                  placeholder="e.g., 2-3 weeks with physiotherapy"
                />
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Next Checkup Date"
              type="date"
              name="nextCheckup"
              value={formData.nextCheckup}
              onChange={handleInputChange}
            />
            <div></div>
          </div>

          <FormField
            label="Additional Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional observations or notes"
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <ApperIcon name={mode === "edit" ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                  {mode === "edit" ? "Update Record" : "Create Record"}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HealthModal;