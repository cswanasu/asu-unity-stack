import React, { useState } from "react";
import { createPortal } from "react-dom";
import { pushDataLayerEventToGa } from "../../core/utils/google-analytics";
import { useRfiContext } from "../../core/utils/rfiContext";

const CURRENT_REQUEST_URL = "https://admission.asu.edu/current-request";

const getProgramCode = degreeData => {
  if (!degreeData?.acadCode) {
    return undefined;
  }

  return degreeData.acadCode.split("-")[0];
};

const buildCurrentRequestUrl = degreeData => {
  const params = new URLSearchParams();

  if (degreeData?.emailAddr) {
    params.set("contact", degreeData.emailAddr);
  }

  if (degreeData?.title) {
    params.set("name", degreeData.title);
  }

  if (degreeData?.acadPlanCode) {
    params.set("plan", degreeData.acadPlanCode);
  }

  const programCode = getProgramCode(degreeData);
  if (programCode) {
    params.set("prog", programCode);
  }

  params.set("check_logged_in", "1");

  return `${CURRENT_REQUEST_URL}?${params.toString()}`;
};

const pushCurrentStudentHelpClick = () => {
  pushDataLayerEventToGa({
    event: "modal",
    action: "open",
    name: "onclick",
    type: "click",
    region: "main content",
    section: "already an asu student?",
    text: "get your questions answered.",
    component: "rfi banner",
  });
};

const pushCurrentStudentLinkClick = ({ type, text }) => {
  pushDataLayerEventToGa({
    event: "link",
    action: "click",
    name: "onclick",
    type,
    region: "main content",
    section: "questions about this degree?",
    text,
    component: "current asu students",
  });
};

const pushCurrentStudentBackClick = () => {
  pushDataLayerEventToGa({
    event: "modal",
    action: "close",
    name: "onclick",
    type: "click",
    region: "main content",
    section: "current asu students",
    text: "back",
  });
};

export const CurrentStudentHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { degreeData = {} } = useRfiContext();

  const currentRequestUrl = buildCurrentRequestUrl(degreeData);

  const openDrawer = () => {
    pushCurrentStudentHelpClick();
    setIsClosing(false);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsClosing(true);

    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 260);
  };

  const closeDrawerWithBackClick = () => {
    pushCurrentStudentBackClick();
    closeDrawer();
  };

  const drawer = isOpen ? (
    <div
      className={`rfi-current-student-drawer${
        isClosing ? " is-closing" : ""
      }`}
    >
      <button
        type="button"
        className="rfi-current-student-overlay"
        aria-label="Close current ASU student information"
        onClick={closeDrawer}
      />

      <aside
        id="rfi-current-student-panel"
        className="rfi-current-student-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfi-current-student-heading"
      >
        <button
          type="button"
          className="rfi-current-student-back"
          onClick={closeDrawerWithBackClick}
        >
          <i className="fas fa-arrow-left" aria-hidden="true" /> Back
        </button>

        <h2 id="rfi-current-student-heading">Current ASU students</h2>

        <h3>Questions about this degree?</h3>

        <p>
          <a
            href={currentRequestUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              pushCurrentStudentLinkClick({
                type: "internal link",
                text: "complete this form",
              })
            }
          >
            Complete this form
          </a>{" "}
          and we&apos;ll follow up with you.
        </p>

        {(degreeData.contactOfficeName ||
          degreeData.contactEmail ||
          degreeData.contactPhone) && (
          <div className="rfi-current-student-contact">
            <p>Or, use the contact information below:</p>

            {(degreeData.contactOfficeName ||
              degreeData.contactOfficeLocation) && (
              <p>
                {degreeData.contactOfficeName && (
                  <a
                    href={degreeData.contactOfficeUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      pushCurrentStudentLinkClick({
                        type: "internal link",
                        text: degreeData.contactOfficeName?.toLowerCase(),
                      })
                    }
                  >
                    {degreeData.contactOfficeName}
                  </a>
                )}
                {degreeData.contactOfficeName &&
                  degreeData.contactOfficeLocation &&
                  " | "}
                {degreeData.contactOfficeLocation}
              </p>
            )}

            {degreeData.contactEmail && (
              <p>
                <a
                  href={`mailto:${degreeData.contactEmail}`}
                  onClick={() =>
                    pushCurrentStudentLinkClick({
                      type: "external link",
                      text: degreeData.contactEmail?.toLowerCase(),
                    })
                  }
                >
                  {degreeData.contactEmail}
                </a>
              </p>
            )}

            {degreeData.contactPhone && <p>{degreeData.contactPhone}</p>}
          </div>
        )}
      </aside>
    </div>
  ) : null;

  return (
    <>
      <div className="rfi-current-student-alert">
        <i className="fas fa-question-circle" aria-hidden="true" />
        <strong>Already an ASU student?</strong>{" "}
        <button
          type="button"
          className="rfi-current-student-alert-link"
          aria-expanded={isOpen}
          aria-controls="rfi-current-student-panel"
          onClick={openDrawer}
        >
          Get your questions answered.
        </button>
      </div>

      {drawer && createPortal(drawer, document.body)}
    </>
  );
};
