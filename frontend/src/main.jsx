import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import PortalHome from "./pages/PortalHome.jsx";
import CandidatePortal from "./pages/CandidatePortal.jsx";
import InterviewerPortal from "./pages/InterviewerPortal.jsx";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

let Page;

switch (path) {
  case "/":
    Page = PortalHome;
    break;

  case "/candidate":
    Page = CandidatePortal;
    break;

  case "/interviewer":
    Page = InterviewerPortal;
    break;

  case "/admin":
    Page = App;
    break;

  default:
    Page = PortalHome;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Page />
  </StrictMode>
);