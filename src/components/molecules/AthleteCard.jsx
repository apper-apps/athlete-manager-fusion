import { Card, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const AthleteCard = ({ athlete, onView, onEdit, onDelete }) => {
  const positionColors = {
    Goalkeeper: "secondary",
    Defender: "success",
    Midfielder: "warning",
    Forward: "danger"
  };

  return (
    <Card className="hover:scale-[1.02] transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={athlete.photo || "/api/placeholder/80/80"}
              alt={athlete.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-secondary-200"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {athlete.jerseyNumber}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 truncate">
                  {athlete.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={positionColors[athlete.position] || "default"}>
                    {athlete.position}
                  </Badge>
                  <span className="text-sm text-secondary-500">Age {athlete.age}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(athlete)}
                  className="h-8 w-8"
                >
                  <ApperIcon name="Eye" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(athlete)}
                  className="h-8 w-8"
                >
                  <ApperIcon name="Pencil" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(athlete)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center space-x-4 text-sm text-secondary-600">
              <div className="flex items-center">
                <ApperIcon name="Mail" className="h-4 w-4 mr-1" />
                <span className="truncate">{athlete.contactEmail}</span>
              </div>
              <div className="flex items-center">
                <ApperIcon name="Phone" className="h-4 w-4 mr-1" />
                <span>{athlete.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AthleteCard;