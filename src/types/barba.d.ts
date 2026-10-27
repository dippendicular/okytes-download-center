// @barba/core 2.10.3 ships declarations but its package.json points to a missing directory.
declare module "@barba/core" {
  const barba: typeof import("@barba/core/dist/src/core").default;
  export default barba;
}
