import type { Metadata } from "next";
import { cookies } from "next/headers";

import UsersPage from "./UsersPage";
import { User } from "@/types/user";

const url = `${process.env.NEXT_PUBLIC_API_URL}/get-users`;
const PAGE = 1;
const LIMIT = 5;

// Metadata to show in head tag.
export const metadata: Metadata = {
  title: "User Listing",
  description: "Operation Users List",
};

const UserList = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  try {
    const response = await fetch(`${url}?page=${PAGE}&limit=${LIMIT}`, {
      method: "GET",
      headers: {
        "x-access-token": token || '', // Get token from cookies
        "Content-Type": "application/json", // Set the content type if needed
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Failed to fetch users: ${response.statusText}`);
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    const resjson = await response.json();
    const data: User = resjson;
    return <UsersPage initialData={data} />;
  } catch (error) {
    return <p>Failed to load data.</p>;
  }
};

export default UserList;
