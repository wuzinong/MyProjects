import create from 'zustand'

type GlobalState = {
  isSignIn: boolean
  setIsSignIn: (isSignIn: boolean) => void
}

export const useGlobalStore = create<GlobalState>(set => ({
  isSignIn: false,
  setIsSignIn: (isSignIn: boolean) => set({ isSignIn })
}))
