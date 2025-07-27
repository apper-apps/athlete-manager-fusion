import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry, 
  title = "Error",
  className = ""
}) => {
  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <ApperIcon name="AlertCircle" className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-red-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-secondary-600">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="w-full"
          >
            <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Error;