import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { userEvent, within } from "storybook/test";

import { FormField, Label, MultiSelect, Select } from "@/components/common/form";

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

export const SelectWithDescriptions: Story = {
  render: function SelectWithDescriptionsStory() {
    const [value, setValue] = useState("ca_counties");
    return (
      <div style={{ width: 320 }}>
        <FormField label="Spatial aggregation">
          <Select
            value={value}
            onChange={setValue}
            options={[
              {
                value: "ca_counties",
                label: "County",
                description: "Administrative counties (58 total)",
              },
              {
                value: "ca_watersheds",
                label: "Watersheds",
                description: "Hydrologic units at HUC8 level",
              },
              {
                value: "forecast_zones",
                label: "Forecast Zones",
                description:
                  "California electricity demand forecast zones (used by the California Energy Commission)",
              },
              {
                value: "ious_pous",
                label: "Utilities",
                disabled: true,
                hint: "Coming soon",
                description: "California investor-owned (IOU) and publicly-owned (POU) utilities",
              },
            ]}
          />
        </FormField>
      </div>
    );
  },
};

export const WithInlineHint: Story = {
  render: function WithInlineHintStory() {
    const [value, setValue] = useState("ca_counties");
    return (
      <div style={{ width: 320 }}>
        <FormField
          label="Spatial aggregation"
          hint="The geographic boundary used to group and summarize the data."
        >
          <Select
            value={value}
            onChange={setValue}
            options={[
              { value: "ca_counties", label: "County" },
              { value: "forecast_zones", label: "Forecast Zones" },
            ]}
          />
        </FormField>
      </div>
    );
  },
};

export const WithTooltipHint: Story = {
  render: function WithTooltipHintStory() {
    const [value, setValue] = useState("ca_counties");
    return (
      <div style={{ width: 320, paddingTop: "8rem" }}>
        <FormField
          label="Spatial aggregation"
          hint="The geographic boundary used to group and summarize the data."
          hintVariant="tooltip"
        >
          <Select
            value={value}
            onChange={setValue}
            options={[
              { value: "ca_counties", label: "County" },
              { value: "forecast_zones", label: "Forecast Zones" },
            ]}
          />
        </FormField>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Additional information" }));
  },
};

export const MultiSelectField: Story = {
  render: function MultiSelectFieldStory() {
    const [value, setValue] = useState<string[]>(["ssp245"]);
    return (
      <div style={{ width: 320 }}>
        <FormField label="Scenarios" required>
          <MultiSelect
            value={value}
            onChange={setValue}
            placeholder="Select scenarios"
            options={[
              { value: "ssp245", label: "SSP2-4.5" },
              { value: "ssp370", label: "SSP3-7.0" },
              { value: "ssp585", label: "SSP5-8.5" },
            ]}
          />
        </FormField>
      </div>
    );
  },
};

export const MultiSelectWithDescriptions: Story = {
  render: function MultiSelectWithDescriptionsStory() {
    const [value, setValue] = useState<string[]>(["ssp245", "ssp370"]);
    return (
      <div style={{ width: 320 }}>
        <FormField label="Scenarios">
          <MultiSelect
            value={value}
            onChange={setValue}
            placeholder="Select scenarios"
            options={[
              {
                value: "ssp245",
                label: "SSP2-4.5",
                description: "A middle of the road global emissions scenario",
              },
              {
                value: "ssp370",
                label: "SSP3-7.0",
                description: "A high global emissions scenario",
              },
              {
                value: "ssp585",
                label: "SSP5-8.5",
                description: "A very high global emissions scenario",
              },
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
