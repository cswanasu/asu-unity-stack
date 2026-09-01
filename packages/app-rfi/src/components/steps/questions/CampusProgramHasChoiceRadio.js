import React from "react";

import { KEY } from "../../../core/utils/constants";
import { gaEventPropTypes } from "@asu/shared";
import { pushDataLayerEventToGa } from "../../../core/utils/google-analytics";
import { RfiRadioGroup } from "../../controls";
import { useRfiContext } from "../../../core/utils/rfiContext";

export const CampusProgramHasChoiceRadio = ({ gaData }) => {
  const label = "How would you like to attend?";
  const name = "CampusProgramHasChoice";

  const { campusType } = useRfiContext();

  const isCampusLocked =
    campusType === KEY.GROUND || campusType === KEY.ONLINE;

  if (isCampusLocked) {
    return null;
  }

  const options = [
    {
      key: "1",
      value: KEY.GROUND,
      text: "In-person",
    },
    {
      key: "2",
      value: KEY.ONLINE,
      text: "Fully online",
    },
  ];

  return (
    <RfiRadioGroup
      label={label}
      id={name}
      name={name}
      options={options}
      onBlur={e => {
        const selectedOption = options.find(option => option.value === e.target.value);

        pushDataLayerEventToGa({
          event: "select",
          action: "click",
          name: "onclick",
          type: "checkbox",
          region: "main content",
          section: "request info ^ campus",
          text: selectedOption?.text === "Fully online" ? "online" : "in-person",
          component: "radio button",
        });
      }}
    />
  );
};

CampusProgramHasChoiceRadio.propTypes = {
  gaData: gaEventPropTypes,
};

CampusProgramHasChoiceRadio.gaName = "campus_program_has_choice";
