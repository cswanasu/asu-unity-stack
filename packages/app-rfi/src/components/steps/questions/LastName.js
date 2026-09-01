import React, { useRef } from "react";

import { gaEventPropTypes } from "@asu/shared";
import { pushDataLayerEventToGa } from "../../../core/utils/google-analytics";
import { RfiTextInput } from "../../controls";

/**
 * @param {{ gaData: import("@asu/shared").GAEventObject}} props
 */
export const LastName = ({ gaData }) => {
  const label = "Last name";
  const name = "LastName";

  const hasTrackedValue = useRef(false);
  const latestValue = useRef("");

  const pushLastNameDataLayer = value => {
    if (!value || hasTrackedValue.current) {
      return;
    }

    const { component, ...lastNameGaData } = gaData;

    pushDataLayerEventToGa({
      ...lastNameGaData,
      event: "form",
      action: "click",
      name: "onclick",
      region: "main content",
      type: "blur",
      section: "request info ^ last name",
      text: value.toLowerCase(),
      component: "form field",
    });

    hasTrackedValue.current = true;
  };

  return (
    <RfiTextInput
      label={label}
      id={name}
      name={name}
      requiredIcon
      required
      onBlur={e => {
        pushLastNameDataLayer(e.target.value || latestValue.current);
      }}
      onChange={e => {
        latestValue.current = e.target.value;
      }}
    />
  );
};

LastName.propTypes = { gaData: gaEventPropTypes };
LastName.gaName = "last_name";
