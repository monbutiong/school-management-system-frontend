import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import '../css/Account.css';

import Sidebar from './includes/Sidebar';
import TopNavbar from './includes/TopNavbar';

import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Students from './pages/Students';
import SchoolYear from './pages/SchoolYear';
import SchoolLevels from './pages/SchoolLevels';
import SchoolSections from './pages/SchoolSections';
import SchoolSubjects from './pages/SchoolSubjects';
import SchoolBuildings from './pages/SchoolBuildings';
import SchoolRooms from './pages/SchoolRooms';
import SchoolClasses from './pages/SchoolClasses';

import Settings from './pages/Settings';

function Account() {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/');
  }, [navigate]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActivePage(tab);
  }, [location]);

  const handleMenuClick = (page) => {
    if (page === activePage) return;
    setIsLoading(true);
    setTimeout(() => {
      navigate(`?tab=${page}`);
      setIsLoading(false);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="d-flex">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activePage={activePage}
        handleMenuClick={handleMenuClick}
        handleLogout={handleLogout}
      />
      <div className="main-content flex-grow-1">
        <TopNavbar />
        <div className="p-4">
          {isLoading ? (
            <div className="text-center my-4">
              <ClipLoader color="#007bff" loading={isLoading} size={50} />
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && <Dashboard />}
              {activePage === 'employees' && <Employees />}
              {activePage === 'students' && <Students />}
              {activePage === 'school_year' && <SchoolYear />}
              {activePage === 'school_levels' && <SchoolLevels />}
              {activePage === 'school_sections' && <SchoolSections />}
              {activePage === 'school_subjects' && <SchoolSubjects />}
              {activePage === 'school_buildings' && <SchoolBuildings />}
              {activePage === 'school_rooms' && <SchoolRooms />}
              {activePage === 'school_classes' && <SchoolClasses />}
              {activePage === 'settings' && <Settings />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;
