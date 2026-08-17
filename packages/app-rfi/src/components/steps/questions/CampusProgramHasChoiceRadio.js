import React from "react";

import { gaEventPropTypes, trackGAEvent } from "@asu/shared";
import { KEY } from "../../../core/utils/constants";
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

CampusProgramHasChoiceRadio.propTypes = {
  gaData: gaEventPropTypes,
};

CampusProgramHasChoiceRadio.gaName = "campus_program_has_choice";
