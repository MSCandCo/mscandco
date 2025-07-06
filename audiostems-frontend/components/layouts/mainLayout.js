import React from "react";
import Header from "../header";
import Footer from "../footer";

function MainLayout({ children, className }) {
  return (
    <div className={className}>
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
