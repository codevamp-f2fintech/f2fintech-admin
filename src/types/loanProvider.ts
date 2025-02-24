export interface LoanProviderData {
    id: number;
    max_tenure: number;
    min_amount: number;
    max_amount: number;
    is_home: boolean;
    home_image: string | null;
    country: string;
    title: string;
    interest_rate: string;
    description: string | null;
    short_description: string | null;
    long_description: string | null;
    charges: string | null;
    minimum_kyc: string | null;
    document_req: string | null;
    created_at: string; // Assuming the date is stored as a string
}

export interface LoanProvider {
    statusCode: number;
    message: string;
    data: {
        results: LoanProviderData[];
        count: number;
        pages: number;
    };
    errorMessage?: string;
}
