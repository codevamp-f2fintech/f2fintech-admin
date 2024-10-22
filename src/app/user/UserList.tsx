import type { Metadata } from "next";
import { cookies } from "next/headers";

import UsersPage from "./UsersPage";
import { User } from "@/types/user";

const url = "http://localhost:3001/api/v1/get-users";
const PAGE = 1;
const SIZE = 5;

// Metadata to show in head tag.
export const metadata: Metadata = {
  title: "User Listing",
  description: "Operation Users List",
};

const UserList = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  try {
    const response = await fetch(`${url}?_page=${PAGE}&_limit=${SIZE}`, {
      headers: {
        "x-access-token": token, // Get token from cookies
        "Content-Type": "application/json", // Set the content type if needed
      },
      cache: "no-store",
    });
    const resjson = await response.json();
    const data: User[] = resjson.data;
    return <UsersPage initialData={data} />;
  } catch (error) {
    return <p>Failed to load data.</p>;
  }
};

export default UserList;
