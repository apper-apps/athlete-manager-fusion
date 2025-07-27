import ApperIcon from "@/components/ApperIcon";

const Header = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Athlete Manager Pro
          </h1>
          {subtitle && (
            <p className="text-sm text-secondary-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <ApperIcon name="Users" className="h-4 w-4" />
            <span>Team Dashboard</span>
          </div>
          
          <div className="h-8 w-px bg-secondary-200"></div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
              <ApperIcon name="User" className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-secondary-900">Coach</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;