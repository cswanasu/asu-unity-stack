import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";

import { variants } from "../../components/appVariants";
import { CertInfo } from "../../components/steps/CertInfo";
import { Success } from "../../components/steps/Success";
import { KEY } from "./constants";
import { fetchDegreesData } from "./fetchPrograms";
import { rfiSubmit } from "./submission-helpers";

const defaultVariant = "rfiVariant2";

const gradPropToFormValue = type => {
  if (type === KEY.GRADUATE) {
    return KEY.READMISSION;
  }
  if (type === KEY.UNDERGRAD) {
    return KEY.FRESHMAN;
  }
  return undefined;
};

const getLockedCampusChoice = props => {
  if (props.variant !== KEY.VARIANT3) {
    return undefined;
  }

  if (
    props.setInitialValueCampusType === KEY.GROUND ||
    props.setInitialValueCampusType === KEY.ONLINE
  ) {
    return props.setInitialValueCampusType;
  }

  return undefined;
};

export const betterPropNames = props => ({
  filterByCampusCode: props.actualCampus,
  filterByCollegeCode: props.college,
  filterByDepartmentCode: props.department,
  setValuePOI: props.programOfInterest,
  setInitialValueCampusType: props.campus,
  setInitialValueAOI: props.areaOfInterest,
  setInitialValueGradType: gradPropToFormValue(props.studentType),
  ...props,
});

const getInitialValues = props => ({
  Campus: props.setInitialValueCampusType,
  CampusProgramHasChoice: getLockedCampusChoice(props),
  CareerAndStudentType: props.setInitialValueGradType,
  Interest1: props.setInitialValueAOI,
  Interest2: props.setValuePOI,
  EmailAddress: undefined,
  FirstName: undefined,
  LastName: undefined,
  Phone: undefined,
  ZipCode: undefined,
  EntryTerm: undefined,
  GdprConsent: false,
  CitizenshipCountry: undefined,
  CitizenshipCountryName: undefined,
  // Street1: undefined,
  // City: undefined,
  // State: props.stateProvince,
  Country: props.country,
  Zip: undefined,
  // BirthDate: undefined,
  MilitaryStatus: "None",
  // Comments: undefined,
  // Email: undefined,
});

/**
 * @param {import("../types/rfi-types").RFIProps} props
 * @returns {}
 */
export const useRfiState = props => {
  const {
    variant,
    test,
    dataSourceDegreeSearch,
    dataSourceAsuOnline,
    filterByDepartmentCode,
    filterByCollegeCode,
    filterByCampusCode,
    submissionUrl,
    successRedirectUrl,
    isCertMinor,
  } = props;
  const [loaded, setLoaded] = useState(false);
  const [forceUpdatedPlan, setForceUpdatedPlan] = useState();
  const [campusProgramHasChoice, setCampusProgramHasChoice] = useState();
  const [stepNumber, setStepNumber] = useState(0);
  const steps = variants[variant] || variants[defaultVariant];
  const [snapshot, setSnapshot] = useState(getInitialValues(props));

  const step = steps[stepNumber] || steps[0]; // catch Storybook edge case
  const totalSteps = steps.length;
  const isLastStep = stepNumber === totalSteps - 1;

  // For VARIANT3, we only submit the form if the user is on the last step or if they are on the first step and have selected "Online" for CampusProgramHasChoice. Otherwise, we allow them to go to the next step without submitting.
  const shouldSubmitCurrentStep = values =>
    isLastStep ||
    (variant === KEY.VARIANT3 &&
      stepNumber === 0 &&
      values.CampusProgramHasChoice === KEY.ONLINE);

  const getSubmitValues = values => {
    const selectedCampus = values.CampusProgramHasChoice || values.Campus;

    if (variant === KEY.VARIANT3 && selectedCampus === KEY.ONLINE) {
      return {
        ...values,
        Interest2: forceUpdatedPlan || values.Interest2,
        GdprConsent: true,
      };
    }

    return values;
  };

  const [degreeDataList, setDegreeDataList] = useState([]);
  const [certMinorEmail, setCertMinorEmail] = useState("");
  const [degreeData, setDegreeData] = useState({});
  const [success, setSuccess] = useState();
  const [rfiSubmitting, setRfiSubmitting] = useState(false);

  const goNext = values => {
    setSnapshot(values);
    setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
  };

  // The focus was triggering dataLayer event for the first name field.
  // const handleBack = () => {
  //   // setSnapshot(values);
  //   setStepNumber(Math.max(stepNumber - 1, 0));
  //   setTimeout(() => {
  //     // Try to find the form with both 'uds-form' and 'uds-rfi' classes
  //     const rfiForm = document.querySelector("form.uds-form.uds-rfi");

  //     if (rfiForm) {
  //       // Find the first input or select element inside the form
  //       const firstField = rfiForm.querySelector("input, select");

  //       if (firstField) {
  //         // Set focus on the found input or select element
  //         firstField.focus();
  //       }
  //     }
  //   }, 0); // Execute after current call stack is cleared (non-blocking)
  // };
  const handleBack = () => {
    setStepNumber(Math.max(stepNumber - 1, 0));
  };

  const handleStepValidate = values => {
    const result = step.props.validate
      ? step.props.validate(values, props)
      : {};
    return result;
  };

  const handleSubmit = async (values, bag) => {
    if (step.props.onSubmit) {
      await step.props.onSubmit(values, bag);
    }
    if (shouldSubmitCurrentStep(values)) {
      const submitValues = getSubmitValues(values);

      setRfiSubmitting(true);

      rfiSubmit(
        submitValues,
        submissionUrl,
        test,
        response => {
          if (variant !== KEY.VARIANT3) {
            setRfiSubmitting(false);
          }

          if (variant === KEY.VARIANT3) {
            const serverErrors = response?.errors || response?.fieldErrors || {};
            const hasServerErrors = Object.keys(serverErrors).length > 0;

            if (hasServerErrors) {
              setRfiSubmitting(false);
              bag.setErrors(serverErrors);

              Object.keys(serverErrors).forEach(fieldName => {
                bag.setFieldTouched(fieldName, true, false);
              });

              if (serverErrors.EmailAddress || serverErrors.Phone) {
                setStepNumber(0);
              }

              return;
            }

            const submissionSucceeded =
              response?.success === true || response?.status === "success";

            const redirectUrl = response?.redirectUrl || successRedirectUrl;

            if (submissionSucceeded && redirectUrl) {
              setTimeout(() => {
                window.location.assign(redirectUrl);
              }, 2000);
            } else {
              setRfiSubmitting(false);
            }

            return;
          }

          setSuccess(true);
        },
        {
          keepCountry: variant === KEY.VARIANT3,
          keepCitizenshipCountry:
            variant === KEY.VARIANT3 &&
            formik.values.CampusProgramHasChoice !== KEY.ONLINE,
          degreeData,
          degreeDataList,
          isCertMinor,
          waitForSubmitSuccess: variant === KEY.VARIANT3,
        }
      );

      return;
    }

    bag.setTouched({});

    goNext(values);
  };

  const formik = useFormik({
    initialValues: snapshot,
    validate: handleStepValidate,
    onSubmit: handleSubmit,
    validationSchema: Yup.object(step.props.validationSchema),
  });

  const isSubmitStep = shouldSubmitCurrentStep(formik.values);

  useEffect(() => {
    // Fetch the selected acadPlan
    const fetchData = async () => {
      let Interest2 = props.programOfInterest || formik.values.Interest2;
      Interest2 = Interest2 === KEY.FALSE_EMPTY ? undefined : Interest2;

      const interest2ForLookup =
        variant === KEY.VARIANT3 && Interest2?.includes("-")
          ? Interest2.split("-").pop()
          : Interest2;

      if (Interest2) {
        fetchDegreesData({
          dataSourceDegreeSearch,
          dataSourceAsuOnline,
          CareerAndStudentType: formik.values.CareerAndStudentType,
          Campus: formik.values.Campus,
          CampusProgramHasChoice: formik.values.CampusProgramHasChoice,
          Interest2: interest2ForLookup,
          variant,
        }).then(([response, data]) => {
          if (response === "Error") {
            // eslint-disable-next-line no-console
            console.error(data);
            return;
          }

          if (test) {
            // @ts-ignore
            console.log(data[0]);
          }

          const { emailAddr, planType } = data[0];
          setDegreeData(data[0]);
          if (emailAddr) {
            setCertMinorEmail(emailAddr);
          }
          setLoaded(true);
        });
      } else {
        setLoaded(true);
      }
    };

    fetchData();
  }, [formik.values.Interest2]);

  useEffect(() => {
    // Fetch List of acadPlans
    const fetchData = async () => {
      fetchDegreesData({
        dataSourceDegreeSearch,
        dataSourceAsuOnline,
        filterByDepartmentCode,
        filterByCollegeCode,
        filterByCampusCode:
          variant === KEY.VARIANT3 &&
          formik.values.CampusProgramHasChoice === KEY.ONLINE
            ? KEY.ONLINE
            : filterByCampusCode,
        Campus: formik.values.Campus,
        CampusProgramHasChoice: formik.values.CampusProgramHasChoice,
        CareerAndStudentType: formik.values.CareerAndStudentType,
        variant,
      }).then(([response, data]) => {
        if (response === "Error") {
          // eslint-disable-next-line no-console
          console.error(data);
          return;
        }
        if (test) {
          // @ts-ignore
          console.log(data);
        }
        setDegreeDataList(data);

        if (
          formik.values.Interest2 &&
          formik.values.Interest2 !== KEY.FALSE_EMPTY
        ) {
          // const selectedDegree = data.find(
          //   plan =>
          //     plan.acadPlanCode === formik.values.Interest2 || // check for PLAN pattern
          //     plan.acadCode === formik.values.Interest2 // check for PROGRAM-PLAN pattern
          // );
          // if (selectedDegree?.acadPlanKey) {
          //   setForceUpdatedPlan(selectedDegree.acadPlanKey);
          // }

          const selectedProgramCode = formik.values.Interest2;

          const selectedDegree = data.find(
            plan =>
              plan.acadPlanKey === selectedProgramCode ||
              plan.acadCode === selectedProgramCode ||
              plan.acadPlanCode === selectedProgramCode ||
              plan.acadPlanKey?.endsWith(`-${selectedProgramCode}`) ||
              plan.acadCode?.endsWith(`-${selectedProgramCode}`)
          );

          if (selectedDegree?.acadPlanKey) {
            setForceUpdatedPlan(selectedDegree.acadPlanKey);
          }



        }
      });
    };

    if (loaded) {
      fetchData();
    }
  }, [
    loaded,
    formik.values.CampusProgramHasChoice,
    formik.values.Campus,
    formik.values.CareerAndStudentType,
    filterByDepartmentCode,
    filterByCollegeCode,
    filterByCampusCode,
  ]);

  const returnObject = {
    forceUpdatedPlan,
    campusProgramHasChoice,
    setCampusProgramHasChoice,
    degreeDataList,
    degreeData,
    showForm: true,
    showStepButtons: true,
    props,
    formik,
    handleBack,
    rfiSubmitting,
    isSubmitStep,
    step,
    totalSteps,
    stepNumber,
  };

  // ERFI-159 Do not render if a programOfInterest prop has rfiDisplay = false
  // 'showForm' will allow the root '/AsuRfi/index.js` to exit before rendering
  if (props.programOfInterest && degreeData.rfiDisplay === false) {
    returnObject.showForm = false;
    return returnObject;
  }

  // ERFI-58 Always show CertInfo page if prop is true
  if (isCertMinor) {
    returnObject.showStepButtons = false;
    returnObject.step = (
      <CertInfo certMinorEmail={certMinorEmail} successMsg={props.successMsg} />
    );
    return returnObject;
  }

  if (success) {
    returnObject.showStepButtons = false;
    returnObject.step = <Success />;

    return returnObject;
  }

  return returnObject;
};
