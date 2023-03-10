import { createUseStyles } from "react-jss";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { BarLoader } from "react-spinners";

const useStyles = createUseStyles({
  main: {
    padding: "100px 10vw",
    display: "flex",
    flexDirection: "column",
    placeItems: "center",
  },
  header: {
    fontSize: "3rem",
    margin: "0 0 16px 0",
    color: "#8ec07c",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: "1.5rem",
    "& > input, & > textarea": {
      border: 0,
      background: "#3c3836",
      fontSize: "1rem",
      color: "#fbf1c7",
      padding: "4px 8px",
      resize: "none",
      maxWidth: 420,
      width: "75vw",
    },
    "& > input::placeholder, & > textarea::placeholder": {
      fontFamily: "'Space Mono', monospace",
    },
    "& > input:focus, & > textarea:focus": {
      outline: "none",
    },
    "& > input:disabled, & > textarea:disabled": {
      cursor: "wait",
    },
  },
  submit: {
    color: "#8ec07c",
    padding: "4px 8px",
    cursor: "pointer",
    width: "50%",
    height: 31,
    display: "grid",
    placeItems: "center",
    border: 0,
    background: "#3c3836",
    fontSize: "1rem",
    "&:disabled": {
      cursor: "wait",
    },
  },
  lastRow: {
    display: "flex",
    alignItems: "center",
  },
  response: {
    display: "inline",
    width: "50%",
    fontSize: "1rem",
    paddingLeft: 4,
  },
});

const Contact = () => {
  const Css = useStyles();

  const recaptchaRef = useRef(null);

  const [response, setResponse] = useState({});

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const token = await recaptchaRef.current.executeAsync();

    if (!token) {
      console.error("Could not get token from ReCAPTCHA");
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, token: token }),
    });

    const resData = await res.json();

    setResponse(resData);
    reset();

    window.gtag("event", "form_submitted", {
      event_label: "Contact form submitted",
      event_category: "engagement",
    });
  };

  return (
    <section className={Css.main} id="contact">
      <h2 className={Css.header}>Contact me</h2>
      <form className={Css.form} onSubmit={handleSubmit(onSubmit)}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          size="invisible"
        />
        <label htmlFor="name" hidden>
          Name
        </label>
        <input
          name="name"
          id="name"
          placeholder="Name"
          {...register("name", {
            required: true,
          })}
          style={errors.name && { outline: "1px red solid" }}
          disabled={isSubmitting}
        />
        <label htmlFor="email" hidden>
          Email
        </label>
        <input
          name="email"
          id="email"
          placeholder="Email"
          {...register("email", {
            required: true,
            pattern: /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/,
          })}
          style={errors.email && { outline: "1px red solid" }}
          disabled={isSubmitting}
        />
        <label htmlFor="message" hidden>
          Message
        </label>
        <textarea
          name="message"
          id="message"
          placeholder="Your message"
          rows="5"
          {...register("message", { required: true })}
          style={errors.message && { outline: "1px red solid" }}
          disabled={isSubmitting}
        />
        <div className={Css.lastRow}>
          <span className={Css.response}>
            {response.message ?? response.error}
          </span>
          <button type="submit" className={Css.submit} disabled={isSubmitting}>
            {isSubmitting ? <BarLoader color="#8ec07c" height={5} /> : "Submit"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Contact;
