import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Badge from "./Badge";

const meta = {
  title: "Common/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    variant: { control: "inline-radio", options: ["blue", "blue-subtle"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    children: "Beta",
    variant: "blue",
    size: "md",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blue: Story = {};

export const BlueSubtle: Story = {
  args: { variant: "blue-subtle" },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};
