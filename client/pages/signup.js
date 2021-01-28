const signup = () => {
  return (
    <div className="content">
      <h1>Create Your Account</h1>
      <h2>Signup is easy and only takes a few seconds.</h2>
      <div className="formWrapper">
        <form id="accountCreate" action="/api/users" method="POST">
          <div className="formError" />
          <div className="inputWrapper">
            <div className="inputLabel">First Name</div>
            <input type="text" name="firstName" placeholder="John" />
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">Last Name</div>
            <input type="text" name="lastName" placeholder="Smith" />
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">Phone Number</div>
            <input type="text" name="phone" placeholder="(415) 123-4567" />
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">Choose a Password</div>
            <input
              type="password"
              name="password"
              placeholder="Make it a good one!"
            />
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">
              Do you agree to the terms and conditions?
            </div>
            <input type="checkbox" name="tosAgreement" defaultValue="agree" />
          </div>
          <div className="inputWrapper ctaWrapper">
            <button type="submit" className="cta green">
              Get Started
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default signup;
