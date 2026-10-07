import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/common/ui/Button";

import Callout, { type CalloutVariant } from "./Callout";

import mdxStyles from "./MdxContent.module.scss";

const EXPLORE_ACTIONS = (
  <>
    <Button href="#" variant="primary" size="small">
      Explore the Extreme Heat tool
    </Button>
    <Button href="#" variant="secondary" size="small">
      Open the Climate Metrics Map
    </Button>
  </>
);

const meta = {
  title: "Common/Callout",
  component: Callout,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <article className={mdxStyles.content}>
        <Story />
      </article>
    ),
  ],
  argTypes: {
    kind: { control: "inline-radio", options: ["example", "note", "explore"] },
    variant: { control: "inline-radio", options: ["blue", "grey"] },
    label: { control: "text" },
    title: { control: "text" },
    actions: { control: false },
    children: { control: false },
  },
  args: {
    kind: "example",
    children: (
      <p>
        A day with an average daily temperature of 75 °F has a CDD value of (75 °F - 65 °F) = 10.
        This day is above the heating threshold, so it has an HDD value of 0.
      </p>
    ),
  },
} satisfies Meta<typeof Callout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {};

export const NoteWithTitle: Story = {
  args: {
    kind: "note",
    title: "Why compute the 10th and 90th percentile?",
    children: (
      <p>
        The 10th and 90th percentile values represent the number of extreme heat days on a
        particularly cold year and particularly hot year, respectively.
      </p>
    ),
  },
};

export const ExploreWithActions: Story = {
  args: {
    kind: "explore",
    title: "Explore this in the Extreme Heat tool",
    actions: EXPLORE_ACTIONS,
    children: <p>Pick your own location and threshold, or compare counties on the map.</p>,
  },
};

const VARIANTS: CalloutVariant[] = ["blue", "grey"];

export const Variants: Story = {
  render: () => (
    <>
      {VARIANTS.map((variant) => (
        <section key={variant}>
          <h3>{`variant="${variant}"`}</h3>
          <Callout kind="example" variant={variant}>
            <p>A day averaging 75 °F has a CDD value of (75 °F - 65 °F) = 10.</p>
          </Callout>
          <Callout kind="note" variant={variant} title="Grid cells at the edge">
            <p>All grid cells within or touching the boundary were included.</p>
          </Callout>
          <Callout
            kind="explore"
            variant={variant}
            title="Explore this in the Extreme Heat tool"
            actions={EXPLORE_ACTIONS}
          >
            <p>Pick your own location and threshold, or compare counties on the map.</p>
          </Callout>
        </section>
      ))}
    </>
  ),
};
