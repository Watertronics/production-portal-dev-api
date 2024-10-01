const { app } = require('@azure/functions');
const http = require('http');
const url = require('url');
const sql = require('mssql');

app.http('general-station-info', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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
                const parsedUrl = url.parse(request.url, true);
                const query = parsedUrl.query;
                const id = query.id;
                if (id) {
                    // Handle GET request: Retrieve specific station info by id
                    result = await sql.query`SELECT * FROM dbo.GeneralStationInfo WHERE ID = ${id}`;
                } else {
                    // Retrieve all general info data if no id is provided
                    result = await sql.query`SELECT * FROM dbo.GeneralStationInfo`;
                }

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
                        projectID,
                        hasTBD,
                        comments,
                        powerConfiguration,
                        voltage,
                        saleQuoteId,
                        additionalJBox,
                        color,
                        dischargePSI,
                        dynamicInletPSI,
                        electricalEnclosureLocation,
                        electricalEnclosureOnSkid,
                        fccType,
                        feetOfLift,
                        flowMeterLocation,
                        flowMeterOnSkid,
                        hertz,
                        interconnectWire,
                        legHeight,
                        phase,
                        primeSystem,
                        regulatoryCompliance,
                        sccrRating,
                        siteVoltage,
                        siteElevation,
                        stationLocation,
                        stationConfiguration,
                        stationType,
                        totalGPM,
                        trackerType,
                        wetWellDepth,
                        wetWellDepthFT,
                        wetWellDepthIn,
                        zone
                    } = body;


                    const projectCheck = await sql.query`
                        SELECT COUNT(*) AS count FROM dbo.GeneralProjectInfo WHERE ID = ${projectID}`;

                    if (projectCheck.recordset[0].count === 0) {
                        return {
                            status: 400,
                            body: 'Invalid ProjectID. It must exist in the GeneralProjectInfo table.'
                        };
                    }

                    // Insert the new value into the database
                    const result = await sql.query`
                        INSERT INTO dbo.GeneralStationInfo (
                            ProjectID, HasTBD, Comments, PowerConfiguration, Voltage, SaleQuoteId,
                            AdditionalJBox, Color, DischargePSI, DynamicInletPSI, ElectricalEnclosureLocation,
                            ElectricalEnclosureOnSkid, FCCType, FeetOfLift, FlowMeterLocation, FlowMeterOnSkid,
                            Hertz, InterconnectWire, LegHeight, Phase, PrimeSystem, RegulatoryCompliance,
                            SCCRRating, SiteVoltage, SiteElevation, StationLocation, StationConfiguration,
                            StationType, TotalGPM, TrackerType, WetWellDepth, WetWellDepthFT, WetWellDepthIn, Zone
                        ) VALUES (
                            ${projectID}, ${hasTBD}, ${comments}, ${powerConfiguration}, ${voltage}, 
                            ${saleQuoteId}, ${additionalJBox}, ${color}, ${dischargePSI}, 
                            ${dynamicInletPSI}, ${electricalEnclosureLocation}, ${electricalEnclosureOnSkid}, ${fccType}, 
                            ${feetOfLift}, ${flowMeterLocation}, ${flowMeterOnSkid}, ${hertz}, 
                            ${interconnectWire}, ${legHeight}, ${phase}, ${primeSystem}, ${regulatoryCompliance}, ${sccrRating}, 
                            ${siteVoltage}, ${siteElevation}, ${stationLocation}, ${stationConfiguration}, ${stationType}, 
                            ${totalGPM}, ${trackerType}, ${wetWellDepth}, ${wetWellDepthFT}, ${wetWellDepthIn}, ${zone}
                        )`;

                    return {
                        status: 201,
                        body: 'New Station Info Added Successfully'
                    };
                } catch (err) {
                    context.log('SQL error during INSERT:', err);
                    return {
                        status: 500,
                        body: `Error inserting new station info: ${err.message}`
                    };
                }
            } else if (method === 'PUT') {
                // Handle PUT request: Update an existing station info
                try {
                    // Ensure the request body is parsed as JSON
                    const body = await request.json();

                    // Log the body for debugging
                    context.log('Request Body:', body);

                    // Destructure the necessary fields from the body
                    const {
                        ID: id,
                        ProjectID: projectID,
                        HasTBD: hasTBD,
                        Comments: comments,
                        PowerConfiguration: powerConfiguration,
                        Voltage: voltage,
                        SaleQuoteId: saleQuoteId,
                        AdditionalJBox: additionalJBox,
                        Color: color,
                        DischargePSI: dischargePSI,
                        DynamicInletPSI: dynamicInletPSI,
                        ElectricalEnclosureLocation: electricalEnclosureLocation,
                        ElectricalEnclosureOnSkid: electricalEnclosureOnSkid,
                        FCCType: fccType,
                        FeetOfLift: feetOfLift,
                        FlowMeterLocation: flowMeterLocation,
                        FlowMeterOnSkid: flowMeterOnSkid,
                        Hertz: hertz,
                        InterconnectWire: interconnectWire,
                        LegHeight: legHeight,
                        Phase: phase,
                        PrimeSystem: primeSystem,
                        RegulatoryCompliance: regulatoryCompliance,
                        SCCRRating: sccrRating,
                        SiteVoltage: siteVoltage,
                        SiteElevation: siteElevation,
                        StationLocation: stationLocation,
                        StationConfiguration: stationConfiguration,
                        StationType: stationType,
                        TotalGPM: totalGPM,
                        TrackerType: trackerType,
                        WetWellDepth: wetWellDepth,
                        WetWellDepthFT: wetWellDepthFT,
                        WetWellDepthIn: wetWellDepthIn,
                        Zone: zone
                    } = body;


                    if (!id) {
                        return {
                            status: 400,
                            body: 'Missing required field: ID'
                        };
                    }

                    const result = await sql.query`
                        UPDATE dbo.GeneralStationInfo
                        SET 
                            ProjectID = ${projectID},
                            HasTBD = ${hasTBD},
                            Comments = ${comments},
                            PowerConfiguration = ${powerConfiguration},
                            Voltage = ${voltage},
                            SaleQuoteId = ${saleQuoteId},
                            AdditionalJBox = ${additionalJBox},
                            Color = ${color},
                            DischargePSI = ${dischargePSI},
                            DynamicInletPSI = ${dynamicInletPSI},
                            ElectricalEnclosureLocation = ${electricalEnclosureLocation},
                            ElectricalEnclosureOnSkid = ${electricalEnclosureOnSkid},
                            FCCType = ${fccType},
                            FeetOfLift = ${feetOfLift},
                            FlowMeterLocation = ${flowMeterLocation},
                            FlowMeterOnSkid = ${flowMeterOnSkid},
                            Hertz = ${hertz},
                            InterconnectWire = ${interconnectWire},
                            LegHeight = ${legHeight},
                            Phase = ${phase},
                            PrimeSystem = ${primeSystem},
                            RegulatoryCompliance = ${regulatoryCompliance},
                            SCCRRating = ${sccrRating},
                            SiteVoltage = ${siteVoltage},
                            SiteElevation = ${siteElevation},
                            StationLocation = ${stationLocation},
                            StationConfiguration = ${stationConfiguration},
                            StationType = ${stationType},
                            TotalGPM = ${totalGPM},
                            TrackerType = ${trackerType},
                            WetWellDepth = ${wetWellDepth},
                            WetWellDepthFT = ${wetWellDepthFT},
                            WetWellDepthIn = ${wetWellDepthIn},
                            Zone = ${zone}                   
                        WHERE ID = ${id}`;

                    return {
                        status: 200,
                        body: 'Station info updated successfully'
                    };
                } catch (err) {
                    context.log('SQL error during UPDATE:', err);
                    return {
                        status: 500,
                        body: `Error updating general station info: ${err.message}`
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
                    const result = await sql.query`DELETE FROM dbo.GeneralStationInfo WHERE ID = ${id}`;

                    if (result.rowsAffected[0] === 0) {
                        return {
                            status: 404,
                            body: `Station info with ID ${id} not found`
                        };
                    }

                    return {
                        status: 200,
                        body: `Station info with ID ${id} deleted successfully`
                    };
                } catch (err) {
                    return {
                        status: 500,
                        body: `Error executing DELETE query: ${err.message}`
                    };
                }
            } else if (method === 'PATCH') {
                // Handle PATCH request: Partially update an existing station info
                try {
                    const body = await request.json();
                    const { ID: id, ...updateFields } = body; // Extract ID and other fields

                    if (!id) {
                        return { status: 400, body: 'Missing required field: ID' };
                    }

                    context.log('Updating station info with ID:', id);
                    context.log('Fields to update:', updateFields);

                    // Create the SQL query dynamically
                    const setClauses = [];
                    const values = [];

                    for (const [key, value] of Object.entries(updateFields)) {
                        setClauses.push(`${key} = @${key}`); // Use parameterized queries
                        values.push({ name: key, type: sql.VarChar, value }); // Adjust type as necessary
                    }

                    const query = `UPDATE dbo.GeneralStationInfo SET ${setClauses.join(', ')} WHERE ID = @ID`;
                    values.push({ name: 'ID', type: sql.Int, value: id }); // Add ID to values

                    // Connect to the database
                    await sql.connect(sqlConfig);

                    // Create a new SQL request
                    const sqlRequest = new sql.Request();
                    values.forEach(param => sqlRequest.input(param.name, param.type, param.value));
                    await sqlRequest.query(query); // Execute the query

                    return { status: 200, body: 'Station info updated successfully' };
                } catch (err) {
                    context.log('SQL error during UPDATE:', err);
                    return { status: 500, body: `Error updating station info: ${err.message}` };
                } finally {
                    // Close the SQL connection
                    await sql.close();
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
