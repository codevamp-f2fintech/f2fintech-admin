/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/redux/store";
import { setDemoUsers, setLoading } from "@/redux/features/userSlice";
import { setToast } from "@/redux/features/toastSlice";
import { User } from "@/types/user";
import { useGetUsers } from "@/hooks/user";
import Loader from "../components/common/Loader";
import Toast from "../components/common/Snackbar";
import { Utility } from "@/utils";

interface DemoUsersProps {
  initialData: User[];
}

const DemoUsers: React.FC<DemoUsersProps> = ({ initialData }) => {
  const [pageSize, setPageSize] = useState({
    page: 1,
    size: 5,
  });
  const dispatch: AppDispatch = useDispatch();
  const { user, reduxLoading } = useSelector((state: RootState) => state.user);
  const { toast } = useSelector((state: RootState) => state.toast);

  const { toastAndNavigate } = Utility();

  const validInitialData = useMemo(() => {
    return initialData
      ? Array.isArray(initialData)
        ? initialData
        : [initialData]
      : [];
  }, [initialData]);

  useEffect(() => {
    if (validInitialData.length > 0) {
      dispatch(setDemoUsers(validInitialData));
    }
  }, []);

  const { data, swrLoading } = useGetUsers(
    initialData,
    `/todos?&_page=${pageSize.page}&_limit=${pageSize.size}`
  );

  useEffect(() => {
    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length > validInitialData.length) {
      dispatch(setDemoUsers(dataArray));
    }
  }, [data]);

  const handleFetchNext = () => {
    setPageSize((prevSize) => ({
      ...prevSize,
      size: prevSize.size + 5,
    }));
    dispatch(setLoading(true));
    setTimeout(() => {
      toastAndNavigate(dispatch, true, "info", "Successfully Updated");
    }, 5000);
  };

  // Determine which dataset to display
  const displayData =
    user.length > 0
      ? user
      : validInitialData.length > 0
      ? validInitialData
      : [];

  console.log("toast", toast);
  return (
    <div>
      <ul>
        {displayData.map((val) => (
          <li key={val.id}>{val.title}</li>
        ))}
      </ul>
      {!reduxLoading && !swrLoading ? null : <Loader />}
      <button onClick={handleFetchNext}>Fetch Next</button>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </div>
  );
};

export default DemoUsers;
