export const CHANNEL_NAMES = !!process.env.HM__CHANNEL_NAMES
  ? process.env.HM__CHANNEL_NAMES.split(",")
  : ["one", "two", "three"];

export const ACCENT_COLOR: string = !!process.env.ACCENT_COLOR
  ? (process.env.ACCENT_COLOR as string)
  : "#febc40";

export const CATEGORIES = {
  ask: !!process.env.HM__HELP_CATEGORY
    ? process.env.HM__HELP_CATEGORY
    : "🚀 Help: Available",
  ongoing: !!process.env.HM__HELP_ONGOING_CATEGORY
    ? process.env.HM__HELP_ONGOING_CATEGORY
    : "⌛ Help: Ongoing",
  dormant: !!process.env.HM__HELP_DORMANT_CATEGORY
    ? process.env.HM__HELP_DORMANT_CATEGORY
    : "💣 Help: Dormant",
};

export const COOLDOWN_ROLE = !!process.env.HM__HELP_COOLDOWN_ROLE
  ? process.env.HM__HELP_COOLDOWN_ROLE
  : "Help Cooldown";
export const COOLDOWN_TIMEOUT = !!process.env.HM__HELP_COOLDOWN_TIMEOUT
  ? parseInt(process.env.HM__HELP_COOLDOWN_TIMEOUT)
  : 900;

export const DORMANT_CHANNEL_TIMEOUT = !!process.env.HM__DORMANT_CHANNEL_TIMEOUT
  ? parseInt(process.env.HM__DORMANT_CHANNEL_TIMEOUT)
  : 64800;
export const DORMANT_CHANNEL_LOOP = !!process.env.HM__DORMANT_CHANNEL_LOOP
  ? parseInt(process.env.HM__DORMANT_CHANNEL_LOOP)
  : 600000;

export const CHANNEL_PREFIX = !!process.env.HM__HELP_CH_PREFIX
  ? process.env.HM__HELP_CH_PREFIX
  : "help-";
