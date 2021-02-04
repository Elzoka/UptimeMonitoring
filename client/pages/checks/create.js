import { useFormik } from "formik";
import Link from "next/link";

const CreateCheck = () => {
  const formik = useFormik({
    initialValues: {
      protocol: "http",
      url: "",
      method: "get",
      timeout: 1,
      successCodes: [],
    },

    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <div className="content">
      <h1>Create A Check</h1>
      <h2>Your check will run once per minute</h2>
      <Link href="/dashboard">
        <a className="backButton">Back</a>
      </Link>

      <hr />
      <div className="formWrapper">
        <form id="checksCreate" onSubmit={formik.handleSubmit}>
          <div className="formError" />
          <div className="inputWrapper">
            <div className="inputLabel">Protocol</div>
            <select
              name="protocol"
              value={formik.values.protocol}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="http">http://</option>
              <option value="https">https://</option>
            </select>
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">URL (not including protocol)</div>
            <input
              type="text"
              name="url"
              placeholder="mywebsite.com/my/path"
              value={formik.values.url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">
              Success Codes (HTTP codes that should represent {"up"})
            </div>
            <div className="checkboxGroup">
              {[200, 201, 301, 302, 400, 403, 404, 406, 500].map(
                (successCode) => (
                  <>
                    <input
                      type="checkbox"
                      className="multiselect intval"
                      name="successCodes"
                      value={successCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      //   defaultValue={successCode}
                    />
                    {successCode}
                  </>
                )
              )}
            </div>
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">HTTP Method</div>
            <select
              name="method"
              value={formik.values.method}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="post">POST</option>
              <option value="get">GET</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
            </select>
          </div>
          <div className="inputWrapper">
            <div className="inputLabel">Timeout</div>
            <select
              className="intval"
              name="timeout"
              value={formik.values.timeout}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
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
