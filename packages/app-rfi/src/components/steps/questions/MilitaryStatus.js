import React from "react";

import { gaEventPropTypes } from "@asu/shared";
import { pushDataLayerEventToGa } from "../../../core/utils/google-analytics";
import { RfiRadioGroup } from "../../controls";
import PropTypes from "prop-types";
import { KEY } from "../../../core/utils/constants";
import { useRfiContext } from "../../../core/utils/rfiContext";

/**
 * The form handler requires known values
 * - "None"
 * - "Active Duty"
 * - "National Guard"
 * - "Veteran"
 * - "Armed forces reserve"
 * - "Spouse/Dependent"
 */

const militaryOptions = [
  { key: "0", text: "Yes", value: "Active Duty" },
  { key: "1", text: "No", value: "None" },
];

const pushMilitaryStatusDataLayer = text => {
  pushDataLayerEventToGa({
    event: "select",
    action: "click",
    name: "onclick",
    type: "checkbox",
    region: "main content",
    section: "request info ^ military or military dependent",
    text,
    component: "radio button",
  });
};

/**
 * @param {{ gaData: import("@asu/shared").GAEventObject}} props
 */
export const MilitaryStatus = ({ gaData, onlineOnly = false }) => {
  const {
    formik: { values },
  } = useRfiContext();

  const selectedCampus = values.CampusProgramHasChoice || values.Campus;

  if (onlineOnly && selectedCampus !== KEY.ONLINE) {
    return null;
  }

  const label =
    "Have you served in the U.S. Military or are you a military dependent?";
  const name = "MilitaryStatus";

  return (
    <RfiRadioGroup
      label={label}
      id={name}
      name={name}
      options={militaryOptions}
      onBlur={e => {
        const selectedOption = militaryOptions.find(
          option => option.value === e.target.value
        );

        pushMilitaryStatusDataLayer(selectedOption?.text.toLowerCase());
      }}
    />
  );
};

MilitaryStatus.propTypes = {
  gaData: gaEventPropTypes,
  onlineOnly: PropTypes.bool,
};
MilitaryStatus.gaName = "military_status";
