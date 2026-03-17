export const Env = {
  Dev: "development",
  Stg: "staging",
  Prod: "production",
} as const;

type EnvValue = (typeof Env)[keyof typeof Env];

const currentEnv: EnvValue = (process.env.NODE_ENV as EnvValue) ?? Env.Prod;

const flagDefinitions = {
  __FF_DEBUG__: [Env.Dev, Env.Stg],
} as const satisfies Record<string, readonly EnvValue[]>;

type FeatureFlags = { [K in keyof typeof flagDefinitions]: boolean };

function processFlags(flags: typeof flagDefinitions, env: EnvValue): FeatureFlags {
  return Object.fromEntries(
    Object.entries(flags).map(([key, envs]) => [key, (envs as readonly EnvValue[]).includes(env)])
  ) as FeatureFlags;
}

export const featureFlags = processFlags(flagDefinitions, currentEnv);
