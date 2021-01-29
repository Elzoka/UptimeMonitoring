import Footer from "./footer";
import Header from "./header";

const Layout = ({ children }) => {
  return (
    <div className="wrapper">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
