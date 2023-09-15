import axios from 'axios'

export const isDevelopment = process.env.NODE_ENV === 'development'

export const client = axios.create({
  baseURL: ''
})

export default client
