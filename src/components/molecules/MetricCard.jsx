import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = "primary",
  className = "",
  prediction = null
}) => {
  const colorClasses = {
    primary: "text-primary-600 bg-primary-50",
    success: "text-green-600 bg-green-50",
    warning: "text-yellow-600 bg-yellow-50",
    danger: "text-red-600 bg-red-50",
    info: "text-blue-600 bg-blue-50"
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-secondary-500"
  };

  return (
    <Card className={`hover:scale-[1.02] transition-transform duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-secondary-900 mt-2">
              {value}
            </p>
{trend && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <ApperIcon 
                    name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"} 
                    className={`h-4 w-4 mr-1 ${trendColors[trend]}`}
                  />
                  <span className={`text-sm font-medium ${trendColors[trend]}`}>
                    {trendValue}
                  </span>
                  <span className="text-sm text-secondary-500 ml-1">vs last period</span>
                </div>
                {prediction && (
                  <div className="flex items-center text-xs text-secondary-600">
                    <ApperIcon name="Zap" className="h-3 w-3 mr-1" />
                    <span>Predicted: <strong>{prediction}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <ApperIcon name={icon} className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;