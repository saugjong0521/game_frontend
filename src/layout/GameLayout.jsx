import React from 'react';
import { Outlet } from 'react-router-dom';

const GameLayout = () => {
  return (
    <div className=""> {/* Navigation 높이만큼 padding-top */}
      <Outlet />
    </div>
  );
};


export default GameLayout;