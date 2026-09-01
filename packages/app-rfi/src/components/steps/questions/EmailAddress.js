import React, { useRef } from "react";

import { gaEventPropTypes } from "@asu/shared";
import { pushDataLayerEventToGa } from "../../../core/utils/google-analytics";
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

  const hasTrackedValue = useRef(false);
  const latestValue = useRef("");

  const pushEmailDataLayer = value => {
    if (!value || hasTrackedValue.current) {
      return;
    }

    const { component, ...emailGaData } = gaData;

    pushDataLayerEventToGa({
      ...emailGaData,
      event: "form",
      action: "click",
      name: "onclick",
      region: "main content",
      type: "blur",
      section: "request info ^ email",
      text: value.toLowerCase(),
      component: "form field",
    });

    hasTrackedValue.current = true;
  };


  return (
    <RfiEmailInput
      label={label}
      id={name}
      name={name}
      requiredIcon
      required
      autoFocus={autoFocus}
      onBlur={e => {
        pushEmailDataLayer(e.target.value || latestValue.current);
      }}
      onChange={e => {
        latestValue.current = e.target.value;
      }}
    />
  );
};

EmailAddress.propTypes = {
  gaData: gaEventPropTypes,
  autoFocus: PropTypes.bool,
  label: PropTypes.string,
};
EmailAddress.gaName = "email_address";
