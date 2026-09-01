import React, { useEffect, useState } from "react";

import { gaEventPropTypes, trackGAEvent } from "@asu/shared";
import { fetchCountries } from "../../../core/utils/fetchCountries";
import { useRfiContext } from "../../../core/utils/rfiContext";
import { RfiSelect } from "../../controls";
import PropTypes from "prop-types";

// Options
function getCountryOptions(resultsArrayOfObjects) {
  let i = 1;
  // TODO Resolve eslint error when dust settles. Not hurting anything for now.

  const results = resultsArrayOfObjects.map(co => ({
    key: (i += 1).toString(),
    value: co.countryCodeTwoChar,
    text: co.description,
  }));
  return results;
}

const pushCitizenshipCountryDataLayer = ({ gaData, text }) => {
  trackGAEvent({
    ...gaData,
    event: "select",
    type: "select location",
    section: "request info",
    text,
    component: "dropdown",
  });
};

// Component

/**
 * @param {{ gaData: import("@asu/shared").GAEventObject}} props
 */
// export const Country = ({ gaData }) => {
//   const label = "Country of citizenship";
//   const name = "CitizenshipCountry";
export const Country = ({
  gaData,
  label = "Country of citizenship",
  name = "CitizenshipCountry",
}) => {

  const {
    dataSourceCountriesStates,
    formik: { values, setFieldValue },
  } = useRfiContext();

  const [countryOptions, setCountries] = useState([
    {
      key: "1",
      value: "error",
      text: "Load failed. Please try again in 5 minutes.",
    },
  ]);

  // Countries
  useEffect(() => {
    fetchCountries(dataSourceCountriesStates, getCountryOptions).then(data => {
      setCountries(data);

      const selectedCountryCode = (values[name] || "US").toUpperCase();
      const selectedCountry = data.find(
        country => country.value?.toUpperCase() === selectedCountryCode
      );

      if (selectedCountry?.text) {
        setFieldValue("CitizenshipCountryName", selectedCountry.text);
      }
    });
  }, []);

  return (
    <RfiSelect
      label={label}
      id={name}
      name={name}
      options={countryOptions}
      onBlur={e => {
        const selectedCountryName = e.target.selectedOptions[0].innerText;

        setFieldValue("CitizenshipCountryName", selectedCountryName);

        pushCitizenshipCountryDataLayer({
          gaData,
          text: selectedCountryName,
        });
      }}
    />
  );
};

// Country.propTypes = { gaData: gaEventPropTypes };
Country.propTypes = {
  gaData: gaEventPropTypes,
  label: PropTypes.string,
  name: PropTypes.string,
};
Country.gaName = "citizenship_country";
