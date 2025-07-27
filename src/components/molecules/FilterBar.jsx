import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  positionOptions = [],
  className = ""
}) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <ApperIcon name="Filter" className="h-4 w-4 text-secondary-500" />
        <span className="text-sm font-medium text-secondary-700">Filter by:</span>
      </div>
      
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