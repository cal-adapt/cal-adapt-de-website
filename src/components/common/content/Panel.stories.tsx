import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Panel from "./Panel";

const meta = {
  title: "Common/Panel",
  component: Panel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    eyebrow: { control: "text" },
    as: { control: "inline-radio", options: ["aside", "nav"] },
    children: { control: false },
  },
  args: {
    eyebrow: "In this story",
    children: (
      <p>
        This page provides an overview of some of the ways that extreme heat is projected to impact
        California in the coming decades.
      </p>
    ),
  },
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Summary: Story = {};

export const Navigation: Story = {
  args: {
    as: "nav",
    eyebrow: "Table of contents",
    children: (
      <ol>
        <li>
          <a href="#more-frequent-days">Extreme heat days will become more frequent</a>
        </li>
        <li>
          <a href="#breaking-records">Climate change is breaking records across California</a>
        </li>
      </ol>
    ),
  },
};
