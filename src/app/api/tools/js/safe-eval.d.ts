declare module "safe-eval" {
  const safeEval: (code: string, context?: object) => string;
  export default safeEval;
}
