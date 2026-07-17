// @ts-check
import React from "react";

import { sanitizeDangerousMarkup } from "@asu/shared";
import { KEY } from "../../core/utils/constants";
import { useRfiContext } from "../../core/utils/rfiContext";

const CAREER = {
  UGRAD: "UGRAD",
  GRAD: "GRAD",
};

/**
 * @param {string | undefined} careerAndStudentType
 * @returns {string | undefined}
 */
const getCareerCode = careerAndStudentType => {
  switch (careerAndStudentType) {
    case KEY.FRESHMAN:
    case KEY.TRANSFER:
      return CAREER.UGRAD;

    case KEY.READMISSION:
      return CAREER.GRAD;

    default:
      return undefined;
  }
};

/**
 * @param {Record<string, any> | undefined} values
 * @param {Record<string, any> | undefined} degreeData
 * @returns {string | undefined}
 */
const getCampusCode = (values, degreeData) => {
  const campus = values?.CampusProgramHasChoice || values?.Campus;

  if (campus === KEY.ONLINE || campus === KEY.GROUND) {
    return campus;
  }

  const campusCodes = degreeData?.campusCodes || [];
  const isOnlineOnly =
    campusCodes.length > 0 &&
    campusCodes.includes(KEY.ONLINE) &&
    !campusCodes.includes(KEY.GROUND);

  if (campus === KEY.NOPREF && isOnlineOnly) {
    return KEY.ONLINE;
  }

  if (campus === KEY.NOPREF) {
    return KEY.GROUND;
  }

  return campus;
};

/** @type {Record<string, string>} */
const CAMPUS_LABELS = {
  TEMPE: "Tempe",
  DTPHX: "Downtown Phoenix",
  POLY: "Polytechnic",
  WEST: "West Valley",
  ONLNE: "Online",
  GROUND: "On campus",
  NOPREF: "On campus",
};

/**
 * @param {unknown} value
 * @returns {string}
 */
const escapeHtml = value => {
  /** @type {Record<string, string>} */
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value ?? "").replace(/[&<>"']/g, char => entities[char] || char);
};

/**
 * @param {object} params
 * @param {Record<string, any> | undefined} params.degreeData
 * @param {string | undefined} params.filterByCampusCode
 * @param {Record<string, any> | undefined} params.values
 * @returns {string}
 */
const getCampusName = ({ degreeData, filterByCampusCode, values }) => {
  const campusCode =
    filterByCampusCode ||
    (degreeData?.campusCodes?.length === 1 ? degreeData.campusCodes[0] : "") ||
    getCampusCode(values, degreeData);

  return campusCode ? CAMPUS_LABELS[campusCode] || campusCode : "";
};


/**
 * @param {object} params
 * @param {string | undefined} params.programUrl
 * @param {Record<string, any> | undefined} params.values
 * @param {Record<string, any> | undefined} params.degreeData
 * @returns {string}
 */
const getProgramUrl = ({ programUrl, values, degreeData }) => {
  if (programUrl) {
    return programUrl;
  }

  const programCode =
    degreeData?.acadPlanCode || degreeData?.acadPlanKey || values?.Interest2;

  if (!programCode) {
    return "#";
  }

  const career = getCareerCode(values?.CareerAndStudentType);
  const degreePath =
    degreeData?.degreeType === KEY.UG || career === CAREER.UGRAD
      ? "bachelors"
      : "masters-phd";

  return `https://degrees.apps.asu.edu/${degreePath}/major/ASU00/${encodeURIComponent(programCode)}/`;
};


/**
 * @param {object} params
 * @param {string | undefined} params.message
 * @param {Record<string, any> | undefined} params.values
 * @param {Record<string, any> | undefined} params.degreeData
 * @param {string | undefined} params.programUrl
 * @param {string | undefined} params.filterByCampusCode
 * @returns {string | undefined}
 */
const replaceSuccessMsgTokens = ({
  message,
  values,
  degreeData,
  programUrl,
  filterByCampusCode,
}) => {
  if (!message) {
    return message;
  }

  const campusName = getCampusName({ degreeData, filterByCampusCode, values });
  const programTitle = degreeData?.title || "";
  const programTitleCampus = campusName
    ? `${programTitle} - ${campusName}`
    : programTitle;

  const resolvedProgramUrl = getProgramUrl({
    programUrl,
    values,
    degreeData,
  });

  /** @type {Record<string, string>} */
  const tokens = {
    firstName: values?.FirstName || "",
    programUrl: resolvedProgramUrl,
    programTitle,
    campusName,
    programTitleCampus,
  };

  return message.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, tokenName) =>
    escapeHtml(tokens[tokenName] ?? "")
  );
};

/**
 * @param {object} params
 * @param {string | undefined} params.successMsg
 * @param {Record<string, Record<string, string>> | undefined} params.successMsgs
 * @param {Record<string, any> | undefined} params.values
 * @param {Record<string, any> | undefined} params.degreeData
 * @param {string | undefined} params.programUrl
 * @param {string | undefined} params.filterByCampusCode
 * @returns {string | undefined}
 */
const getResolvedSuccessMsg = ({
  successMsg,
  successMsgs,
  values,
  degreeData,
  programUrl,
  filterByCampusCode,
}) => {
  const campus = getCampusCode(values, degreeData);
  const career = getCareerCode(values?.CareerAndStudentType);

  if (!campus || !career) {
    return replaceSuccessMsgTokens({
      message: successMsg,
      values,
      degreeData,
      programUrl,
      filterByCampusCode,
    });
  }

  const message = successMsgs?.[campus]?.[career] || successMsg;

  return replaceSuccessMsgTokens({
    message,
    values,
    degreeData,
    programUrl,
    filterByCampusCode,
  });
};


// Component

export const Success = () => {

  const {
    successMsg,
    successMsgs,
    formik,
    degreeData,
    programUrl,
    filterByCampusCode,
  } = useRfiContext();


  const resolvedSuccessMsg = getResolvedSuccessMsg({
    successMsg,
    successMsgs,
    values: formik?.values,
    degreeData,
    programUrl,
    filterByCampusCode,
  });


  return (
    <div className="rfi-submitted">
      <i
        className="fas fa-check-circle rfi-submitted-icon"
        style={{ fontSize: "6rem", color: "#78BE20" }}
        aria-hidden="true"
      />
      <div className="rfi-submitted-sub-icon">Submitted</div>
      <h3 className="h2">Thank you for your interest in ASU.</h3>
      {resolvedSuccessMsg ? (
        <div
          className="rfi-success-msg-wrapper"
          dangerouslySetInnerHTML={sanitizeDangerousMarkup(resolvedSuccessMsg)}
        />
      ) : (
        <>
          <p>
            We’re interested in you too! You’ll be receiving more information
            from us soon. Until then, here are several ways for you to explore
            ASU.
          </p>
          <h4>Visit campus and see for yourself</h4>
          <p>
            We encourage you to plan a visit to campus to see for yourself what
            Sun Devil life is like. ASU offers year-round campus tours at all
            five ASU locations to give you a firsthand look at student life.
          </p>
          <div className="uds-buttons">
            <a
              className="btn btn-primary"
              href="https://visit.asu.edu/schedule"
              data-ga="btn-primary link"
              data-ga-name="onclick"
              data-ga-event="link"
              data-ga-action="click"
              data-ga-type="internal link"
              data-ga-region="main content"
            >
              Schedule a visit
            </a>
            <a
              className="btn btn-primary"
              href="https://tour.asu.edu"
              data-ga="btn-primary link"
              data-ga-name="onclick"
              data-ga-event="link"
              data-ga-action="click"
              data-ga-type="internal link"
              data-ga-region="main content"
            >
              Take a virtual tour
            </a>
          </div>
          <h4>Take the next step</h4>
          <p>
            If you’re ready,{" "}
            <a href="https://admission.asu.edu/apply">apply to ASU</a> today.
            Your admission specialist can help answer any questions you have
            about the enrollment process or becoming a Sun Devil. If you are an
            on-campus student,{" "}
            <a href="https://admission.asu.edu/contact/undergraduate">
              contact your admission representative.
            </a>
          </p>
          <p>
            <strong>It’s time to be a Sun Devil!</strong>
          </p>
        </>
      )}
    </div>
  );
};
