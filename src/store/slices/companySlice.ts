import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CompanySummary = {
  id: string;
  name: string;
  isActive?: boolean | null;
};

type CompanyState = {
  selectedCompany: CompanySummary | null;
  companies: CompanySummary[];
};

const initialState: CompanyState = {
  selectedCompany: null,
  companies: [],
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<CompanySummary[]>) => {
      state.companies = action.payload;
      // Auto-select first company if none selected and companies exist
      if (!state.selectedCompany && action.payload.length > 0) {
        state.selectedCompany = action.payload[0];
      }
    },
    setSelectedCompany: (state, action: PayloadAction<CompanySummary | null>) => {
      state.selectedCompany = action.payload;
    },
    selectCompanyById: (state, action: PayloadAction<string>) => {
      const company = state.companies.find((c) => c.id === action.payload);
      if (company) {
        state.selectedCompany = company;
      }
    },
    clearCompany: (state) => {
      state.selectedCompany = null;
      state.companies = [];
    },
  },
});

export const {
  setCompanies,
  setSelectedCompany,
  selectCompanyById,
  clearCompany,
} = companySlice.actions;

export default companySlice.reducer;
