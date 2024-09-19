const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('general-project-info', {
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
                // Handle GET request: Retrieve all general info data - can filter out hidden jobs from here
                result = await sql.query`SELECT * FROM dbo.GeneralProjectInfo`;
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
                    const {
                        projectName,
                        state,
                        jobNumber,
                        modelNumber,
                        projectStatus,
                        drawingStatus,
                        salesRep,
                        projectManager,
                        mechanicalEngineer,
                        electricalEngineer,
                        controlsEngineer,
                        hasTBD,
                        hideFromList,
                        orderDate,
                        releaseDate,
                        requestedDeliveryDate,
                        csodueDate,
                        dateShipped,
                        checkedOutBy,
                        checkedOutDate,
                        isCheckedOut,
                        stationName,
                        salesRepEmail
                    } = body;

                    // Ensure all required fields are provided - form validation can be handled on front end
                    // if (ProjectName, State, JobNumber, ModelNumber, ProjectStatus, DrawingStatus, SalesRep, ProjectManager, MechanicalEngineer, ElectricalEngineer, ControlsEngineer, HasTBD, HideFromList, OrderDate, ReleaseDate, RequestedDeliveryDate, CSODueDate, DateShipped, CheckedOutBy, CheckedOutDate, IsCheckedOut, StationName) {
                    //     return {
                    //         status: 400,
                    //         body: 'Missing required fields: DropdownType, Value, DisplayText, SortOrder, IsActive'
                    //     };
                    // }

                    // Insert the new value into the database
                    const result = await sql.query`
                        INSERT INTO dbo.GeneralProjectInfo (
                            ProjectName, State, JobNumber, ModelNumber, ProjectStatus, 
                            DrawingStatus, SalesRep, ProjectManager, MechanicalEngineer, 
                            ElectricalEngineer, ControlsEngineer, HasTBD, HideFromList, 
                            OrderDate, ReleaseDate, RequestedDeliveryDate, CSODueDate, 
                            DateShipped, CheckedOutBy, CheckedOutDate, IsCheckedOut, StationName, SalesRepEmail
                        ) VALUES (
                            ${projectName}, ${state}, ${jobNumber}, ${modelNumber}, ${projectStatus}, 
                            ${drawingStatus}, ${salesRep}, ${projectManager}, ${mechanicalEngineer}, 
                            ${electricalEngineer}, ${controlsEngineer}, ${hasTBD}, ${hideFromList}, 
                            ${orderDate}, ${releaseDate}, ${requestedDeliveryDate}, ${csodueDate}, 
                            ${dateShipped}, ${checkedOutBy}, ${checkedOutDate}, ${isCheckedOut}, ${stationName}, ${salesRepEmail}
                        )`;

                    return {
                        status: 201,
                        body: 'New Job Added Successfully'
                    };
                } catch (err) {
                    context.log('SQL error during INSERT:', err);
                    return {
                        status: 500,
                        body: `Error inserting new project: ${err.message}`
                    };
                }
            } else if (method === 'PUT') {
                // Handle PUT request: Update an existing project
                try {
                    // Ensure the request body is parsed as JSON
                    const body = await request.json();

                    // Log the body for debugging
                    context.log('Request Body:', body);

                    // Destructure the necessary fields from the body
                    const {
                        ID: id, // Rename ID to id
                        SalesQuoteID: salesQuoteID, // Rename SalesQuoteID to salesQuoteID
                        ProjectName: projectName, // Rename ProjectName to projectName
                        State: state, // Rename State to state
                        JobNumber: jobNumber, // Rename JobNumber to jobNumber
                        ModelNumber: modelNumber, // Rename ModelNumber to modelNumber
                        ProjectStatus: projectStatus, // Rename ProjectStatus to projectStatus
                        DrawingStatus: drawingStatus, // Rename DrawingStatus to drawingStatus
                        SalesRep: salesRep, // Rename SalesRep to salesRep
                        ProjectManager: projectManager, // Rename ProjectManager to projectManager
                        MechanicalEngineer: mechanicalEngineer, // Rename MechanicalEngineer to mechanicalEngineer
                        ElectricalEngineer: electricalEngineer, // Rename ElectricalEngineer to electricalEngineer
                        ControlsEngineer: controlsEngineer, // Rename ControlsEngineer to controlsEngineer
                        HasTBD: hasTBD, // Rename HasTBD to hasTBD
                        HideFromList: hideFromList, // Rename HideFromList to hideFromList
                        OrderDate: orderDate, // Rename OrderDate to orderDate
                        ReleaseDate: releaseDate, // Rename ReleaseDate to releaseDate
                        RequestedDeliveryDate: requestedDeliveryDate, // Rename RequestedDeliveryDate to requestedDeliveryDate
                        CSODueDate: csodueDate, // Rename CSODueDate to csodueDate
                        DateShipped: dateShipped, // Rename DateShipped to dateShipped
                        CheckedOutBy: checkedOutBy, // Rename CheckedOutBy to checkedOutBy
                        CheckedOutDate: checkedOutDate, // Rename CheckedOutDate to checkedOutDate
                        IsCheckedOut: isCheckedOut, // Rename IsCheckedOut to isCheckedOut
                        StationName: stationName, // Rename StationName to stationName
                        SalesRepEmail: salesRepEmail // Rename SalesRepEmail to salesRepEmail
                    } = body;


                    if (!id) {
                        return {
                            status: 400,
                            body: 'Missing required field: ID'
                        };
                    }

                    const result = await sql.query`
                        UPDATE dbo.GeneralProjectInfo
                        SET 
                            SalesQuoteID = ${salesQuoteID},
                            ProjectName = ${projectName},
                            State = ${state},
                            JobNumber = ${jobNumber},
                            ModelNumber = ${modelNumber},
                            ProjectStatus = ${projectStatus},
                            DrawingStatus = ${drawingStatus},
                            SalesRep = ${salesRep},
                            ProjectManager = ${projectManager},
                            MechanicalEngineer = ${mechanicalEngineer},
                            ElectricalEngineer = ${electricalEngineer},
                            ControlsEngineer = ${controlsEngineer},
                            HasTBD = ${hasTBD},
                            HideFromList = ${hideFromList},
                            OrderDate = ${orderDate},
                            ReleaseDate = ${releaseDate},
                            RequestedDeliveryDate = ${requestedDeliveryDate},
                            CSODueDate = ${csodueDate},
                            DateShipped = ${dateShipped},
                            CheckedOutBy = ${checkedOutBy},
                            CheckedOutDate = ${checkedOutDate},
                            IsCheckedOut = ${isCheckedOut},
                            StationName = ${stationName},
                            SalesRepEmail = ${salesRepEmail}                        
                        WHERE ID = ${id}`;

                    return {
                        status: 200,
                        body: 'Project info updated successfully'
                    };
                } catch (err) {
                    context.log('SQL error during UPDATE:', err);
                    return {
                        status: 500,
                        body: `Error updating general project info: ${err.message}`
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
                    const result = await sql.query`DELETE FROM dbo.GeneralProjectInfo WHERE ID = ${id}`;

                    if (result.rowsAffected[0] === 0) {
                        return {
                            status: 404,
                            body: `Project with ID ${id} not found`
                        };
                    }

                    return {
                        status: 200,
                        body: `Project with ID ${id} deleted successfully`
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
