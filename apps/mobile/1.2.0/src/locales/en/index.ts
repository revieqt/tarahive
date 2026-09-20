import common from "./common.json";
import users from "./users.json";
import tabs from "./tabs.json";
import sos from "./sos.json";

export const enBundle = {
  common,
  users,
  tabs,
  sos
} as const;

export type EnNamespace = keyof typeof enBundle;
