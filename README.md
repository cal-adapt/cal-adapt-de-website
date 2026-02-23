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

Copy `.env.example` to `.env.local` and add your Mapbox token (`NEXT_PUBLIC_MAPBOX_TOKEN`). You can get one from [mapbox.com](https://mapbox.com) or ask a team member for the shared token.

```sh
cp .env.example .env.local
```

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
