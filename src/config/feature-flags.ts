export const Env = {
  Dev: "development",
  Stg: "staging",
  Prod: "production",
} as const;

type EnvValue = (typeof Env)[keyof typeof Env];

const currentEnv: EnvValue = (process.env.NEXT_PUBLIC_APP_ENV as EnvValue) ?? Env.Prod;

const flagDefinitions = {
  __FF_DEBUG__: [Env.Dev, Env.Stg],
  __FF_SITE_BANNER__: [Env.Dev, Env.Stg, Env.Prod],
  __FF_EXTREME_HEAT_DAYS__: [Env.Dev, Env.Stg],
  __FF_EXTREME_HEAT_DAYS_INDICATOR__: [Env.Dev, Env.Stg],
} as const satisfies Record<string, readonly EnvValue[]>;

type FlagKey = keyof typeof flagDefinitions;

type FeatureFlags = { [K in FlagKey]: boolean };

/**
 * Optional per-flag env overrides. Set `NEXT_PUBLIC_FF_*` to `true` or
 * `false` to toggle a flag on/off regardless of the current environment.
 */
const flagOverrides: Partial<Record<FlagKey, string | undefined>> = {
  __FF_SITE_BANNER__: process.env.NEXT_PUBLIC_FF_SITE_BANNER,
};

function parseOverride(value: string | undefined): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function processFlags(flags: typeof flagDefinitions, env: EnvValue): FeatureFlags {
  return Object.fromEntries(
    Object.entries(flags).map(([key, envs]) => {
      const override = parseOverride(flagOverrides[key as FlagKey]);
      const enabled = override ?? (envs as readonly EnvValue[]).includes(env);
      return [key, enabled];
    })
  ) as FeatureFlags;
}

export const featureFlags = processFlags(flagDefinitions, currentEnv);
