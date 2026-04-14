import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { fn } from "storybook/test";

import Button from "./Button";
import Icon from "./Icon";

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

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
    children: "Tertiary",
  },
};

export const Accent: Story = {
  args: {
    variant: "accent",
    children: "Accent",
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

export const Small: Story = {
  args: {
    variant: "secondary",
    size: "small",
    children: "Small Button",
  },
};

export const WithPrefixIcon: Story = {
  args: {
    variant: "primary",
    children: "Download",
    prefix: <Icon variant="download" aria-hidden />,
  },
};

export const WithSuffixIcon: Story = {
  args: {
    variant: "secondary",
    children: "Learn more",
    suffix: <Icon variant="info" aria-hidden />,
  },
};

export const VariantMatrix: Story = {
  render: () => {
    const variants = ["primary", "secondary", "tertiary", "accent"] as const;
    const sizes = ["large", "small"] as const;

    return (
      <div style={{ display: "grid", gap: "16px", minWidth: "840px" }}>
        {sizes.map((size) => (
          <div key={size} style={{ display: "grid", gap: "8px" }}>
            <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{size}</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {variants.map((variant) => (
                <Button key={`${size}-${variant}-default`} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
              {variants.map((variant) => (
                <Button key={`${size}-${variant}-disabled`} variant={variant} size={size} disabled>
                  {variant} disabled
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
