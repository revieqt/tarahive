import common from "./common.json";
import auth from "./auth.json";
import settings from "./settings.json";
import tabs from "./tabs.json";
import sos from "./sos.json";

export const enBundle = {
  common,
  auth,
  settings,
  tabs,
  sos
} as const;

export type EnNamespace = keyof typeof enBundle;
