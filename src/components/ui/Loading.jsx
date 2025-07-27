import { Card, CardContent } from "@/components/atoms/Card";

const Loading = ({ type = "grid", count = 8 }) => {
  if (type === "chart") {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-secondary-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-64 bg-secondary-200 rounded"></div>
            <div className="flex space-x-2">
              <div className="h-3 bg-secondary-200 rounded flex-1"></div>
              <div className="h-3 bg-secondary-200 rounded flex-1"></div>
              <div className="h-3 bg-secondary-200 rounded flex-1"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "metrics") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-secondary-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-secondary-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/3"></div>
                </div>
                <div className="w-12 h-12 bg-secondary-200 rounded-xl"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-secondary-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Loading;