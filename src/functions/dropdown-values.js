const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('dropdown-values', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        // const connectionString = process.env.SQLAZURECONNSTR_MyDbConnection

        const sqlConfig = {
            // connectionString: process.env.SQLAZURECONNSTR_MyDbConnection,
            user: process.env.user,
            password: process.env.password,
            database: process.env.database,
            server: process.env.server,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            options: {
                encrypt: true,
                trustServerCertificate: false
            }
        };

        try {
            // Connect to the database
            await sql.connect(sqlConfig);

            // Check the HTTP method
            const method = request.method.toUpperCase();
            const body = request.body || {}; // Get request body
            let result;

            if (method === 'GET') {
                // Handle GET request: Retrieve all dropdown values
                result = await sql.query`SELECT * FROM dbo.DropdownValues`;
                return {
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.recordset, null, 2)
                };
            } else if (method === 'POST') {
                // Handle POST request: Insert a new dropdown value
                try {
                    // Ensure the request body is parsed
                    const body = await request.json();

                    // Destructure the necessary fields from the body
                    const { dropdownType, value, displayText, sortOrder, isActive } = body;

                    // Ensure all required fields are provided
                    if (!dropdownType || !value || !displayText || sortOrder === undefined || isActive === undefined) {
                        return {
                            status: 400,
                            body: 'Missing required fields: DropdownType, Value, DisplayText, SortOrder, IsActive'
                        };
                    }

                    // Insert the new value into the database
                    const result = await sql.query`
                        INSERT INTO dbo.DropdownValues (DropdownType, Value, DisplayText, SortOrder, IsActive)
                        VALUES (${dropdownType}, ${value}, ${displayText}, ${sortOrder}, ${isActive})`;

                    return {
                        status: 201,
                        body: 'Dropdown value added successfully'
                    };
                } catch (err) {
                    context.log('SQL error during INSERT:', err);
                    return {
                        status: 500,
                        body: `Error inserting dropdown value: ${err.message}`
                    };
                }
            } else if (method === 'PUT') {
                // Handle PUT request: Update an existing dropdown value
                try {
                    // Ensure the request body is parsed as JSON
                    const body = await request.json();

                    // Log the body for debugging
                    context.log('Request Body:', body);

                    // Destructure the necessary fields from the body
                    const {
                        ID: id, // Destructuring and renaming to lowercase 'id'
                        DropdownType: dropdownType,
                        Value: value,
                        DisplayText: displayText,
                        SortOrder: sortOrder,
                        IsActive: isActive
                    } = body;

                    // Ensure all required fields are provided
                    if (!id || !dropdownType || !value || !displayText || sortOrder === undefined || isActive === undefined) {
                        return {
                            status: 400,
                            body: 'Missing required fields: ID, DropdownType, Value, DisplayText, SortOrder, IsActive'
                        };
                    }

                    // Update the dropdown value in the database
                    const result = await sql.query`
                        UPDATE dbo.DropdownValues
                        SET 
                            DropdownType = ${dropdownType}, 
                            Value = ${value}, 
                            DisplayText = ${displayText}, 
                            SortOrder = ${sortOrder}, 
                            IsActive = ${isActive}
                        WHERE ID = ${id}`;

                    return {
                        status: 200,
                        body: 'Dropdown value updated successfully'
                    };
                } catch (err) {
                    context.log('SQL error during UPDATE:', err);
                    return {
                        status: 500,
                        body: `Error updating dropdown value: ${err.message}`
                    };
                }
            } else if (method === 'DELETE') {
                // Handle DELETE request: Remove a dropdown value
                let id;

                try {
                    // Attempt to parse the request body
                    const body = await request.json(); // Ensure the request body is parsed as JSON
                    id = body.ID || body.id; // Check both 'ID' and 'id'
                } catch (err) {
                    return {
                        status: 400,
                        body: 'Invalid JSON format in request body'
                    };
                }

                // Check if ID was provided in the request
                if (!id) {
                    return {
                        status: 400,
                        body: 'ID parameter is missing'
                    };
                }

                try {
                    // Delete the record by ID
                    const result = await sql.query`DELETE FROM dbo.DropdownValues WHERE ID = ${id}`;

                    if (result.rowsAffected[0] === 0) {
                        return {
                            status: 404,
                            body: `Dropdown value with ID ${id} not found`
                        };
                    }

                    return {
                        status: 200,
                        body: `Dropdown value with ID ${id} deleted successfully`
                    };
                } catch (err) {
                    return {
                        status: 500,
                        body: `Error executing DELETE query: ${err.message}`
                    };
                }
            }
        } catch (err) {
            context.log('SQL error:', err);
            return { status: 500, body: `Error connecting to SQL Database: ${err.message}` };
        } finally {
            // Close the SQL connection
            await sql.close();
        }
    }
});
