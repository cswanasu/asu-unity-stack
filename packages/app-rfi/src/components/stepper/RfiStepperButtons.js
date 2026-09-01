// @ts-check
import PropTypes from "prop-types";
import React from "react";
import { Button } from "reactstrap";

import { trackGAEvent } from "@asu/shared";
import { pushDataLayerEventToGa } from "../../core/utils/google-analytics";

// Note on the spans around the FA i tags below:
// When the host site/app deploys FA such that it replaces the i's with svg
// tags, when React tries to rewrite the DOM we get hit with the error
// "Failed to execute 'removeChild' on 'Node': The node to be removed is not
// a child of this node" ala https://github.com/facebook/react/issues/11538.
// And after reading up more on the issue via the links in this Stackoverflow:
// https://stackoverflow.com/a/48552226/4942751
// The solution I hit on was to wrap the i's with spans so when the DOM
// rewrite happens, the FA switcheroo is happening a layer below the element
// that in this case React is trying to remove.

export const RfiStepperButtons = ({
  stepNumber,
  totalSteps,
  step,
  handleBack,
  rfiSubmitting,
  isSubmitStep,
  formik: { isSubmitting },
}) => {
  return (
    <>
      <nav aria-label="Request information form">
        <div className="d-flex justify-content-between">
          <div>
            {stepNumber > 0 ? (
              <a
                href="#"
                className="rfi-stepper-back-link"
                data-ga="Back"
                data-ga-name="onclick"
                data-ga-event="link"
                data-ga-action="click"
                data-ga-type="internal link"
                data-ga-region="main content"
                data-ga-section="request info"
                onClick={event => {
                  event.preventDefault();

                  handleBack();
                  trackGAEvent({
                    event: "link",
                    action: "click",
                    name: "onclick",
                    type: "internal link",
                    region: "main content",
                    section: "request info",
                    text: "back arrow",
                    component: "button",
                  });
                }}
              >
                <span>
                  <i className="fas fa-arrow-left" aria-hidden="true" />
                </span>{" "}
                Back
              </a>
            ) : null}
          </div>
          <div>
            {/* Note: rfi-button and rfi-button-stepN classes are used by GA */}
            {!isSubmitStep ? (
              <Button
                type="submit"
                className={`btn btn-primary rfi-button-step${stepNumber + 1}`}
                onClick={() =>
                  trackGAEvent({
                    event: "form",
                    action: "click",
                    name: "onclick",
                    type: "click",
                    region: "main content",
                    section: "request info",
                    text: "continue",
                    component: "button",
                  })
                }
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                className="rfi-submit btn btn-primary"
                disabled={!!isSubmitting || rfiSubmitting}
                onClick={() =>
                  pushDataLayerEventToGa({
                    event: "form",
                    action: "click",
                    name: "onclick",
                    type: "click",
                    region: "main content",
                    section: "request info",
                    text: "submit",
                    component: "button",
                  })
                }
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

RfiStepperButtons.propTypes = {
  stepNumber: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  step: PropTypes.shape({
    props: PropTypes.shape({
      section: PropTypes.string,
    }),
  }),
  handleBack: PropTypes.func.isRequired,
  rfiSubmitting: PropTypes.bool.isRequired,
  isSubmitStep: PropTypes.bool,
  formik: PropTypes.shape({
    isSubmitting: PropTypes.bool.isRequired,
  }),
};
