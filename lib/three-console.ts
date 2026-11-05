import { setConsoleFunction } from "three";

/*
 * three.js (r183+) deprecates THREE.Clock in favour of THREE.Timer, but
 * @react-three/fiber (9.8.x, the latest) still creates a Clock for every
 * <Canvas>, so each 3D scene printed "THREE.Clock: This module has been
 * deprecated" on mount. Nothing of ours uses Clock, so this one message is
 * dropped; every other three.js log, warning and error goes to the console
 * exactly as three.js would print it. Remove once fiber moves to Timer.
 *
 * Imported for its side effect by every module that renders a <Canvas>.
 */

const FIBER_CLOCK = "THREE.Clock: This module has been deprecated";

type StackTrace = { isStackTrace: true; getError: (message: string) => Error };
const isStackTrace = (v: unknown): v is StackTrace =>
  typeof v === "object" && v !== null && (v as { isStackTrace?: unknown }).isStackTrace === true;

setConsoleFunction((type: "log" | "warn" | "error", message: string, ...params: unknown[]) => {
  if (type === "warn" && message.startsWith(FIBER_CLOCK)) return;
  const [first] = params;
  if (type !== "log" && isStackTrace(first)) {
    console[type](first.getError(message));
    return;
  }
  console[type](message, ...params);
});
