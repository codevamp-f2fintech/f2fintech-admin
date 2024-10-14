import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define the type for your employee state, including documents
interface EmployeeState {
  status: string;
  loanStatus: string;
  documents: Array<{
    document_url: string;
    type: string;
  }>;
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch status from the API dynamically
export const fetchEmployeeStatus = createAsyncThunk<string, number>(
  "employee/fetchStatus",

  async (applicationId) => {
    const response = await axios.get(
      `http://localhost:3001/api/v1/get-by-application-id/${applicationId}`
    );
    console.log(applicationId, "id is");

    return response.data.data.status;
  }
);

// Define the type for the API response for status and documents
interface FetchStatusAndDocumentsResponse {
  success: boolean;
  data: {
    loanStatus: string;
    documents: Array<{
      document_url: string;
      type: string;
    }>;
  };
}

// Async thunk to fetch status and documents from the API dynamically
export const fetchStatusAndDocuments = createAsyncThunk<
  FetchStatusAndDocumentsResponse,
  { applicationId: number; customerId: number },
  { rejectValue: string }
>(
  "employee/fetchStatusAndDocuments",
  async ({ applicationId, customerId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/v1/get-status-and-documents/${customerId}/${applicationId}`
      );
      if (response.data && response.data.data) {
        console.log(response, "response");
        return response.data;
      } else {
        return rejectWithValue("No data received from the API");
      }
    } catch (error) {
      return rejectWithValue("API call failed");
    }
  }
);

// Initial state with types
const initialState: EmployeeState = {
  status: "to-do",
  loanStatus: "to-do",
  documents: [],
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setEmployeeStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
    setLoanStatus: (state, action: PayloadAction<string>) => {
      state.loanStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchEmployeeStatus.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.status = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchEmployeeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch employee status";
      })
      .addCase(fetchStatusAndDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchStatusAndDocuments.fulfilled,
        (state, action: PayloadAction<FetchStatusAndDocumentsResponse>) => {
          state.loanStatus = action.payload.data?.loanStatus ?? "unknown";
          state.documents = action.payload.data.documents;
          state.loading = false;
        }
      )
      .addCase(fetchStatusAndDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch loan status and documents";
      });
  },
});

export const { setEmployeeStatus, setLoanStatus } = employeeSlice.actions;

export default employeeSlice.reducer;
