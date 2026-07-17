import React from "react";

import { KEY } from "../../../core/utils/constants";
import { useRfiContext } from "../../../core/utils/rfiContext";

export const OnlineConsentText = () => {
  const {
    formik: { values },
  } = useRfiContext();

  const selectedCampus = values.CampusProgramHasChoice || values.Campus;

  if (selectedCampus !== KEY.ONLINE) {
    return null;
  }

  return (
    <div className="rfi-consent">
      <div className="rfi-consent-wording">
        By submitting my information, I consent to ASU contacting me about
        educational services using automated calls, prerecorded voice messages,
        SMS/text messages or email at the information provided above. Message
        and data rates may apply. Consent is not required to receive services,
        and I may call ASU directly at <a href="tel:8662776589">866-277-6589</a>.
        I consent to ASU’s{" "}
        <a href="https://asuonline.asu.edu/text-terms/">
          mobile terms and conditions
        </a>
        , and{" "}
        <a href="https://asuonline.asu.edu/web-analytics-privacy-2/">
          Privacy Statements
        </a>
        , including the European Supplement.
      </div>
    </div>
  );
};