// @ts-check
/* eslint-disable no-unused-vars */

import { Field } from "formik";
import PropTypes from "prop-types";
import React from "react";

import { RfiLabel, RfiError } from "./controls-helpers";

const RfiEmailInput = ({
  name,
  label,
  id = undefined,
  requiredIcon = undefined,
  required = undefined,
  autoFocus = undefined,
  onBlur,
  onChange,
}) => (
  <Field name={name}>
    {({ field, form: { touched, errors }, meta }) => {
      const isError = meta.touched && meta.error;
      return (
        <div className="form-group">
          <RfiLabel
            label={label}
            name={name}
            id={id}
            requiredIcon={requiredIcon}
          />
          <Field
            as="input"
            type="email"
            name={name}
            id={id}
            {...field}
            className="form-control"
            required={required}
            autoFocus={autoFocus}
            onBlur={onBlur}
            onChange={e => {
              field.onChange?.(e);
              onChange?.(e);
            }}
          />
          <RfiError isError={!!isError} metaError={meta.error} />
        </div>
      );
    }}
  </Field>
);

RfiEmailInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  requiredIcon: PropTypes.bool,
  required: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export { RfiEmailInput };
