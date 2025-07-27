import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  message = "Get started by adding your first item",
  actionLabel = "Add Item",
  onAction,
  icon = "Inbox",
  className = ""
}) => {
  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 flex items-center justify-center">
          <ApperIcon name={icon} className="h-8 w-8 text-primary-600" />
        </div>
        <CardTitle className="text-secondary-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-secondary-600">{message}</p>
        {onAction && (
          <Button 
            onClick={onAction}
            className="w-full"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Empty;