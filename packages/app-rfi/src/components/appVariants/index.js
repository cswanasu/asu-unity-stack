import React from "react";

import {
  Campus,
  CampusProgramHasChoice,
  CampusProgramHasChoiceRadio,
  CareerAndStudentType,
  Country,
  EmailAddress,
  EntryTerm,
  FirstName,
  GdprConsent,
  Interest1,
  Interest2,
  LastName,
  MilitaryStatus,
  OnlineConsentText,
  Phone,
  ZipCode,
  validation,
} from "../steps/questions";
import { RfiRequiredIndicator } from "../controls/controls-helpers";

const Step = ({ children }) => children;

const gaData = {
  event: "select",
  action: "click",
  name: "onclick",
  region: "main content",
  section: "request information",
  component: "...",
};

const gaData1Of1 = {
  ...gaData,
  component: "step 1 of 1",
};

const gaData1Of2 = {
  ...gaData,
  component: "step 1 of 2",
};

const gaData2Of2 = {
  ...gaData,
  component: "step 2 of 2",
};

const variants = {
  rfiVariant1: [
    <Step validationSchema={validation}>
      <h2>Request information</h2>
      <p className="rfi-step1-intro">
        To learn more about ASU or a specific program, fill out the form below
        then check your email.
      </p>
      <p>
        <RfiRequiredIndicator required={true} />
        Indicates required field
      </p>
      <br />
      <Campus gaData={gaData1Of1} />
      <CareerAndStudentType gaData={gaData1Of1} />
      <Interest1 gaData={gaData1Of1} />
      <Interest2 gaData={gaData1Of1} />
      <CampusProgramHasChoice gaData={gaData1Of1} />
      <EmailAddress gaData={gaData1Of1} />
      <FirstName gaData={gaData1Of1} />
      <LastName gaData={gaData1Of1} />
      <Phone gaData={gaData1Of1} />
      <ZipCode gaData={gaData1Of1} />
      <EntryTerm gaData={gaData1Of1} />
      <MilitaryStatus gaData={gaData1Of1} />
      <GdprConsent gaData={gaData1Of1} />
    </Step>,
  ],
  rfiVariant2: [
    <Step
      section="Request information"
      validationSchema={{
        Campus: validation.Campus,
        CareerAndStudentType: validation.CareerAndStudentType,
        Interest1: validation.Interest1,
        Interest2: validation.Interest2,
        CampusProgramHasChoice: validation.CampusProgramHasChoice,
      }}
    >
      <div className={"h4"}>Step 1 of 2</div>
      <h2>Request information</h2>
      <p className="rfi-step1-intro">
        To learn more about ASU or a specific program, fill out the form below
        then check your email.
      </p>
      <p>
        <RfiRequiredIndicator required={true} />
        Indicates required field
      </p>
      <br />
      <Campus gaData={gaData1Of2} />
      <CareerAndStudentType gaData={gaData1Of2} />
      <Interest1 gaData={gaData1Of2} />
      <Interest2 gaData={gaData1Of2} />
      <CampusProgramHasChoice gaData={gaData1Of2} />
    </Step>,
    <Step
      section="About me"
      validationSchema={{
        EmailAddress: validation.EmailAddress,
        FirstName: validation.FirstName,
        LastName: validation.LastName,
        Phone: validation.Phone,
        ZipCode: validation.ZipCode,
        Country: validation.Country,
        EntryTerm: validation.EntryTerm,
        MilitaryStatus: validation.MilitaryStatus,
        GdprConsent: validation.GdprConsent,
      }}
    >
      <div className={"h4"}>Step 2 of 2</div>
      <h2>About me</h2>
      <EmailAddress autoFocus gaData={gaData2Of2} />
      <FirstName gaData={gaData2Of2} />
      <LastName gaData={gaData2Of2} />
      <Phone gaData={gaData2Of2} />
      <ZipCode gaData={gaData2Of2} />
      <EntryTerm gaData={gaData2Of2} />
      <MilitaryStatus gaData={gaData2Of2} />
      <GdprConsent gaData={gaData2Of2} />
    </Step>,
  ],
  rfiVariant3: [
    <Step
      section="Request information"
      validationSchema={{
        FirstName: validation.FirstName,
        LastName: validation.LastName,
        EmailAddress: validation.EmailAddress,
        Phone: validation.Phone,
        CampusProgramHasChoice: validation.CampusProgramHasChoice,
      }}
    >
      <h2 className="h3">Get more details about this degree</h2>
      <p className="rfi-step1-intro">
        Have questions about this degree? Fill out this form and we’ll get in touch.
      </p>
      <FirstName gaData={gaData1Of2} />
      <LastName gaData={gaData1Of2} />
      <EmailAddress gaData={gaData1Of2} label="Email" />
      <Phone gaData={gaData1Of2} label="Phone number" />
      <CampusProgramHasChoiceRadio gaData={gaData1Of2} />
      <OnlineConsentText />
    </Step>,

    <Step
      section="About me"
      validationSchema={{
        CareerAndStudentType: validation.CareerAndStudentType,
        EntryTerm: validation.EntryTerm,
        ZipCode: validation.ZipCode,
        Country: validation.Country,
        MilitaryStatus: validation.MilitaryStatus,
        GdprConsent: validation.GdprConsent,
      }}
    >
      <div className={"h4"}>Step 2 of 2</div>
      <CareerAndStudentType gaData={gaData2Of2} label="Student status" />
      <EntryTerm gaData={gaData2Of2} />
      <ZipCode gaData={gaData2Of2} />
      <Country gaData={gaData2Of2} label="Country" name="Country" />
      <MilitaryStatus gaData={gaData2Of2} />
      <GdprConsent gaData={gaData2Of2} />
    </Step>,
  ],
};

export { variants };
