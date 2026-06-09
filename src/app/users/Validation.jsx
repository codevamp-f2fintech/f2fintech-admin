
import * as Yup from "yup";

const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const phoneRegExp = /^[6-9]\d{9}$/;

const UserSchema = Yup.object().shape({
    username: Yup
        .string()
        .trim()
        .min(2, "Name is too short!")
        .max(30, "Name is too long!")
        .lowercase()
        .required("Username is required"),

    email: Yup
        .string()
        .trim()
        .matches(emailRegExp, "Email address is not valid")
        .lowercase()
        .required("Email is required"),

    password: Yup.string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain at least 1 uppercase letter")
        .matches(/[a-z]/, "Must contain at least 1 lowercase letter")
        .matches(/[0-9]/, "Must contain at least 1 number")
        .matches(/[^\w]/, "Must contain at least 1 special character")
        .required("Password is required"),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Please confirm your password"),

    designation: Yup
        .string()
        .trim()
        .min(2, "Designation is too short")
        .lowercase()
        .required("Designation is required"),

    number: Yup
        .string()
        .trim()
        .matches(phoneRegExp, "Enter a valid 10-digit mobile number")
        .required("Contact number is required"),

    gender: Yup.string(),

    role: Yup
        .string()
        .required("Role is required"),
});

export const EditUserSchema = Yup.object().shape({
    username: UserSchema.fields.username,
    email: UserSchema.fields.email,
    designation: UserSchema.fields.designation,
    number: UserSchema.fields.number,
    gender: UserSchema.fields.gender,
    role: UserSchema.fields.role,
});

export default UserSchema;
