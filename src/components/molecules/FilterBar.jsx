import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  positionOptions = [],
  athleteOptions = [],
  showDateRange = false,
  showMetricType = false,
  metricTypes = [],
  className = ""
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <ApperIcon name="Filter" className="h-4 w-4 text-secondary-500" />
        <span className="text-sm font-medium text-secondary-700">Filter by:</span>
      </div>
      
      {positionOptions.length > 0 && (
        <Select
          value={filters.position || ""}
          onChange={(e) => onFilterChange("position", e.target.value)}
          className="w-40"
        >
          <option value="">All Positions</option>
          {positionOptions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </Select>
      )}

      {athleteOptions.length > 0 && (
        <Select
          value={filters.athlete || ""}
          onChange={(e) => onFilterChange("athlete", e.target.value)}
          className="w-48"
        >
          <option value="">All Athletes</option>
          {athleteOptions.map((athlete) => (
            <option key={athlete.Id} value={athlete.Id}>
              {athlete.name}
            </option>
          ))}
        </Select>
      )}
      
      <Select
        value={filters.ageRange || ""}
        onChange={(e) => onFilterChange("ageRange", e.target.value)}
        className="w-32"
      >
        <option value="">All Ages</option>
        <option value="16-20">16-20</option>
        <option value="21-25">21-25</option>
        <option value="26-30">26-30</option>
        <option value="31+">31+</option>
      </Select>

      {showDateRange && (
        <>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            placeholder="Start Date"
            className="w-40"
          />
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            placeholder="End Date"
            className="w-40"
          />
        </>
      )}

      {showMetricType && metricTypes.length > 0 && (
        <Select
          value={filters.metricType || ""}
          onChange={(e) => onFilterChange("metricType", e.target.value)}
          className="w-40"
        >
          {metricTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="text-secondary-600 hover:text-secondary-800"
      >
        <ApperIcon name="X" className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
  );
};

export default FilterBar;