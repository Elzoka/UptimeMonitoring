import "../styles/app.css";

import CssBaseline from "@material-ui/core/CssBaseline";
import Head from "next/head";
import React from "react";

import Footer from "../components/footer";
import Header from "../components/header";

export default function MyApp(props) {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Uptime Monitoring</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <CssBaseline />
      <Header />
      <Component {...pageProps} />
      <Footer />
    </React.Fragment>
  );
}
