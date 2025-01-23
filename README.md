# CSVComparisonTool

A user-friendly tool designed to compare two CSV files and visualize the differences in an easy-to-understand format. Perfect for comparing periodic data exports like monthly client lists to identify changes.

## Features

- **Row Comparison**: 
  - Identifies added and removed rows between two CSV files
  - Treats one CSV as the base (e.g., last month) and another as the updated version (e.g., this month)
  - Highlights new entries in green and removed entries in red

- **Property Comparison**:
  - Detects and displays updated properties/values within matching rows
  - Maintains data integrity by ensuring proper column matching
  - Supports files with identical column structures

- **User-Friendly Interface**:
  - Simple and intuitive design suitable for non-technical users
  - Clear visual indicators for changes
  - Informative error messages with simple pop-up notifications
  - Auto-reset functionality when errors occur

## Technical Specifications

### Core Requirements

- **File Processing**:
  - CSV files must have identical column structures
  - First column serves as the unique identifier for row matching
  - Optimized for files up to 1,000 rows
  - Standard CSV format support

- **Error Handling**:
  - Comprehensive error logging saved to text file on server shutdown
  - User-friendly error notifications with specific column validation errors
  - Automatic page reset after error acknowledgment

### Functionality

1. **File Upload**:
   - Web interface supporting two CSV file uploads
   - Drag-and-drop support and file selector buttons
   - Validation of column structure with user-friendly error messages

2. **Comparison and Processing**:
   - Row-level comparison using first column as identifier
   - Property-level comparison for matching rows
   - Visual highlighting of differences in the interface

3. **Interactive Table Display**:
   - Merged data view with clear difference highlighting
   - Core Features:
     - Sort and filter capabilities
     - Pagination controls
     - Cell-level editing
   - Additional Features (via dropdown menu):
     - Multi-row selection
     - Cell edit history
     - Edit reversion

4. **Export Options**:
   - Core: Save merged table as new CSV file
   - Additional Options (via dropdown menu):
     - Export differences only
     - Custom export filters

### User Interface

1. **Main Interface**:
   - Clean, modern design
   - Intuitive upload area
   - Interactive table view
   - Clear visual indicators for changes:
     - New rows (green)
     - Deleted rows (red)
     - Modified properties (highlighted)

2. **Table Features**:
   - Color-coded legend/tooltip
   - Sorting and filtering controls
   - Pagination for large datasets
   - In-line cell editing
   - Dropdown menu for additional features

### Technical Implementation

- **Architecture**: Web-based application with modern frontend and backend separation
- **Performance**: Optimized for datasets up to 1,000 rows
- **Logging**: Server-side logging for errors, comparisons, and operations
- **Data Validation**: Column structure verification with specific error reporting

### Primary Use Case

Designed for business users who need to review changes between periodic data exports, such as:
- Comparing monthly client lists
- Reviewing customer data updates
- Validating data modifications

Perfect for interns or team members who need to verify changes between two versions of a dataset without requiring technical expertise.

### Specification

Create a web-based application using Angular for the front-end, with the back-end functionality implemented in PHP or TypeScript. This application will handle the following tasks:

Functionality
	1.	Input Two CSV Files:
	•	The user will upload two CSV files through the web interface.
	•	Both CSV files will have the same structure (columns) but may have a different number of rows.
	•	Some rows in the second CSV file may have edited properties compared to the first file.
	2.	Comparison and Data Processing:
	•	Compare the rows in the two CSV files based on their properties.
	•	Highlight differences (e.g., modified rows, added rows, and removed rows) visually in the interface.
	3.	Interactive Table:
	•	Display the merged data in a table format on the UI.
	•	Allow the user to apply filters (e.g., show only modified rows, added rows, or removed rows).
	•	Enable cell editing directly within the table.
	4.	Save Changes:
	•	Allow the user to save the modified table as a new CSV file.

User Interface Requirements
	1.	Upload Area:
	•	A section for uploading two CSV files with drag-and-drop support or file selector buttons.
	2.	Table View:
	•	Display a unified table of data with clear highlights for:
	•	New rows (added in the second CSV).
	•	Deleted rows (present in the first CSV but missing in the second).
	•	Modified rows (same primary identifier but with changed properties).
	•	Add a legend or tooltip to explain the color-coding for differences.
	•	Provide sorting, filtering, and pagination controls.
	3.	Edit Functionality:
	•	Allow users to edit individual cells in the table.
	•	Changes should be saved locally to the table view before exporting.
	4.	Export Button:
	•	Include a button to save the edited table to a new CSV file.

Technical Notes
	•	Front-End: Use Angular for building a dynamic and responsive user interface. Implement reusable components for table rendering, file uploads, and filters.
	•	Back-End:
	•	Use PHP for handling file processing, comparisons, and data preparation, or implement using TypeScript with Node.js for a seamless TypeScript-based stack.
	•	Write APIs to accept the uploaded CSV files and return the processed data for rendering.
	•	Styling: Use a CSS framework like Bootstrap or Angular Material for an intuitive design.
	•	Performance: Ensure efficient handling of large CSV files (up to 10,000 rows).

Output Expectations
	1.	A fully functional web application with the described features.
	2.	Clear and modular code with comments to explain key functionality.
	3.	A demo showing the app’s workflow: uploading CSVs, viewing differences, editing the table, and exporting the result.

## Steps:
    1. Initialise Front End Server
    2. Initialise Back End Server
    3. Set up Front End UI Components
    4. Add Back End Functionality - Starting with Making the Buttons work and Print to Log
    5. Add Back End Functionality - Loading the CSVs, Comparing and Processing the Data
    6. Add Front End Functionality - Displaying the Data in a Table
    7. Add Front End Functionality - Editing the Table
    8. Add Front End Functionality - Saving the Edited Table
    9. Add Front End Functionality - Exporting the Saved Table as a New CSV File
    10. Test the Application and Debug as Needed