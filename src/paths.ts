export const paths = {
  home: "/",
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    resetPassword: "/auth/reset-password",
  },
  dashboard: {
    overview: "/dashboard",
    customers: "/user",
  },
  errors: { notFound: "/errors/not-found" },
} as const;
