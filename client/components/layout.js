import Footer from "./footer";
import Header from "./header";

const Layout = ({ children }) => {
  return (
    <div className="body">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
