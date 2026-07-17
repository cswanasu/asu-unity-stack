import React from "react";

import { gaEventPropTypes, trackGAEvent } from "@asu/shared";
import { PII_VALUE } from "../../../core/utils/constants";
import { RfiPhone } from "../../controls";
import PropTypes from "prop-types";

/**
 * @param {{ gaData: import("@asu/shared").GAEventObject}} props
 */
export const Phone = ({
  gaData,
  label = "Phone",
}) => {
  const name = "Phone";

  return (
    <RfiPhone
      label={label}
      id={name}
      name={name}
      requiredIcon
      required
      onBlur={e =>
        trackGAEvent({
          ...gaData,
          type: label,
          text: PII_VALUE,
        })
      }
    />
  );
};

Phone.propTypes = {
  gaData: gaEventPropTypes,
  label: PropTypes.string,
};
Phone.gaName = "phone";
