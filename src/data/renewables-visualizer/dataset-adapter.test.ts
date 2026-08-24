/**
 * Tests for renewable dataset adapter
 *
 * Validates:
 * - Mode definitions are properly exported
 * - Dataset configurations have required fields
 * - Value formatting works correctly
 * - Mode lookup functions return expected results
 */

import {
  RENEWABLE_MODES,
  SEASONAL_GENERATION_MODE,
  LOW_GENERATION_DAYS_MODE,
  COINCIDENT_STRESS_MODE,
  getMode,
  formatDatasetValue,
  RenewableMode,
} from "@/data/renewables-visualizer/dataset-adapter";

describe("Renewable Dataset Adapter", () => {
  describe("Mode Definitions", () => {
    it("should export all three mode definitions", () => {
      expect(SEASONAL_GENERATION_MODE).toBeDefined();
      expect(LOW_GENERATION_DAYS_MODE).toBeDefined();
      expect(COINCIDENT_STRESS_MODE).toBeDefined();
    });

    it("should have all modes in RENEWABLE_MODES map", () => {
      expect(Object.keys(RENEWABLE_MODES)).toHaveLength(3);
      expect("seasonal-generation" in RENEWABLE_MODES).toBe(true);
      expect("low-generation-days" in RENEWABLE_MODES).toBe(true);
      expect("coincident-stress" in RENEWABLE_MODES).toBe(true);
    });

    it("should have required fields in each mode", () => {
      [SEASONAL_GENERATION_MODE, LOW_GENERATION_DAYS_MODE, COINCIDENT_STRESS_MODE].forEach(
        (mode) => {
          expect(mode.id).toBeDefined();
          expect(mode.label).toBeDefined();
          expect(mode.description).toBeDefined();
          expect(mode.shortDescription).toBeDefined();
          expect(mode.helpText).toBeDefined();
          expect(mode.defaultDataset).toBeDefined();
        }
      );
    });
  });

  describe("Dataset Configuration", () => {
    it("should have valid dataset in seasonal generation mode", () => {
      const dataset = SEASONAL_GENERATION_MODE.defaultDataset;
      expect(dataset.id).toBeDefined();
      expect(dataset.mode).toBe("seasonal-generation");
      expect(dataset.resource).toBeDefined();
      expect(dataset.installation).toBeDefined();
      expect(dataset.s3Path).toContain("s3://");
      expect(dataset.units).toBeDefined();
      expect(dataset.label).toBeDefined();
      expect(dataset.metadata).toBeDefined();
    });

    it("should have metadata with source and processing method", () => {
      const dataset = SEASONAL_GENERATION_MODE.defaultDataset;
      expect(dataset.metadata.source).toBeDefined();
      expect(dataset.metadata.timeResolution).toBeDefined();
      expect(dataset.metadata.spatialGrid).toBeDefined();
      expect(dataset.metadata.citation).toBeDefined();
      expect(dataset.metadata.datasetVersion).toBeDefined();
    });

    it("should have available colormaps", () => {
      const dataset = SEASONAL_GENERATION_MODE.defaultDataset;
      expect(Array.isArray(dataset.availableColormaps)).toBe(true);
      expect(dataset.availableColormaps.length).toBeGreaterThan(0);
      expect(dataset.availableColormaps).toContain(dataset.defaultColormap);
    });
  });

  describe("getMode function", () => {
    it("should return seasonal generation mode", () => {
      const mode = getMode("seasonal-generation");
      expect(mode.id).toBe("seasonal-generation");
      expect(mode.label).toContain("Seasonal");
    });

    it("should return low-generation-days mode", () => {
      const mode = getMode("low-generation-days");
      expect(mode.id).toBe("low-generation-days");
      expect(mode.label).toContain("Low-Generation");
    });

    it("should return coincident stress mode", () => {
      const mode = getMode("coincident-stress");
      expect(mode.id).toBe("coincident-stress");
      expect(mode.label).toContain("Coincident");
    });

    it("should throw error for unknown mode", () => {
      expect(() => getMode("unknown-mode" as RenewableMode)).toThrow();
    });
  });

  describe("formatDatasetValue function", () => {
    const percentDataset = SEASONAL_GENERATION_MODE.defaultDataset;
    const daysDataset = LOW_GENERATION_DAYS_MODE.defaultDataset;

    it("should format percentage values with 1 decimal place", () => {
      const result = formatDatasetValue(45.6789, percentDataset);
      expect(result).toBe("45.7 %");
    });

    it("should format day values with 0 decimal places", () => {
      const result = formatDatasetValue(150.789, daysDataset);
      expect(result).toBe("151 days");
    });

    it("should handle null values", () => {
      expect(formatDatasetValue(null, percentDataset)).toBe("N/A");
      expect(formatDatasetValue(null, daysDataset)).toBe("N/A");
    });

    it("should include units in formatted output", () => {
      const result = formatDatasetValue(50, percentDataset);
      expect(result).toContain("%");
    });
  });

  describe("Mode Descriptions", () => {
    it("seasonal generation should not use internal abbreviations in user text", () => {
      const mode = SEASONAL_GENERATION_MODE;
      expect(mode.label).not.toMatch(/srdu|srdd/i);
      expect(mode.shortDescription).not.toMatch(/srdu|srdd/i);
    });

    it("should have coherent help text for each mode", () => {
      [SEASONAL_GENERATION_MODE, LOW_GENERATION_DAYS_MODE, COINCIDENT_STRESS_MODE].forEach(
        (mode) => {
          expect(mode.helpText.length).toBeGreaterThan(20);
          expect(mode.helpText).toContain(" ");
        }
      );
    });
  });
});
