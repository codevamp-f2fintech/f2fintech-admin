import * as yup from "yup";

const phoneRegExp = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const validationSchema = yup.object().shape( {
    title: yup.string()
        .min( 2, 'Loan Provider Name is Too Short!' )
        .max( 50, 'Loan Provider Name is Too Long!' )
        .required( "This Field is Required" ),
    short_description: yup.string()
        .required( "This Field is Required" ),
    long_description: yup.string()
        .required( "This Field is Required" ),
    charges: yup.string()
        .required( "This Field is Required" ),
    minimum_kyc: yup.string()
        .required( "This Field is Required" ),
    document_required: yup.string()
        .required( "This Field is Required" ),
    interest_rate: yup.number()
        .min( 0, 'Interest Rate cannot be negative' )
        .required( "This Field is Required" ),
    max_amount: yup.number()
        .min( 1, 'Maximum Loan Amount must be greater than 0' )
        .required( "This Field is Required" ),
    min_amount: yup.number()
        .min( 1, 'Minimum Loan Amount must be greater than 0' )
        .required( "This Field is Required" ),
    max_tenure: yup.number()
        .min( 1, 'Max Tenure must be greater than 0' )
        .required( "This Field is Required" ),
    country: yup.string()
        .required( "This Field is Required" ),
    home_image: yup.string()
        .required( "Image is required" ),
} );

export default validationSchema;
