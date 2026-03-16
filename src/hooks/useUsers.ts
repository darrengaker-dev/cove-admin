import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, banUser, unbanUser, resetPassword } from "@/lib/api/users";
import type { UserFilter, BanUserRequest } from "@/types/user";

export function useUsers(filter: UserFilter) {
  return useQuery({
    queryKey: ["users", filter],
    queryFn: () => getUsers(filter),
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: BanUserRequest }) => banUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) => resetPassword(id),
  });
}
