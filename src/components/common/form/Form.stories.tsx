import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox, FormField, Input, Label, Select, Textarea } from "@/components/common/form";

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

export const InputField: Story = {
  render: function InputFieldStory() {
    const [value, setValue] = useState("");
    return (
      <div style={{ width: 320 }}>
        <FormField label="Dataset name" hint="Shown in your download bundle." required>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. County projections"
            autoComplete="off"
          />
        </FormField>
      </div>
    );
  },
};

export const InputWithError: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <FormField label="Email" error="Enter a valid email address." required>
        <Input type="email" defaultValue="not-an-email" invalid />
      </FormField>
    </div>
  ),
};

export const TextareaField: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <FormField label="Notes" hint="Optional context for this export.">
        <Textarea rows={4} placeholder="Add notes…" />
      </FormField>
    </div>
  ),
};

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

export const CheckboxStandalone: Story = {
  render: function CheckboxStandaloneStory() {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="Include metadata in the ZIP"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
};

export const CheckboxInFormField: Story = {
  render: function CheckboxInFormFieldStory() {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ width: 360 }}>
        <FormField label="Export options">
          <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
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
