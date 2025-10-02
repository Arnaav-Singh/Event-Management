import { Outlet } from "react-router-dom";

const CoordinatorLayout = () => (
  <main style={{ minHeight: '100vh', padding: '40px', background: '#fff' }}>
    <Outlet />
  </main>
);

export default CoordinatorLayout;
