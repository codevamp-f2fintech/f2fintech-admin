import type { Metadata } from "next";
import { Suspense } from "react";

import UsersPage from "./UsersPage";
import Loader from "../components/common/Loader";

export const metadata: Metadata = {
  title: "User Listing | Admin",
  description: "Operation Users List",
};

const UserList = () => {
  return (
    <Suspense fallback={<Loader />}>
      <UsersPage />
    </Suspense>
  );
};

export default UserList;