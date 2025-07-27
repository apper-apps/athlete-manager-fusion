import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const AthleteModal = ({ isOpen, onClose, athlete, onSave, mode = "add" }) => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    age: "",
    contactEmail: "",
    contactPhone: "",
    jerseyNumber: "",
    photo: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const positionOptions = [
    { value: "Goalkeeper", label: "Goalkeeper" },
    { value: "Defender", label: "Defender" },
    { value: "Midfielder", label: "Midfielder" },
    { value: "Forward", label: "Forward" }
  ];

  useEffect(() => {
    if (athlete && mode === "edit") {
      setFormData({
        name: athlete.name || "",
        position: athlete.position || "",
        age: athlete.age?.toString() || "",
        contactEmail: athlete.contactEmail || "",
        contactPhone: athlete.contactPhone || "",
        jerseyNumber: athlete.jerseyNumber?.toString() || "",
        photo: athlete.photo || ""
      });
    } else {
      setFormData({
        name: "",
        position: "",
        age: "",
        contactEmail: "",
        contactPhone: "",
        jerseyNumber: "",
        photo: ""
      });
    }
    setErrors({});
  }, [athlete, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.position) {
      newErrors.position = "Position is required";
    }

    if (!formData.age || isNaN(formData.age) || parseInt(formData.age) < 16 || parseInt(formData.age) > 45) {
      newErrors.age = "Age must be between 16 and 45";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Email is invalid";
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Phone number is required";
    }

    if (!formData.jerseyNumber || isNaN(formData.jerseyNumber) || parseInt(formData.jerseyNumber) < 1 || parseInt(formData.jerseyNumber) > 99) {
      newErrors.jerseyNumber = "Jersey number must be between 1 and 99";
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
      const athleteData = {
        ...formData,
        age: parseInt(formData.age),
        jerseyNumber: parseInt(formData.jerseyNumber),
        joinDate: athlete?.joinDate || new Date().toISOString()
      };

      await onSave(athleteData);
      toast.success(`Athlete ${mode === "edit" ? "updated" : "added"} successfully!`);
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode === "edit" ? "update" : "add"} athlete`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-bold font-display text-secondary-900">
            {mode === "edit" ? "Edit Athlete" : "Add New Athlete"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
          <FormField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter athlete's full name"
            required
            error={errors.name}
          />

          <FormField
            label="Position"
            type="select"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            options={positionOptions}
            placeholder="Select position"
            required
            error={errors.position}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Age"
              required
              error={errors.age}
            />

            <FormField
              label="Jersey Number"
              type="number"
              name="jerseyNumber"
              value={formData.jerseyNumber}
              onChange={handleInputChange}
              placeholder="Number"
              required
              error={errors.jerseyNumber}
            />
          </div>

          <FormField
            label="Email Address"
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            placeholder="athlete@email.com"
            required
            error={errors.contactEmail}
          />

          <FormField
            label="Phone Number"
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
            required
            error={errors.contactPhone}
          />

          <FormField
            label="Photo URL"
            name="photo"
            value={formData.photo}
            onChange={handleInputChange}
            placeholder="https://example.com/photo.jpg (optional)"
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
                  {mode === "edit" ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <ApperIcon name={mode === "edit" ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                  {mode === "edit" ? "Update Athlete" : "Add Athlete"}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AthleteModal;