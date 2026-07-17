import React from "react";

import { gaEventPropTypes, trackGAEvent } from "@asu/shared";
import { PII_VALUE } from "../../../core/utils/constants";
import { RfiEmailInput } from "../../controls";
import PropTypes from "prop-types";

/**
 * @param {{ gaData: import("@asu/shared").GAEventObject}} props
 */

export const EmailAddress = ({
  gaData,
  autoFocus,
  label = "Email Address",
}) => {
  const name = "EmailAddress";

  return (
    <RfiEmailInput
      label={label}
      id={name}
      name={name}
      requiredIcon
      required
      autoFocus={autoFocus}
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

EmailAddress.propTypes = {
  gaData: gaEventPropTypes,
  autoFocus: PropTypes.bool,
  label: PropTypes.string,
};
EmailAddress.gaName = "email_address";
