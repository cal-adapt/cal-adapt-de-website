import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { fn } from "storybook/test";

import Button from "./Button";

const meta = {
  title: "Common/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the canvas
    // https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated autodocs entry
  // https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked
  // https://storybook.js.org/docs/essentials/actions#story-args
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Skip: Story = {
  args: {
    variant: "skip",
    children: "Skip to main content",
  },
};

export const AsLink: Story = {
  args: {
    variant: "primary",
    href: "https://github.com",
    children: "Go to GitHub",
  },
};

export const Floating: Story = {
  args: {
    variant: "floating",
    children: "?",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    children: "Disabled",
    disabled: true,
  },
};
