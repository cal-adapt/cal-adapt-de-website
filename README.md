# Cal-Adapt 3.0

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Requirements

- [Node.js](https://nodejs.org)
- A Node version manager like [nvm](https://github.com/nvm-sh/nvm) or a runtime version manager like [mise](https://github.com/jdx/mise)

## Getting started

Install and switch to the Node.js version specified in `.nvmrc` using your version manager of choice.

> [!IMPORTANT]
> Since v16.13, installations of Node.js are distributed with [Corepack](https://github.com/nodejs/corepack) by default for managing package managers.
> However, due to its experimental status, Corepack currently needs to be explicitly enabled before usage:
>
> ```sh
> corepack enable
> ```
>
> For alternative methods to install pnpm, [see here](https://pnpm.io/installation).

Install the dependencies:

```sh
pnpm install
```

Start the development server:

```sh
pnpm dev
```

Generate an optimized production build and start the compiled application in production mode:

```sh
pnpm build
pnpm start
```

## Testing

This project uses the [Vitest](https://vitest.dev) test runner with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) for unit testing and [Storybook](https://storybook.js.org) for UI development and documentation.

In Storybook, each story is a small code snippet that configures a component into a key UI state.
When configured with [Storybook's Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon), stories are transformed into component tests to be run by Vitest.
Stories are tested in two ways: a smoke test to ensure it renders and, if a play function is defined, that function is run and any assertions made within it are validated.
See the [Storybook documentation](https://storybook.js.org/docs) for more information.

Run Vitest in watch mode:

```sh
pnpm test
```

Run Vitest once:

```sh
pnpm test:run
```

Run Vitest with coverage report:

```sh
pnpm test:coverage
```

Start the Storybook development server (default: http://localhost:6006):

```sh
pnpm storybook
```

Compiles the Storybook instance so it can be deployed:

```sh
pnpm build-storybook
```

## Architecture

### Tool management

The tools are stored in their specific folders under `components/`

#### Tool Carousel

Located in `components/home/ToolCarousel.tsx`

Whenever a new metric within a tool or a tool is added, this component needs to be updated accordingly. Check for the data from where the instance of the tool is retrieving its data, and add the values accordingly.

### Context management

All context code is stored under `context/`

### Global components

#### HTML Tooltip

Can be used for more complex tooltips beyond MUI's default. Links, images and any HTML content can be added

#### LoadingSpinner

This component was written to create an optimized version of thea loading spinner
