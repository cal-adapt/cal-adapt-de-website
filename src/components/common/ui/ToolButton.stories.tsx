import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { navGroups, navLinks } from "@/config/navigation";

import ToolButton from "./ToolButton";

const meta = {
  title: "Common/ToolButton",
  component: ToolButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "small", "large"] },
  },
  args: { navLink: navLinks.extremeHeatDays, size: "compact" },
} satisfies Meta<typeof ToolButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Given a tool, the button takes its label and icon from the sidebar. */
export const Compact: Story = {};

export const Small: Story = {
  args: { size: "small" },
};

export const AllTools: Story = {
  render: ({ size }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {navGroups.tools.links.map((navLink) => (
        <ToolButton key={navLink.id} navLink={navLink} size={size} />
      ))}
    </div>
  ),
};
