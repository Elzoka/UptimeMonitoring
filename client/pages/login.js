const login = () => {
  return (
    <div className="content">
      <h1>Login To Your Account</h1>
      <h2>Enter your phone number and password</h2>
      <div className="formWrapper">
        <form id="sessionCreate" action="/api/tokens" method="POST">
          <div className="formError" />
          <div className="inputWrapper">
            <div className="inputLabel">Phone Number</div>
            <input type="text" name="phone" placeholder="(415) 123-4567" />
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">Your Password</div>
            <input type="password" name="password" placeholder="*********" />
          </div>
          <div className="inputWrapper ctaWrapper">
            <button type="submit" className="cta blue">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default login;
