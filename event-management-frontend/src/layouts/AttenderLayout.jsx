import { Outlet } from "react-router-dom";

const AttenderLayout = () => (
  <main style={{ minHeight: '100vh', padding: '40px', background: '#fff' }}>
    <Outlet />
  </main>
);

export default AttenderLayout;
