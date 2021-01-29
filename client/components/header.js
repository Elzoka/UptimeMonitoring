/* eslint-disable jsx-a11y/anchor-is-valid */
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
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li className="loggedOut">
          <Link href="/signup">
            <a>Signup</a>
          </Link>
        </li>
        <li className="loggedOut">
          <Link href="/login">
            <a>Login</a>
          </Link>
        </li>
        <li className="loggedIn">
          <Link href="/checks">
            <a>Dashboard</a>
          </Link>
        </li>
        <li className="loggedIn">
          <Link href="/account/edit">
            <a>Account Settings</a>
          </Link>
        </li>
        <li className="loggedIn">
          <Link href="#" id="logoutButton ">
            <a> Logout</a>
          </Link>
        </li>
      </ul>
      <div className="clear" />
    </div>
  );
}
