import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { navGroups, navLinks } from "@/config/navigation";

import ToolPill from "./ToolPill";

const meta = {
  title: "Common/ToolPill",
  component: ToolPill,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["small", "large"] },
  },
} satisfies Meta<typeof ToolPill>;

export default meta;

type Story = StoryObj<typeof meta>;

// Each story passes its own args: the props are a union, so there are no shared defaults.
const extremeHeat = {
  navLink: navLinks.extremeHeatDays,
  href: navLinks.extremeHeatDays.href,
};

/** Given a tool, the pill takes its label and icon from the sidebar. */
export const Tool: Story = {
  args: { ...extremeHeat, size: "small" },
};

export const Large: Story = {
  args: { ...extremeHeat, size: "large" },
};

/** For anything that isn't a tool, pass the label and icon directly. */
export const CustomLabel: Story = {
  args: {
    label: "The 2020 Sacramento Heat Waves",
    icon: <ArrowOutwardOutlinedIcon />,
    href: "https://analytics.cal-adapt.org/blog/posts/2026-08-18-sac-extreme-heat/",
  },
};

export const AllTools: Story = {
  args: { ...extremeHeat, size: "small" },
  render: ({ size }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {navGroups.tools.links.map((navLink) => (
        <ToolPill key={navLink.id} navLink={navLink} href={navLink.href} size={size} />
      ))}
    </div>
  ),
};
