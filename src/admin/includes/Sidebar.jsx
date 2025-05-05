import { useState } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { House, Gear, BoxArrowRight, List, People, PersonCheck, Calendar4Range, Layers, Journal, Columns, JournalText, Bank, LayoutWtf, PeopleFill, PersonPlusFill  } from 'react-bootstrap-icons';

function Sidebar({ collapsed, setCollapsed, activePage, handleMenuClick, handleLogout }) {
  return (
    <div className={`sidebar bg-dark text-white p-3 ${collapsed ? 'collapsed' : ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        {!collapsed && <h5 className="text-white">School Management System</h5>}
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="toggle-btn"
        >
          <List size={20} />
        </Button>
      </div>
      <hr />
      <Nav className="flex-column">
        <Nav.Link
          onClick={() => handleMenuClick('dashboard')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'dashboard' ? 'active bg-secondary' : ''}`}
        >
          <House size={20} className="me-2" />
          {!collapsed && 'Dashboard'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('employees')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'employees' ? 'active bg-secondary' : ''}`}
        >
          <People size={20} className="me-2" />
          {!collapsed && 'Employees'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('students')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'students' ? 'active bg-secondary' : ''}`}
        >
          <PersonCheck size={20} className="me-2" />
          {!collapsed && 'Students'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_year')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_year' ? 'active bg-secondary' : ''}`}
        >
          <Calendar4Range size={20} className="me-2" />
          {!collapsed && 'School Year'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_levels')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_levels' ? 'active bg-secondary' : ''}`}
        >
          <Layers size={20} className="me-2" />
          {!collapsed && 'School Levels'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_sections')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_sections' ? 'active bg-secondary' : ''}`}
        >
          <Columns size={20} className="me-2" />
          {!collapsed && 'School Sections'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_subjects')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_subjects' ? 'active bg-secondary' : ''}`}
        >
          <JournalText size={20} className="me-2" />
          {!collapsed && 'School Subjects'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_buildings')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_buildings' ? 'active bg-secondary' : ''}`}
        >
          <Bank size={20} className="me-2" />
          {!collapsed && 'School Buildings'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_rooms')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_rooms' ? 'active bg-secondary' : ''}`}
        >
          <LayoutWtf size={20} className="me-2" />
          {!collapsed && 'School Rooms'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_classes')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_classes' ? 'active bg-secondary' : ''}`}
        >
          <PeopleFill size={20} className="me-2" />
          {!collapsed && 'Classes'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('school_enrollment')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'school_enrollment' ? 'active bg-secondary' : ''}`}
        >
          <PersonPlusFill size={20} className="me-2" />
          {!collapsed && 'Enrollment'}
        </Nav.Link>
        <Nav.Link
          onClick={() => handleMenuClick('settings')}
          className={`text-white d-flex align-items-center mb-2 ${activePage === 'settings' ? 'active bg-secondary' : ''}`}
        >
          <Gear size={20} className="me-2" />
          {!collapsed && 'Settings'}
        </Nav.Link>
        <Nav.Link
          onClick={handleLogout}
          className="text-white d-flex align-items-center mt-auto"
        >
          <BoxArrowRight size={20} className="me-2" />
          {!collapsed && 'Logout'}
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;
