"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Formik, Field } from "formik";
import {
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
  Box,
  useMediaQuery,
  Dialog,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Wc,
  SupervisorAccount,
  Business
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

import Toast from "../components/common/Toast";
import Loader from "../components/common/Loader";
import userValidation from "./Validation.jsx";

import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { UserAPI } from "@/apis/UserAPI";
import { Utility } from "@/utils";
import { User } from "@/types/user";
import { getCompanyId, getUserRole } from "@/utils/cookies";

interface UserFormValues {
  username: string;
  email: string;
  password: string;
  gender: string;
  role: string;
  id?: string | number;
  // companyId?: string;
}

interface Company {
  id: number;
  name: string;
  email: string;
  // companyId: string;
}

interface FormComponentProps {
  openDialog: boolean;
  setOpenDialog: ( value: boolean ) => void;
  updatePassword: boolean;
  setUpdatePassword: ( value: boolean ) => void;
  userId: string | null;
  refetch: () => Promise<any>;
  setUsers: ( users: User ) => void;
}

const initialValues: UserFormValues = {
  username: "",
  email: "",
  password: "",
  gender: "",
  role: "",
  // companyId: "",
};

const UserForm: React.FC<FormComponentProps> = ( {
  openDialog,
  setOpenDialog,
  updatePassword,
  setUpdatePassword,
  userId,
  refetch,
  setUsers
} ) => {
  const [ title, setTitle ] = useState<"Create" | "Edit">( "Create" );
  const [ loading, setLoading ] = useState<boolean>( false );
  const [ formValues, setFormValues ] = useState<UserFormValues>( initialValues );
  const [ showPassword, setShowPassword ] = useState<boolean>( false );
  const [ companies, setCompanies ] = useState<Company[]>( [] );
  const [ loadingCompanies, setLoadingCompanies ] = useState<boolean>( false );
  const pwFieldRef = useRef<HTMLInputElement | null>( null );
  const [ currentUserRole, setCurrentUserRole ] = useState<string>( "" );
  console.log( "Current formValues:", formValues );

  const theme = useTheme();
  const fullScreen = useMediaQuery( theme.breakpoints.down( "md" ) );
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const { toastAndNavigate } = Utility();
  const isMobile = useMediaQuery( "(max-width:480px)" );

  // Fetch companies when form opens (only for super admin creating users)
  const fetchCompanies = useCallback( async () => {
    if ( currentUserRole === 'super admin' && openDialog && !userId )
    {
      try
      {
        setLoadingCompanies( true );
        const response = await UserAPI.getAllCompanies( 1, 100 );
        if ( response.data?.data?.results )
        {
          setCompanies( response.data.data.results );
        }
      } catch ( error: any )
      {
        console.error( "Error fetching companies:", error );
        toastAndNavigate( dispatch, true, "error", "Failed to load companies" );
      } finally
      {
        setLoadingCompanies( false );
      }
    }
  }, [ currentUserRole, openDialog, userId, dispatch, toastAndNavigate ] );

  useEffect( () => {
    const loadCompanies = async () => {
      if ( currentUserRole === "super admin" && openDialog && !userId )
      {
        try
        {
          setLoadingCompanies( true );
          const response = await UserAPI.getAllCompanies( 1, 100 );

          const companyList = response?.data?.data?.results || [];
          setCompanies( companyList );
        } catch ( error )
        {
          toastAndNavigate( dispatch, true, "error", "Failed to load companies" );
        } finally
        {
          setLoadingCompanies( false );
        }
      }
    };

    loadCompanies();
  }, [ openDialog, currentUserRole, userId ] );


  const handleTogglePassword = useCallback( () => {
    setShowPassword( ( prev ) => !prev );
  }, [] );

  const handleDialogClose = () => {
    setOpenDialog( false );
  };

  // Initialize user role on component mount
  useEffect( () => {
    const role = getUserRole();
    setCurrentUserRole( role || "" );
  }, [] );

  const handleUpdatePassword = useCallback( () => {
    if ( !updatePassword )
    {
      setFormValues( ( prev ) => ( {
        ...prev,
        password: "",
      } ) );
      pwFieldRef?.current?.focus();
    }
    setUpdatePassword( !updatePassword );
  }, [ updatePassword ] );

  const createUser = useCallback( async ( values: UserFormValues ) => {
    setLoading( true );
    try
    {
      // Get companyId - different logic based on user role
      let companyIdToUse: string;

      if ( currentUserRole === 'super admin' )
      // {
      //   // Super admin selects company from dropdown
      //   if ( !values.companyId )
      //   {
      //     toastAndNavigate( dispatch, true, "error", "Please select a company" );
      //     setLoading( false );
      //     return;
      //   }
      //   companyIdToUse = values.companyId;
      // } else
      {
        // Other admins/users use their own company
        const companyId = getCompanyId();
        if ( !companyId )
        {
          toastAndNavigate( dispatch, true, "error", "Company ID not found" );
          setLoading( false );
          return;
        }
        companyIdToUse = companyId;
      }

      // Include companyId in the payload
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        gender: values.gender,
        role: values.role,
        // companyId is NOT included here
      };

      await UserAPI.create( payload );
      toastAndNavigate( dispatch, true, "success", "User Created Successfully" );
      setTimeout( async () => {
        handleDialogClose();
        const updatedUsers = await refetch();
        if ( updatedUsers )
        {
          dispatch( setUsers( updatedUsers.data ) );
        }
      }, 2200 );
    } catch ( error: any )
    {
      const errorMessage = error?.response?.data?.message || "Error creating user, please try again.";
      toastAndNavigate( dispatch, true, "error", errorMessage );
      setTimeout( () => {
        handleDialogClose();
      }, 2200 );
    } finally
    {
      setLoading( false );
    }
  }, [ currentUserRole ] );

  useEffect( () => {
    if ( userId )
    {
      setTitle( "Edit" );
      populateUserData( userId );
    } else
    {
      // When creating new user, set default role based on current user
      const defaultValues = {
        ...initialValues,
        role: currentUserRole === "admin" ? "sub admin" : ""
      };
      setFormValues( defaultValues );
      setTitle( "Create" );
    }
  }, [ userId, openDialog, currentUserRole ] );

  const populateUserData = useCallback( async ( id: string | number ) => {
    setLoading( true );
    try
    {
      const response = await UserAPI.getUserProfile( id );
      setFormValues( response.data?.data );
    } catch ( err: any )
    {
      const errorMessage = err?.response?.data?.msg || "An Error Occurred";
      toastAndNavigate( dispatch, true, "error", errorMessage );
      setTimeout( () => {
        handleDialogClose();
      }, 2200 );
    } finally
    {
      setLoading( false );
    }
  }, [] );

  const updateUser = useCallback( async ( values: any ) => {
    setLoading( true );
    try
    {
      const payload = { ...values };
      if ( !updatePassword )
      {
        delete payload.password;
      }
      await UserAPI.updateUserProfile( payload );
      setLoading( false );
      toastAndNavigate( dispatch, true, "info", "Successfully Updated" );
      setTimeout( async () => {
        handleDialogClose();
        const updatedUsers = await refetch();
        if ( updatedUsers )
        {
          dispatch( setUsers( updatedUsers.data ) );
        }
      }, 2200 );
    } catch ( err: any )
    {
      setLoading( false );
      const errorMessage = err?.response?.data?.message || "Error Occurred. Please Try Again";
      toastAndNavigate( dispatch, true, "error", errorMessage );
      setTimeout( () => {
        handleDialogClose();
      }, 2200 );
    } finally
    {
      setLoading( false );
    }
  }, [ updatePassword ] );

  return (
    <Dialog
      fullScreen={fullScreen}
      open={openDialog}
      onClose={handleDialogClose}
      aria-labelledby="responsive-dialog-title"
      maxWidth="md"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
          >
            {title} User
          </Typography>
          {userId && (
            <Button
              type="button"
              color={updatePassword ? "error" : "secondary"}
              variant="contained"
              onClick={handleUpdatePassword}
            >
              {updatePassword ? "Cancel Update Password" : "Update Password"}
            </Button>
          )}
        </Box>
        <Formik
          initialValues={formValues}
          enableReinitialize
          validationSchema={userValidation}
          onSubmit={( values ) => {
            values.id ? updateUser( values ) : createUser( values );
          }}
        >
          {( {
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
            dirty,
          } ) => (

            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(2, minmax(0, 1fr))"
              >
                <Field
                  as={TextField}
                  autoFocus
                  fullWidth
                  label="*User Name"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "black" }} />
                      </InputAdornment>
                    ),
                    style: { color: "black", fontSize: "15px" },
                  }}
                  InputLabelProps={{ style: { color: "black" } }}
                  error={touched.username && Boolean( errors.username )}
                  helperText={touched.username && errors.username}
                />
                <Field
                  as={TextField}
                  fullWidth
                  label="*Email Address"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "black" }} />
                      </InputAdornment>
                    ),
                    style: { color: "black", fontSize: "15px" },
                  }}
                  InputLabelProps={{ style: { color: "black" } }}
                  error={touched.email && Boolean( errors.email )}
                  helperText={touched.email && errors.email}
                />
                {( title === "Create" || updatePassword ) && (
                  <Field
                    as={TextField}
                    fullWidth
                    name="password"
                    label="*Password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    inputRef={pwFieldRef}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{ color: "black" }}
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.password && Boolean( errors.password )}
                    helperText={touched.password && errors.password}
                  />
                )}
                <Field
                  as={TextField}
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Wc sx={{ color: "black" }} />
                      </InputAdornment>
                    ),
                    style: { color: "black", fontSize: "15px" },
                  }}
                  InputLabelProps={{ style: { color: "black" } }}
                  error={touched.gender && Boolean( errors.gender )}
                  helperText={touched.gender && errors.gender}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Field>
                <Field
                  as={TextField}
                  select
                  fullWidth
                  label="Role"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SupervisorAccount sx={{ color: "black" }} />
                      </InputAdornment>
                    ),
                    style: { color: "black", fontSize: "15px" },
                  }}
                  InputLabelProps={{ style: { color: "black" } }}
                  error={touched.role && Boolean( errors.role )}
                  helperText={touched.role && errors.role}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {currentUserRole === "super admin" && ( <MenuItem value="admin">Admin</MenuItem> )}
                  {currentUserRole === "admin" && ( <MenuItem value="sub admin">Sub Admin</MenuItem> )}
                  {currentUserRole === "admin" && ( <MenuItem value="sales">Sales</MenuItem> )}
                  {currentUserRole === "admin" && ( <MenuItem value="operations">Operations</MenuItem> )}
                  {currentUserRole === "admin" && ( <MenuItem value="credit">Credit</MenuItem> )}
                </Field>


                {/* Company selection - only shown for super admin when creating new user */}
                {/* {currentUserRole === 'super admin' && !userId && (
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    label="*Company"
                    name="companyId"
                    value={values.companyId}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.companyId && Boolean( errors.companyId )}
                    helperText={touched.companyId && errors.companyId}
                    disabled={loadingCompanies}
                  >
                    <MenuItem value="">
                      <em>Select a company</em>
                    </MenuItem>
                    {loadingCompanies ? (
                      <MenuItem disabled>Loading companies...</MenuItem>
                    ) : (
                      companies.map( ( company ) => (
                        <MenuItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </MenuItem>
                      ) )
                    )}
                  </Field>
                )} */}
              </Box>
              <Box display="flex" justifyContent="center" p="20px" gap={2}>
                <Button
                  color="error"
                  variant="contained"
                  sx={{ flex: 1 }}
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  sx={{ flex: 1 }}
                  disabled={!dirty || isSubmitting || loading}
                  color={title === "Edit" ? "info" : "success"}
                  variant="contained"
                >
                  {loading ? "Processing..." : "Submit"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
        {loading ? <Loader /> : null}
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </Box>
    </Dialog>
  );
};

export default UserForm;