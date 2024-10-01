import type { Metadata } from "next";

import UsersPage from "./UsersPage";

import { User } from "@/types/user";
import { Utility } from "@/utils";

const url = process.env.NEXT_PUBLIC_API_URL + "/user/get";
const PAGE = 1;
const SIZE = 5;

// Metadata to show in head tag.
export const metadata: Metadata = {
  title: "User Listing",
  description: "Operation Users List",
};

const UserList = async () => {
  const { fetchData } = Utility();

  try {
    const response: any = await fetchData(url, PAGE, SIZE);
    const data: User[] = response.data;
    console.log("responsedata", response);
    return <UsersPage initialData={data} />;
  } catch (error) {
    console.log("Error fetching data:", error);
    return <p>Failed to load data.</p>;
  }
};

export default UserList;
