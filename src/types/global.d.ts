export {}

declare global {
  interface GlobalThis {
    Buffer?: typeof import("buffer").Buffer
    process?: typeof import("process")
  }
}

declare module "blob-stream" {
  const blobStream: any;
  export default blobStream;
}