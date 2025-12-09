
import * as Yup from "yup";

// Regular expression for validating email addresses
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const UserSchema = Yup.object().shape({
    username: Yup
        .string()
        .min(2, "Name is too short!")
        .max(30, "Name is too long!")
        .required("This Field is required"),
    email: Yup
        .string()
        .matches(emailRegExp, "Email address is not valid")
        .required("This field is required"),
    password: Yup.string()
        .min(8, 'Password Must Be 8 Characters Long')
        .matches(/[A-Z]/, 'Password Must Contain At Least 1 Uppercase Letter')
        .matches(/[a-z]/, 'Password Must Contain At Least 1 Lowercase Letter')
        .matches(/[0-9]/, 'Password Must Contain At Least 1 Number')
        .matches(/[^\w]/, 'Password Must Contain At Least 1 Special Character')
        .required("This Field is Required"),
    role: Yup
        .string()
        .required("This field is required"),
    gender: Yup.string(),

    companyId: Yup.string()
        .when( '$isSuperAdminCreate', {
            is: true,
            then: ( schema ) => schema.required( 'Company is required' ),
            otherwise: ( schema ) => schema.notRequired()
        } )
});

export default UserSchema;
