import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import FilterBar from "@/components/molecules/FilterBar";
import AthleteCard from "@/components/molecules/AthleteCard";
import AthleteModal from "@/components/organisms/AthleteModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { athleteService } from "@/services/api/athleteService";
import { toast } from "react-toastify";

const Athletes = () => {
  const [athletes, setAthletes] = useState([]);
  const [filteredAthletes, setFilteredAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    athlete: null
  });

  const loadAthletes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await athleteService.getAll();
      setAthletes(data);
      setFilteredAthletes(data);
    } catch (err) {
      setError("Failed to load athletes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAthletes();
  }, []);

  useEffect(() => {
    let filtered = [...athletes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(athlete =>
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply position filter
    if (filters.position) {
      filtered = filtered.filter(athlete => athlete.position === filters.position);
    }

    // Apply age range filter
    if (filters.ageRange) {
      const [min, max] = filters.ageRange.includes("+") 
        ? [parseInt(filters.ageRange), 100]
        : filters.ageRange.split("-").map(Number);
      filtered = filtered.filter(athlete => athlete.age >= min && athlete.age <= max);
    }

    setFilteredAthletes(filtered);
  }, [athletes, searchTerm, filters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handleAddAthlete = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      athlete: null
    });
  };

  const handleEditAthlete = (athlete) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      athlete
    });
  };

  const handleViewAthlete = (athlete) => {
    toast.info(`Viewing ${athlete.name}'s profile`);
  };

  const handleDeleteAthlete = async (athlete) => {
    if (window.confirm(`Are you sure you want to remove ${athlete.name} from the team?`)) {
      try {
        await athleteService.delete(athlete.Id);
        setAthletes(prev => prev.filter(a => a.Id !== athlete.Id));
        toast.success(`${athlete.name} has been removed from the team`);
      } catch (err) {
        toast.error("Failed to remove athlete");
      }
    }
  };

  const handleSaveAthlete = async (athleteData) => {
    try {
      if (modalState.mode === "add") {
        const newAthlete = await athleteService.create(athleteData);
        setAthletes(prev => [...prev, newAthlete]);
      } else {
        const updatedAthlete = await athleteService.update(modalState.athlete.Id, athleteData);
        setAthletes(prev => prev.map(a => a.Id === modalState.athlete.Id ? updatedAthlete : a));
      }
    } catch (err) {
      throw new Error(`Failed to ${modalState.mode} athlete`);
    }
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      athlete: null
    });
  };

  const positionOptions = [...new Set(athletes.map(a => a.position))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-secondary-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-secondary-200 rounded w-24 animate-pulse"></div>
        </div>
        <Loading type="grid" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <Error 
        title="Failed to Load Athletes"
        message={error}
        onRetry={loadAthletes}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-900">Athletes</h1>
          <p className="text-secondary-600 mt-1">
            Manage your team roster and athlete profiles
          </p>
        </div>
        <Button onClick={handleAddAthlete}>
          <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
          Add Athlete
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-secondary-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <SearchBar
            placeholder="Search athletes by name, position, or email..."
            onSearch={handleSearch}
            className="lg:w-96"
          />
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            positionOptions={positionOptions}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <span>
            Showing {filteredAthletes.length} of {athletes.length} athletes
          </span>
          {(searchTerm || Object.keys(filters).length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      {filteredAthletes.length === 0 ? (
        <Empty
          title={athletes.length === 0 ? "No Athletes Added" : "No Athletes Found"}
          message={
            athletes.length === 0
              ? "Start building your team by adding your first athlete"
              : "Try adjusting your search or filter criteria"
          }
          actionLabel="Add First Athlete"
          onAction={athletes.length === 0 ? handleAddAthlete : null}
          icon="Users"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredAthletes.map((athlete, index) => (
            <motion.div
              key={athlete.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AthleteCard
                athlete={athlete}
                onView={handleViewAthlete}
                onEdit={handleEditAthlete}
                onDelete={handleDeleteAthlete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AthleteModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        athlete={modalState.athlete}
        onSave={handleSaveAthlete}
        mode={modalState.mode}
      />
    </div>
  );
};

export default Athletes;