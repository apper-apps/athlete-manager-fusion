import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: "/athletes", label: "Athletes", icon: "Users" },
    { path: "/performance", label: "Performance", icon: "TrendingUp" },
    { path: "/training", label: "Training", icon: "Calendar" },
    { path: "/health", label: "Health", icon: "Heart" }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
            <ApperIcon name="Trophy" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-secondary-900">
              Manager Pro
            </h2>
            <p className="text-xs text-secondary-500">Soccer Team</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200"
                  : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
              }`
            }
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose?.();
              }
            }}
          >
            <ApperIcon name={item.icon} className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-secondary-200">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <ApperIcon name="Star" className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">Pro Tips</span>
          </div>
          <p className="text-xs text-primary-700">
            Track player performance weekly to identify improvement areas and optimize training sessions.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-secondary-200">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col w-64 bg-white shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5 text-secondary-600" />
            </button>
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;