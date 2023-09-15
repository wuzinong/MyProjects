import {client } from '../client'

export const getSignIn = () => {
  return client.get(`/auth`).then(response => response.data)
}

export function getMe() {
  return client.get(`/api/users/currentUser`).then(response => response.data)
}
