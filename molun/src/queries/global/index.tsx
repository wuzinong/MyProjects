import { useMutation, useQuery } from '@tanstack/react-query'
import React from 'react'
import shallow from 'zustand/shallow'

import { getMe, getSignIn } from 'apis/global'
import { queries, time30Minutes } from 'queries/consts'
import { useGlobalStore } from 'stores/global'

export const useSignin = () => {
  const { setIsSignIn } = useGlobalStore(state => ({ setIsSignIn: state.setIsSignIn }), shallow)
  const mutation = useMutation(() => getSignIn(), {
    onSuccess: (data: { result: boolean }) => {
      const isSignIn = data?.result
      setIsSignIn(isSignIn)
    }
  })
  return mutation
}

export const useMe = () => {
  const { isSignIn } = useGlobalStore(state => ({ isSignIn: state.isSignIn }), shallow)
  return useQuery([queries.global.me], getMe, {
    cacheTime: time30Minutes,
    enabled: isSignIn,
    staleTime: time30Minutes
  })
}
