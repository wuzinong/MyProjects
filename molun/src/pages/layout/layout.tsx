import { Outlet } from "react-router-dom";

import { Footer, Header } from "global";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="middlePart">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
