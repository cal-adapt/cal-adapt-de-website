// DataResultsTable
// Displays a filtered table of variables matching the user's selection.
// Each row shows the human-readable variable name and a download button for that variable.

import React from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Button from "@/components/common/ui/Button";
import { lookupValue, variablesLookupTable } from "@/data/lookup-tables";
import { analytics } from "@/lib/analytics";
import { downloadFile } from "@/utils/file";
import { searchObject } from "@/utils/object";
import { extractFilenameFromURL } from "@/utils/url";

interface Variable {
  name: string;
  href: string;
  [key: string]: any; // if needed
}

interface DataResultsProps {
  varsResData: Variable[]; // Array of variable objects from the API
  selectedVars: string[]; // List of variable names selected by the user
}

const DataResultsTable: React.FC<DataResultsProps> = ({ varsResData, selectedVars }) => {
  const filteredVars = varsResData.filter((variable) => searchObject(selectedVars, variable.name));

  return (
    <TableContainer
      sx={{
        mt: "15px",
        p: "20px",
        backgroundColor: "#f7f9fb",
        borderRadius: "7px",
        boxShadow: "none",
      }}
      component={Paper}
    >
      <Table aria-label="Data Results table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Single variable</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredVars.map((variable) => (
            <TableRow
              key={variable.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {lookupValue(variable.name, variablesLookupTable)}
              </TableCell>
              <TableCell align="right">
                <Button
                  onClick={() => {
                    const filename = extractFilenameFromURL(variable.href);
                    downloadFile(variable.href, filename);
                    analytics.trackDownload(filename, "netcdf");
                  }}
                >
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataResultsTable;
