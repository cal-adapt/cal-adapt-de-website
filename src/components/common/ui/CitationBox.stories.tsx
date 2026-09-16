import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { expect, spyOn, userEvent, within } from "storybook/test";

import { SITE_TITLE, SITE_URL } from "@/config/constants";

import CitationBox from "./CitationBox";

const PATHNAME = "/dashboard/data-download-tool";

const meta = {
  title: "Common/CitationBox",
  component: CitationBox,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: PATHNAME,
      },
    },
  },
  tags: ["autodocs"],
  args: {
    title: "Data Download Tool",
  },
} satisfies Meta<typeof CitationBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Borderless: Story = {
  args: {
    bordered: false,
  },
};

export const CopyToClipboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeText = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const year = new Date().getFullYear();

    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));

    await expect(writeText).toHaveBeenCalledWith(
      `${SITE_TITLE}. (${year}). Data Download Tool. ${SITE_TITLE}. ${SITE_URL}${PATHNAME}`
    );
    await expect(canvas.getByRole("button", { name: "Copied!" })).toBeInTheDocument();
  },
};
