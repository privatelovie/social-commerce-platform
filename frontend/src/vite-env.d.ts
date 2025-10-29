/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_GOOGLE_CLIENT_ID: string
    readonly REACT_APP_API_URL: string
    // add more env variables as needed
  }
}
