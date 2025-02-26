import * as yup from "yup";
import { subYears } from "date-fns"; // To handle date calculations

// Regex patterns
const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// Validation schema
const step1ValidationSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "Name is too short!")
    .max(40, "Name is too long!")
    .matches(/^[a-zA-Z\s]+$/, "Name should only contain letters")
    .required("This field is required"),

  father_name: yup
    .string()
    .min(2, "Name is too short!")
    .max(40, "Name is too long!")
    .matches(/^[a-zA-Z\s]+$/, "Name should only contain letters")
    .required("This field is required"),

  mother_name: yup
    .string()
    .min(2, "Name is too short!")
    .max(40, "Name is too long!")
    .matches(/^[a-zA-Z\s]+$/, "Name should only contain letters")
    .required("This field is required"),

  working_address: yup
    .string()
    .min(10, "Address is too short!")
    .max(240, "Address is too long!")
    // .matches(/^[a-zA-Z\s]+$/, "Address should only contain letters")
    .required("This field is required"),

  permanent_address: yup
    .string()
    .min(10, "Address is too short!")
    .max(240, "Address is too long!")
    // .matches(/^[a-zA-Z\s]+$/, "Address should only contain letters")
    .required("This field is required"),

  current_address: yup
    .string()
    .min(10, "Address is too short!")
    .max(240, "Address is too long!")
    // .matches(/^[a-zA-Z\s]+$/, "Address should only contain letters")
    .required("This field is required"),

  contact: yup
    .string()
    .matches(phoneRegExp, "Contact Number is not valid")
    .required("This field is required"),

  email: yup
    .string()
    .matches(emailRegExp, "Email Address is not valid")
    .required("This field is required"),

  pan: yup
    .string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN Card Detected")
    .required("This field is required"),
  // "PAN must be exactly 10 characters: first 5 letters in uppercase, followed by 4 digits, and ending with 1 letter."

  city: yup
    .string()
    .matches(/^[a-zA-Z\s]+$/, "City name should only contain letters")
    .min(2, "Name is too short")
    .max(30, "Name is too long")
    .required("This field is required"),

  occupation_type: yup.string().required("This field is required"),

  dob: yup
    .date()
    .nullable()
    .typeError("Invalid date format")
    // Ensure the date of birth is not in the future
    .test("not-future", "Invalid age", (value) => {
      return value ? value < new Date() : true;
    })
    // Ensure the user is at least 20 years old
    .max(subYears(new Date(), 20), "You must be at least 20 years old to apply")
    .required("This field is required"),
});

export default step1ValidationSchema;
