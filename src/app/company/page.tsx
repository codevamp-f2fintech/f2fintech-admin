import type { Metadata } from "next";
import { cookies } from "next/headers";

import CompanyPage from "./CompanyPage";
import type { Company } from "@/types/company";

const url = `${ process.env.NEXT_PUBLIC_API_URL }/companies`;
const PAGE = 1;
const LIMIT = 50;

export const metadata: Metadata = {
    title: "Company Management",
    description: "Manage your companies",
};

const CompanyList = async () => {

    const cookieStore = cookies();
    const token = cookieStore.get( "token" )?.value;
    console.log( 'this is token from cookie', token )

    try
    {
        const response = await fetch( `${ url }?page=${ PAGE }&limit=${ LIMIT }&isActive=true`, {
            method: "GET",
            headers: {
                "x-access-token": token || "",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        } );

        if ( !response.ok )
        {
            console.log( `Failed to fetch companies: ${ response.statusText }` );
            return <CompanyPage initialData={{ results: [], count: 0, pages: 0 }} />;
        }

        const resjson = await response.json();
        console.log( 'this is response from api', resjson );
        const data = resjson.data;
        console.log( 'this is data from api', data )

        return <CompanyPage initialData={{
            results: data.results || [],
            count: data.count || 0,
            pages: data.pages || 1
        }} />;

    } catch ( error )
    {
        console.error( "Error loading companies:", error );
        return <CompanyPage initialData={{ results: [], count: 0, pages: 1 }} />;
    }
};

export default CompanyList;