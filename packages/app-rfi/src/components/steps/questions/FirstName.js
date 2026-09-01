import React, { useRef } from "react";

import { gaEventPropTypes } from "@asu/shared";
import { pushDataLayerEventToGa } from "../../../core/utils/google-analytics";
import { RfiTextInput } from "../../controls";

/**
 * @param {{ gaData: import("@asu/shared").GAEventObject}} props
 */
export const FirstName = ({ gaData }) => {
  const label = "First name";
  const name = "FirstName";

  const hasTrackedValue = useRef(false);
  const latestValue = useRef("");

  const pushFirstNameDataLayer = value => {
    if (!value || hasTrackedValue.current) {
      return;
    }

    const { component, ...firstNameGaData } = gaData;

    pushDataLayerEventToGa({
      ...firstNameGaData,
      event: "form",
      action: "click",
      name: "onclick",
      region: "main content",
      type: "blur",
      section: "request info ^ first name",
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
        pushFirstNameDataLayer(e.target.value || latestValue.current);
      }}
      onChange={e => {
        latestValue.current = e.target.value;
      }}
    />
  );
};

FirstName.propTypes = { gaData: gaEventPropTypes };
FirstName.gaName = "first_name";
