export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  isDevFallback: boolean;
};

export const LOCAL_USER: AppUser = {
  id: "local-reader",
  displayName: "Reader",
  primaryEmail: null,
  profileImageUrl: null,
  isDevFallback: true,
};

export type CurrentUserState = {
  user: AppUser | null;
  isPending: boolean;
};

export function useCurrentUserState(): CurrentUserState {
  return { user: LOCAL_USER, isPending: false };
}

export function useCurrentUser(): AppUser | null {
  return LOCAL_USER;
}
