// Define the types for the attributes (attrs) in the JSON data
type Attributes = {
  grid_mapping: string;
  long_name: string;
  units: string;
};

// Define the types for the coordinate attributes within coords
type CoordinateAttributes = {
  description?: string;
  standard_name?: string;
  units?: string;
  earth_radius?: number;
  grid_mapping_name?: string;
  latitude_of_projection_origin?: number;
  longitude_of_central_meridian?: number;
  standard_parallel?: number[];
};

// Define the type for a single coordinate
type Coordinate = {
  dims: string[];
  attrs: CoordinateAttributes;
  data: number | number[];
};

// Define the types for the coords object in the JSON data
type Coordinates = {
  Lambert_Conformal: Coordinate;
  lakemask: Coordinate;
  landmask: Coordinate;
  lat: Coordinate;
  lon: Coordinate;
  month: Coordinate;
  x: Coordinate;
  y: Coordinate;
  year: Coordinate;
};

// Define the overall structure of the JSON response
export type ApiResponse = {
  dims: string[];
  attrs: Attributes;
  data: number[][];
  coords: Coordinates;
  name: string;
};
