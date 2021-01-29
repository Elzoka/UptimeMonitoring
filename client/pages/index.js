import Link from "next/link";

function HomePage() {
  return (
    <div className="content">
      <h1>Uptime Monitoring</h1>
      <h2>Made Simple</h2>
      <div className="blurb">
        We offer free, simple uptime monitoring for HTTP/HTTPS sites of all
        kinds, When your site goes down, we ll send you a text to let you know.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio obcaecati
        voluptatum aliquid ab odit adipisci nulla consectetur nihil, cumque eius
        tempora reiciendis hic molestiae possimus facere eum quis corrupti
        pariatur. Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        Voluptatum earum et non nulla nisi, perspiciatis, magni, natus minima
        aut eius incidunt unde error labore nemo laboriosam illo dignissimos
        provident architecto?
      </div>
      <div className="ctaWrapper">
        <Link href="/signup">
          <a className="cta green">Get Started</a>
        </Link>
        <Link href="/login">
          <a className="cta blue">Login</a>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
