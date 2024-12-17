import React, { Suspense } from "react";

import TicketDetail from "./MainPage";
import Loader from "../../components/common/Loader";

export default function TicketPage() {
  return (
    <Suspense fallback={<Loader />}>
      <TicketDetail />
    </Suspense>
  );
}
