import React from 'react';
import { Outlet } from 'react-router-dom';

const LeaderBoardLayout = () => {
    // 중첩된 자식 라우트를 렌더링
    return <Outlet />;
};

export default LeaderBoardLayout;