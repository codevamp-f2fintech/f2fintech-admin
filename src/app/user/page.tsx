import type { Metadata } from "next";

import DemoUsersPage from './DemoUsers';

import { User } from "@/types/user";
import { Utility } from "@/utils";

const url = 'https://jsonplaceholder.typicode.com/todos';
const PAGE = 1;
const SIZE = 5;

// Metadata to show in head tag.
export const metadata: Metadata = {
    title: 'User Listing',
    description: 'User describing their todos',
};

const DemoUsersServer = async () => {
    const { fetchData } = Utility();

    try {
        const data: User[] = await fetchData(url, PAGE, SIZE);

        return <DemoUsersPage initialData={data} />
    } catch (error) {
        console.log('Error fetching data:', error);
        return <p>Failed to load data.</p>
    }
};

export default DemoUsersServer;
