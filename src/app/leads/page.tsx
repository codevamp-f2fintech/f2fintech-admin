import React from "react";
import LeadsPage from "./LeadsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads | F2 Fintech Admin",
  description: "Manage and track leads efficiently.",
};

const Page = () => {
  return <LeadsPage />;
};

export default Page;
