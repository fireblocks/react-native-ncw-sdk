export const ENV_CONFIG = {
  // TODO: read from environment variables

  //SANDBOX
  NCW_SDK_ENV: 'sandbox',
  BACKEND_BASE_URL: 'https://api-sb.ncw-demo.com',
  DEV_MODE: true,
  AUTOMATE_INITIALIZATION: false,
  // // TODO: add CloudKit configuration here
  CLOUDKIT_APITOKEN: '', // import.meta.env.VITE_CLOUDKIT_APITOKEN,
  CLOUDKIT_CONTAINER_ID: '', // import.meta.env.VITE_CLOUDKIT_CONTAINER_ID,
  CLOUDKIT_ENV: '', //import.meta.env.VITE_CLOUDKIT_ENV,

  //DEV9
  // BACKEND_BASE_URL: 'https://dev9-ncw-demo.waterballoons.xyz',
  // NCW_SDK_ENV: 'dev9',
  // DEV_MODE: true,
  // AUTOMATE_INITIALIZATION: false,
  // CLOUDKIT_APITOKEN:
  //   '572a0b5cfcb8992031640d1a14fd0ac3bb7c774cc929a0e23cb00af415da51cd',
  // CLOUDKIT_CONTAINER_ID: 'iCloud.com.fireblocks.ncw.demo',
  // CLOUDKIT_ENV: 'development',
};
