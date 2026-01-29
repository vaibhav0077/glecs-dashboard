import { useEffect, useState } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { getUserProfileQuery } from "../queries";
import { generateClient } from "aws-amplify/api";
import { useAppDispatch } from "../../../store/hooks";
import { setCompanies } from "../../../store/slices/companySlice";

type CompanySummary = {
  id: string;
  name: string;
  isActive?: boolean | null;
};

type UserProfileResult = {
  email: string;
  name?: string | null;
  companies?:
    | { items?: { company?: CompanySummary | null }[] | null }
    | { company?: CompanySummary | null }[]
    | null;
};

type UserAccessState = {
  email: string | null;
  groups: string[];
  profile: UserProfileResult | null;
  companies: CompanySummary[];
  isLoading: boolean;
  error: string | null;
};

const ADMIN_GROUPS = new Set(["ADMIN", "SUPERADMIN"]);
const INVITE_USER_GROUPS = new Set(["ADMIN", "SUPERADMIN", "VAIBHAV"]);
const PRODUCT_PRICE_AND_ACTIONS_GROUPS = new Set(["ADMIN", "SUPERADMIN", "STAFF"]);

export function useUserAccess(): UserAccessState & { isAdmin: boolean; canInviteUser: boolean; canSeeProductPriceAndActions: boolean } {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<UserAccessState>({
    email: null,
    groups: [],
    profile: null,
    companies: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [attributes, session] = await Promise.all([
          fetchUserAttributes(),
          fetchAuthSession(),
        ]);
        const email = attributes.email ?? null;
        const groups = (session.tokens?.idToken?.payload?.["cognito:groups"] ??
          []) as string[];

        if (!email) {
          throw new Error("Email is missing in user attributes.");
        }

        const apiClient = generateClient();
        const response = (await apiClient.graphql({
          query: getUserProfileQuery,
          variables: { email },
          authMode: "userPool",
        })) as { data?: { getUserProfile?: UserProfileResult | null } };

        const profile = response.data?.getUserProfile ?? null;
        const companiesRaw = profile?.companies ?? [];
        const companyItems = Array.isArray(companiesRaw)
          ? companiesRaw
          : companiesRaw?.items ?? [];
        const companies = companyItems
          .map((item) => item?.company)
          .filter((company): company is CompanySummary => Boolean(company));

        if (active) {
          setState({
            email,
            groups,
            profile,
            companies,
            isLoading: false,
            error: null,
          });
          // Sync companies to Redux (auto-selects first company if none selected)
          dispatch(setCompanies(companies));
        }
      } catch (err) {
        if (!active) {
          return;
        }
        const message = err instanceof Error ? err.message : "Unable to load user data.";
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const isAdmin = state.groups.some((group) => ADMIN_GROUPS.has(group));
  const canInviteUser = state.groups.some((group) => INVITE_USER_GROUPS.has(group));
  const canSeeProductPriceAndActions = state.groups.some((group) => PRODUCT_PRICE_AND_ACTIONS_GROUPS.has(group));

  return { ...state, isAdmin, canInviteUser, canSeeProductPriceAndActions };
}
