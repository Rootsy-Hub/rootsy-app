"use client"

import { usePopAccessData } from "@/hooks/usePopAccessData"

export function usePopMenuCache(popId: string) {
  const {
    isLoading,
    loadError,
    popAccess,
    profile,
    profileFullName,
    roleLabel,
    enabledModules,
  } = usePopAccessData(popId)

  return {
    isLoading,
    loadError,
    popAccess,
    profile,
    profileFullName,
    roleLabel,
    enabledModules,
  }
}
