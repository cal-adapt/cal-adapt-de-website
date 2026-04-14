import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FormField, Label, Select } from "@/components/common/form";

const meta = {
  title: "Common/Form",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SelectField: Story = {
  render: function SelectFieldStory() {
    const [value, setValue] = useState("");
    return (
      <div style={{ width: 320 }}>
        <FormField label="Frequency" required>
          <Select
            value={value}
            onChange={setValue}
            placeholder="Select frequency"
            options={[
              { value: "daily", label: "Daily" },
              { value: "monthly", label: "Monthly" },
            ]}
          />
        </FormField>
      </div>
    );
  },
};

export const LabelOnly: Story = {
  render: () => (
    <Label htmlFor="standalone" required>
      Standalone label
    </Label>
  ),
};
