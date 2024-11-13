import React, { Suspense } from "react";

import Ticket from "./MainPage";
import Loader from "../components/common/Loader";

export default function TicketPage() {
  return (
    <Suspense fallback={<Loader />}>
      <Ticket />
    </Suspense>
  );
}
