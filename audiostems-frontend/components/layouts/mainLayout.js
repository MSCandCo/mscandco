import React from "react";
import RoleBasedNavigation from "../auth/RoleBasedNavigation";
import Footer from "../footer";

function MainLayout({ children, className }) {
  return (
    <div className={className}>
      <RoleBasedNavigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
