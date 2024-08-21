/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/redux/store';
import { setDemoUsers, setLoading } from '@/redux/features/userSlice';
import { User } from '@/types/user';
import { useGetUsers } from '@/hooks/user';

interface DemoUsersProps {
    initialData: User[];
};

const DemoUsers: React.FC<DemoUsersProps> = ({ initialData }) => {
    const [pageSize, setPageSize] = useState({
        page: 1,
        size: 5
    });
    const dispatch: AppDispatch = useDispatch();
    const { user, reduxLoading } = useSelector((state: RootState) => state.user);

    const validInitialData = useMemo(() => {
        return initialData ? (Array.isArray(initialData) ? initialData : [initialData]) : [];
    }, [initialData]);

    useEffect(() => {
        if (validInitialData.length > 0) {
            dispatch(setDemoUsers(validInitialData));
        }
    }, []);

    const { data, swrLoading } = useGetUsers(initialData, `/todos?&_page=${pageSize.page}&_limit=${pageSize.size}`);

    useEffect(() => {
        const dataArray = Array.isArray(data) ? data : [data];
        if (dataArray.length > validInitialData.length) {
            dispatch(setDemoUsers(dataArray));
        }
    }, [data]);

    const handleFetchNext = () => {
        setPageSize(prevSize => ({
            ...prevSize,
            size: prevSize.size + 5,
        }));
        dispatch(setLoading(true));
    };

    // Determine which dataset to display
    const displayData = user.length > 0 ? user : (validInitialData.length > 0 ? validInitialData : []);

    return (
        <div>
            <ul>
                {displayData.map((val) => (
                    <li key={val.id}>{val.title}</li>
                ))}
            </ul>
            {!reduxLoading && !swrLoading ? null :
                <h3>LOADING...</h3>
            }
            <button onClick={handleFetchNext}>Fetch Next</button>
        </div>
    );
}

export default DemoUsers;
