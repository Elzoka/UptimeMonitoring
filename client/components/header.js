import Link from "next/link";

export default function Header() {
  return (
    <div className="header">
      {/* Logo */}
      <a className="logo" href="/">
        <img src="/logo.png" alt="Logo" />
      </a>
      {/* Navigation */}
      <ul className="menu">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li className="loggedOut">
          <Link href="/account/create">Signup</Link>
        </li>
        <li className="loggedOut">
          <Link href="/session/create">Login</Link>
        </li>
        <li className="loggedIn">
          <Link href="/checks/all">Dashboard</Link>
        </li>
        <li className="loggedIn">
          <Link href="/account/edit">Account Settings</Link>
        </li>
        <li className="loggedIn">
          <Link href="#" id="logoutButton">
            Logout
          </Link>
        </li>
      </ul>
      <div className="clear" />
    </div>
  );
}
