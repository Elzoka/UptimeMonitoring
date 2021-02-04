import Link from "next/link";
const CreateCheck = () => {
  return (
    <div className="content">
      <h1>Create A Check</h1>
      <h2>Your check will run once per minute</h2>
      <Link href="/dashboard">
        <a className="backButton">Back</a>
      </Link>

      <hr />
      <div className="formWrapper">
        <form id="checksCreate" action="/api/checks" method="POST">
          <div className="formError" />
          <div className="inputWrapper">
            <div className="inputLabel">Protocol</div>
            <select name="protocol">
              <option value="http" selected>
                http://
              </option>
              <option value="https">https://</option>
            </select>
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">URL (not including protocol)</div>
            <input type="text" name="url" placeholder="mywebsite.com/my/path" />
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">
              Success Codes (HTTP codes that should represent {"up"})
            </div>
            <div className="checkboxGroup">
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={200}
                defaultChecked
              />
              200
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={201}
                defaultChecked
              />
              201
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={301}
              />
              301
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={302}
              />
              302
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={400}
              />
              400
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={403}
              />
              403
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={404}
              />
              404
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={406}
              />
              406
              <input
                type="checkbox"
                className="multiselect intval"
                name="successCodes"
                defaultValue={500}
              />
              500
            </div>
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">HTTP Method</div>
            <select name="httpmethod">
              <option value="post">POST</option>
              <option value="get" selected>
                GET
              </option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
            </select>
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">Timeout</div>
            <select className="intval" name="timeoutSeconds">
              <option value={1}>1 second</option>
              <option value={2}>2 seconds</option>
              <option value={3}>3 seconds</option>
              <option value={4}>4 seconds</option>
              <option value={5}>5 seconds</option>
            </select>
          </div>
          <div className="inputWrapper ctaWrapper">
            <button type="submit" className="cta green">
              Create Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCheck;
