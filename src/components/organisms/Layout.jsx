import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <div className="flex items-center justify-between bg-white border-b border-secondary-200 px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <ApperIcon name="Menu" className="h-6 w-6" />
          </Button>
          
          <h1 className="text-lg font-bold font-display bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Athlete Manager Pro
          </h1>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
            <ApperIcon name="User" className="h-5 w-5 text-white" />
          </div>
        </div>

        <Header />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;