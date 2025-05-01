import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Account from './admin/Account';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/account" element={<Account />} />
      </Routes>
    </Router>
  );
};

export default App;
