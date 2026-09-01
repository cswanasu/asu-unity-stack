// @ts-check
import { deepCloner } from "@asu/shared";
import { KEY } from "./constants";
import { pushDataLayerEventToGa, setClientId } from "./google-analytics";

/**
 * @typedef {Object} FormPayload
 * @property {number} [datetime]
 * @property {number} [Test]
 * @property {string} [BirthDate]
 * @property {string} [Campus]
 * @property {string} [CampusProgramHasChoice]
 * @property {string} [Career]
 * @property {string} [CareerAndStudentType]
 * @property {string} [CitizenshipCountry]
 * @property {string} [CitizenshipCountryName]
 * @property {string} [Country]
 * @property {string} [Email]
 * @property {string} [EmailAddress]
 * @property {string} [EntryTerm]
 * @property {string} [FirstName]
 * @property {string} [GdprConsent]
 * @property {string} [Interest1]
 * @property {string} [Interest2]
 * @property {string} [LastName]
 * @property {string} [MilitaryStatus]
 * @property {string} [Phone]
 * @property {string} [Source]
 * @property {string} [StudentType]
 * @property {string} [URL]
 * @property {string} [Zip]
 * @property {string} [ZipCode]
 */

/**
 * @typedef {Object} SubmitOptions
 * @property {boolean} [keepCountry]
 * @property {boolean} [keepCitizenshipCountry]
 * @property {boolean} [isCertMinor]
 * @property {boolean} [waitForSubmitSuccess]
 * @property {{
 *   title?: string,
 *   acadCode?: string,
 *   acadPlanCode?: string
 * }} [degreeData]
 * @property {Array<{
 *   title?: string,
 *   acadCode?: string,
 *   acadPlanCode?: string,
 *   acadPlanKey?: string
 * }>} [degreeDataList]
 */

/**
 * @typedef {Object} SubmissionResponse
 * @property {string} status
 * @property {string} message
 */

/**
 * In order to make a field not required, we set the default or blank value
 * to {KEY.FALSE_EMPTY}. This way we do not need to alter validation schemas. Remove all
 * {KEY.FALSE_EMPTY} values before we submit
 * @param {Object.<string, *>} values
 * @returns {Object.<string, *>}
 */
const removeUnansweredFields = (/** @type {FormPayload} */ values) =>
  Object.entries(values)
    .filter(([_, value]) => value !== undefined)
    .filter(([_, value]) => value !== KEY.FALSE_EMPTY)
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});

/* Remove keys that appear from side effects */
/**
 * @param {FormPayload} payload
 * @returns {FormPayload}
 */
function submissionFormFieldRemoveSideEffectKeys(
  /** @type {FormPayload} */ payload,
  { keepCountry = false, keepCitizenshipCountry = false } = {}
) {
  let output = { ...payload };

  delete output.Email;
  delete output.CitizenshipCountryName;

  if (!keepCitizenshipCountry) {
    delete output.CitizenshipCountry;
  }

  if (!keepCountry) {
    delete output.Country;
  }

  return output;
}

/* Marshall and prepare values for submission payload. */
/**
 * @param {FormPayload} payload
 * @returns {FormPayload}
 */
function submissionFormFieldPrep(
  /** @type {FormPayload} */ payload,
  options = {}
) {
  // ADJUST AND PROCESS FORM FIELDS

  let output = payload;

  // Unpack CareerAndStudentType. Select list selection is used to derive two
  // fields for the payload.
  switch (output.CareerAndStudentType) {
    case "First Time Freshman":
      output.Career = "UGRAD";
      output.StudentType = "First Time Freshman";
      break;
    case "Transfer":
      output.Career = "UGRAD";
      output.StudentType = "Transfer";
      break;
    case "Readmission":
      output.Career = "GRAD";
      // No StudentType
      break;
    default:
    // do nothing
  }

  if (output.Career === "GRAD" && !output.StudentType) {
    output.StudentType = "Masters";
  }

  delete output.CareerAndStudentType;

  output.Campus = output.CampusProgramHasChoice || output.Campus;
  delete output.CampusProgramHasChoice;

  // Consolidate Zip and ZipCode, favoring Zip.
  output.Zip = output.Zip ? output.Zip : output.ZipCode;
  delete output.ZipCode;

  output = submissionFormFieldRemoveSideEffectKeys(output, options);

  // Can't transform the BirthDate to iso value during validation as it breaks
  // type checking in Yup, so doing it here. Also... Yup.date() lets dates
  // without divider characters through but toISOString() then chokes,
  // so in those cases, since it is an optional field, we drop the date from
  // the payload, considering it bad data. The regex test ensures there's 2
  // of / or - or . characters in the string. They can be mixed.
  // if (new RegExp(/[.|/|-].{2}/).test(output.BirthDate)) {
  //   output.BirthDate = output.BirthDate
  //     ? new Date(output.BirthDate).toISOString()
  //     : undefined;
  // } else {
  //   // Is invalid date in the eyes of toISOString(), so drop.
  //   output.BirthDate = undefined;
  // }

  return output;
}

function submissionSetHiddenFields(
  /** @type {FormPayload} */ payload,
  /** @type {Boolean} */ test
) {
  // "HIDDEN" FIELDS THAT DON'T APPEAR IN THE FORM.

  const output = payload;

  // Stub in sourceid. Actual value will be added in the form's host site proxy.
  // sourceid is treated securely like an API key and kept out of the frontend.
  output.Source = "mock";

  // Whether we're in test mode or not: 1 or nothing. A prop value passed down.
  if (test) {
    output.Test = 1;
  }

  // URL. Full URL, including path and params so campaign details can be
  // harvested by downstream apps.
  output.URL = window.location.href;

  // datetime : timestamp
  output.datetime = Date.now();

  // enterpriseclientid, sourceid and ga_clientid hidden fields added
  // seperately in submit handler from where this function is also called.

  return output;
}


const getCampusText = payload => {
  const campus = payload.CampusProgramHasChoice || payload.Campus;

  if (campus === KEY.ONLINE) {
    return "online";
  }

  if (campus === KEY.GROUND) {
    return "in-person";
  }

  return campus?.toLowerCase();
};

const getCareerText = (payload, options = {}) => {
  if (options.isCertMinor) {
    return "certificate";
  }

  if (
    payload.CareerAndStudentType === "First Time Freshman" ||
    payload.CareerAndStudentType === "Transfer" ||
    payload.Career === "UGRAD"
  ) {
    return "undergraduate";
  }

  if (
    payload.CareerAndStudentType === "Readmission" ||
    payload.Career === "GRAD"
  ) {
    return "graduate";
  }

  return payload.CareerAndStudentType?.toLowerCase();
};

const getStudentStatusText = (/** @type {FormPayload} */ payload) => {
  if (payload.CareerAndStudentType === KEY.READMISSION) {
    return "masters";
  }

  return payload.CareerAndStudentType?.toLowerCase();
};

const getMilitaryService = (/** @type {FormPayload} */ payload) => {
  if (payload.MilitaryStatus === "None") {
    return false;
  }

  if (payload.MilitaryStatus) {
    return true;
  }

  return undefined;
};

const getPlanCodeFromSubmittedProgramCode = (
  /** @type {string | undefined} */ programCode
) => (programCode?.includes("-") ? programCode.split("-").pop() : programCode);

const getMatchingDegreeData = (
  /** @type {FormPayload} */ payload,
  /** @type {SubmitOptions} */ options = {}
) => {
  const submittedProgramCode = payload.Interest2;
  const submittedPlanCode =
    getPlanCodeFromSubmittedProgramCode(submittedProgramCode);
  const degreeDataList = options.degreeDataList || [];
  const degreeData = options.degreeData || {};

  return (
    degreeDataList.find(
      plan =>
        plan.acadPlanKey === submittedProgramCode ||
        plan.acadCode === submittedProgramCode ||
        plan.acadPlanCode === submittedProgramCode ||
        plan.acadPlanKey === submittedPlanCode ||
        plan.acadPlanCode === submittedPlanCode ||
        plan.acadCode?.endsWith(`-${submittedPlanCode}`)
    ) ||
    (degreeData.acadPlanKey === submittedProgramCode ||
    degreeData.acadCode === submittedProgramCode ||
    degreeData.acadPlanCode === submittedProgramCode ||
    degreeData.acadPlanKey === submittedPlanCode ||
    degreeData.acadPlanCode === submittedPlanCode ||
    degreeData.acadCode?.endsWith(`-${submittedPlanCode}`)
      ? degreeData
      : {})
  );
};




const preparePushGaEventData = (
  /** @type {FormPayload} */ payload,
  options = {}
) => {
  const matchingDegreeData = getMatchingDegreeData(payload, options);
  const submittedProgramCode = matchingDegreeData.acadCode || payload.Interest2;
  const isOnline = getCampusText(payload) === "online";

  pushDataLayerEventToGa({
    event: "form",
    name: "onsubmit",
    action: "rfi submit",
    type: "submit",
    region: "main content",
    section: "request info",
    text: "rfi form submitted",
    component: "button",
    first_name: payload.FirstName?.toLowerCase(),
    last_name: payload.LastName?.toLowerCase(),
    email: payload.EmailAddress?.toLowerCase(),
    phone: payload.Phone,
    campus: getCampusText(payload),
    career: getCareerText(payload, options),
    area_of_interest: payload.Interest1?.toLowerCase(),
    // program: degreeData.title?.toLowerCase(),
    program: matchingDegreeData.title?.toLowerCase(),
    program_code: submittedProgramCode,
    military_service: getMilitaryService(payload),

    ...(isOnline
      ? {}
      : {
          student_status: getStudentStatusText(payload),
          zip_code: payload.ZipCode?.toLowerCase(),
          entry_term: payload.EntryTerm?.toLowerCase(),
          gdpr_consent: payload.GdprConsent?.toString().toLowerCase(),
          location: (
            payload.CitizenshipCountryName || payload.CitizenshipCountry
          )?.toLowerCase(),
        }),

  });
};



export const rfiSubmit = async (
  /** @type {FormPayload} */ value,
  submissionUrl = "",
  test = false,
  callback = (/** @type {any} */ _) => ({}),
  options = {}

) => {
  // MARSHALL FIELDS FOR THE PAYLOAD

  let payload = deepCloner(value);
  payload = submissionFormFieldPrep(payload, options);
  payload = submissionSetHiddenFields(payload, test);
  payload = removeUnansweredFields(payload);

  // Patch ASUOnline clientid or enterpriseclientid and also
  // ga_clientid onto payload.
  // TODO Confirm sourcing for ga_clientid
  payload = setClientId(payload);

  const shouldWaitForSubmitSuccess = options.waitForSubmitSuccess === true;

  // For variant 1 and 2, submit analytics. For variant 3, submit analytics is pushed after the POST succeeds; see the response handler below.
  if (!shouldWaitForSubmitSuccess) {
    preparePushGaEventData(value, options);
  }

  if (test) {
    // eslint-disable-next-line no-console
    console.log(`SUBMITTED FORM \n${JSON.stringify(payload, null, 2)}`);
  }

  // timeout promise that resolves after 2 seconds
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      resolve({ status: "timeout", message: "Assumed success after timeout" });
    }, 2000);
  });

  const fetchPromise = fetch(`${submissionUrl}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then(response => response.json());


  // Push the submitted form details only after the POST is considered successful.
  // For Variant 3, there is no timeout. Wait until receive response from Java side.
  if (shouldWaitForSubmitSuccess) {
    return fetchPromise.then(response => {
      const submissionSucceeded =
        response?.success === true || response?.status === "success";

      if (submissionSucceeded) {
        preparePushGaEventData(value, options);
      }

      return callback(response);
    });
  }

  return Promise.race([fetchPromise, timeoutPromise]).then(response => {
    return callback(response);
  });
};
