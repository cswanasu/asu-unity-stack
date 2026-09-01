import React from "react";

import { gaEventPropTypes } from "@asu/shared";
import { pushDataLayerEventToGa } from "../../../core/utils/google-analytics";
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
      onBlur={e => {
        const { component, ...phoneGaData } = gaData;

        pushDataLayerEventToGa({
          ...phoneGaData,
          event: "form",
          action: "click",
          name: "onclick",
          region: "main content",
          type: "blur",
          section: "request info ^ phone number",
          text: e.target.value.toLowerCase(),
          component: "form field",
        });
      }}
    />
  );
};

Phone.propTypes = {
  gaData: gaEventPropTypes,
  label: PropTypes.string,
};
Phone.gaName = "phone";
