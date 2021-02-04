import Link from "next/link";
import React, { useEffect, useState } from "react";
const Dashboard = () => {
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    fetch("/api/check")
      .then((response) => response.json())
      .then(({ checks }) => setChecks(checks || []));
  }, []);

  return (
    <div className="content">
      <h1>Dashboard</h1>
      <h2>You may create up to 5 checks</h2>
      <hr />

      <table id="checksListTable">
        <thead>
          <tr>
            <th>Method</th>
            <th>Protocol</th>
            <th>URL</th>
            <th>State</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {checks.length > 0 ? (
            checks.map((check) => (
              <tr key={check._id}>
                <td>{check.method}</td>
                <td>{check.protocol}</td>
                <td>{check.url}</td>
                <td> {check.state || "unknown"}</td>
                <td>
                  <a href={`/checks/edit/${check._id}`}>View / Edit / Delete</a>
                </td>
              </tr>
            ))
          ) : (
            <tr id="noChecksMessage">
              <td colSpan="5">You have no checks, please create one!</td>
            </tr>
          )}
        </tbody>
      </table>

      {checks.length <= 5 ? (
        <div id="createCheckCTA" className="ctaWrapper">
          <Link href="/checks/create">
            <a className="cta green">Create a Check</a>
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
