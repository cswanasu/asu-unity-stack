import React from "react";

import { gaEventPropTypes, trackGAEvent } from "@asu/shared";
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
      onBlur={e =>
        trackGAEvent({
          ...gaData,
          event: "select",
          type: label,
          text: e.target.value,
        })
      }
    />
  );
};

MilitaryStatus.propTypes = {
  gaData: gaEventPropTypes,
  onlineOnly: PropTypes.bool,
};
MilitaryStatus.gaName = "military_status";
