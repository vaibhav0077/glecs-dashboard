import { useEffect, useState } from "react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { getUserProfileQuery } from "../queries";

const client = generateClient();

type CompanySummary = {
  id: string;
  name: string;
  isActive?: boolean | null;
};

type UserProfileResult = {
  email: string;
  name?: string | null;
  companies?: { items?: CompanySummary[] | null } | CompanySummary[] | null;
};

type UserAccessState = {
  email: string | null;
  groups: string[];
  profile: UserProfileResult | null;
  companies: CompanySummary[];
  isLoading: boolean;
  error: string | null;
};

const ADMIN_GROUPS = new Set(["ADMIN", "SUPERADMIN", "VAIBHAV"]);

export function useUserAccess(): UserAccessState & { isAdmin: boolean } {
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

        const response = (await client.graphql({
          query: getUserProfileQuery,
          variables: { email },
          authMode: "userPool",
        })) as { data?: { getUserProfile?: UserProfileResult | null } };

        const profile = response.data?.getUserProfile ?? null;
        const companiesRaw = profile?.companies ?? [];
        const companies = Array.isArray(companiesRaw)
          ? companiesRaw
          : companiesRaw?.items ?? [];

        if (active) {
          setState({
            email,
            groups,
            profile,
            companies,
            isLoading: false,
            error: null,
          });
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

  return { ...state, isAdmin };
}
