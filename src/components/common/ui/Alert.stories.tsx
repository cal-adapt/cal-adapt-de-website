import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Alert from "./Alert";
import Button from "./Button";

const meta = {
  title: "Common/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    severity: {
      control: "select",
      options: ["info", "warning", "error", "success"],
    },
    children: {
      control: "text",
    },
    ariaLabel: {
      control: "text",
    },
    action: {
      control: false,
    },
  },
  args: {
    children: "This is an alert message.",
    severity: "info",
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    severity: "info",
    children: "This is an info alert.",
  },
};

export const Warning: Story = {
  args: {
    severity: "warning",
    children: "This is a warning alert.",
  },
};

export const ErrorAlert: Story = {
  args: {
    severity: "error",
    children: "This is an error alert.",
  },
};

export const Success: Story = {
  args: {
    severity: "success",
    children: "This is a success alert.",
  },
};

export const WithAction: Story = {
  render: () => (
    <Alert
      severity="info"
      action={
        <Button type="button" variant="primary" size="small">
          Button
        </Button>
      }
    >
      This is an info alert with an action.
    </Alert>
  ),
};
