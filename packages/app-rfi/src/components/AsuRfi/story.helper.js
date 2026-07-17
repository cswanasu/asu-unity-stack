// @ts-check
/* eslint react/jsx-props-no-spreading: "off" */
import React from "react";

import { AsuRfi } from "..";

import { KEY } from "../../core/utils/constants";

/** @type {import("../../core/types/rfi-types").RFIProps} */
export const defaultArgs = {
  variant: KEY.VARIANT1,
  appPathFolder: ".", // Optional
  campus: undefined, // ONLNE, GROUND, NOPREF
  actualCampus: undefined, // TEMPE, DTPHX, POLY, WEST, ONLNE...
  college: undefined,
  department: undefined,
  studentType: undefined, // graduate, undergrad
  areaOfInterest: undefined,
  areaOfInterestOptional: false,
  programOfInterest: undefined,
  programOfInterestOptional: false,
  isCertMinor: false,
  country: undefined,
  stateProvince: undefined, // Only US states or CA provinces - use full name.
  successMsg: undefined,
  successMsgs: {
    GROUND: {
      UGRAD: `
    <p>We’re interested in you too! You’ll be receiving more information from us soon. Until then, here are several ways for you to explore ASU degrees and campus environments to see what fits you best.</p>

    <p>Continue to explore the requirements of the degree and plan your transition to ASU.</p>

    <h4>All are welcome at ASU</h4>
    <p>There isn't one right way to be a human, so there definitely isn’t one right way to be a student. Luckily there are many ways to make your ASU experience have meaning and impact. Take this quiz to see what kind of student you’re likely to be, and how you’ll thrive in college.</p>
    <p><a class="btn btn-primary" href="https://admission.asu.edu/persona-quiz">Take the persona quiz</a></p>

    <h4>Find your perfect campus size and feel.</h4>
    <p>ASU is made up of several campuses — each with its own identity, focus and size. Though different in feel and atmosphere, each campus offers you access to the benefits of ASU resources, support, student life and quality academics. Take this quick quiz to find the campus experience that best suits you.</p>
    <p><a class="btn btn-primary" href="https://admission.asu.edu/college-fit-quiz">Take the my ASU fit quiz</a></p>

    <h4>Visit campus and see for yourself</h4>
    <p>We encourage you to plan a visit to campus to see for yourself what Sun Devil life is like. ASU offers year-round campus tours at all five ASU locations to give you a firsthand look at student life.</p>
    <div class="uds-buttons">
      <a class="btn btn-gold" href="https://visit.asu.edu/schedule">Schedule a visit</a>
      <a class="btn btn-gold" href="https://tour.asu.edu">Take a virtual tour</a>
    </div>

    <h4>Take the next step</h4>
    <p>If you’re ready, apply to ASU today. Your admission specialist can help answer any questions you have about the enrollment process or becoming a Sun Devil. If you are an on-campus student, <a href="https://admission.asu.edu/contact/undergraduate">contact your admission representative.</a></p>
    <p><a class="btn btn-gold" href="https://admission.asu.edu/apply">Apply now</a></p>

    <p><strong>It's time to be a Sun Devil!</strong></p>
  `,
      GRAD: `
      <p>{{firstName}},</p>

      <p>We’re excited you’re interested in Arizona State University, and we invite you to take full advantage of the Sun Devil experience. At ASU, we are here to support you as you transform into an accomplished learner, prepared to succeed in your career.</p>

      <p>
        Find out more about your program of interest,
        <a href="{{programUrl}}">{{programTitleCampus}}</a>
      </p>

      <p>
        If you have any questions, don’t hesitate to contact us at
        <a href="mailto:gograd@asu.edu">gograd@asu.edu</a>.
      </p>
    `,
    },
    ONLNE: {
      UGRAD: "<p><strong>CS Test:</strong> Online undergraduate confirmation.</p>",
      GRAD: "<p><strong>CS Test:</strong> Online graduate confirmation.</p>",
    },
  },
  test: false,
  successRedirectUrl: "/storybook-rfi-thank-you",

  dataSourceDegreeSearch: undefined, // "https://degrees.apps.asu.edu/t5/service",
  dataSourceAsuOnline: undefined, // "https://cms.asuonline.asu.edu/lead-submissions-v3.5/programs",
  dataSourceCountriesStates: undefined, // "https://api.myasuplat-dpl.asu.edu/api/codeset/countries",
  submissionUrl: "https://httpbin.org/post", // Should point to host site's API Proxy endpoint so Source value can be added and submitted from backend.
};

/**
 *
 * @param {import("../../core/types/rfi-types").RFIProps} args
 * @returns
 */
export const Template = args => (
  <div className="container-fluid">
    <div className="col col-sm-12 p-3">
      <AsuRfi {...args} />
    </div>
  </div>
);
