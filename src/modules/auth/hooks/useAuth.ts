import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;
    getCurrentUser()
      .then(() => {
        if (isActive) {
          setState({ isAuthenticated: true, isLoading: false });
        }
      })
      .catch(() => {
        if (isActive) {
          setState({ isAuthenticated: false, isLoading: false });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
