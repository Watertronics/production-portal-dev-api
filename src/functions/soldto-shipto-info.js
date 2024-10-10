const { app } = require('@azure/functions');
const http = require('http');
const url = require('url');
const sql = require('mssql');

app.http('soldto-shipto-info', {
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
                    // Handle GET request: Retrieve specific soldtoshipto info by id
                    result = await sql.query`SELECT * FROM dbo.SoldToShipTo WHERE ID = ${id}`;
                } else {
                    // Retrieve all general info data if no id is provided
                    result = await sql.query`SELECT * FROM dbo.SoldToShipTo`;
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
                        saleQuoteID,
                        soldToCustomerPO,
                        soldToCompanyName,
                        soldToAddress,
                        soldToAddress2,
                        soldToCity,
                        soldToState,
                        soldToZipCode,
                        soldToCountry,
                        soldToFirstName,
                        soldToLastName,
                        soldToMobilePhone,
                        soldToPhone,
                        soldToFax,
                        soldToEmail,
                        shipToCompanyName,
                        internationalShip,
                        shipToAddress,
                        shipToAddress2,
                        shipToCity,
                        shipToState,
                        shipToZipCode,
                        shipToCountry,
                        shipToFirstName,
                        shipToLastName,
                        shipToMobilePhone,
                        shipToPhone,
                        shipToFax,
                        shipToEmail,
                        invoicePrice,
                        grossMarginPercent,
                        invoicePriceCorrected,
                        paymentTerms,
                        specialTermsApprovedBy,
                        customerCarrierCallAhead,
                        carrier,
                        selectJobSiteServicesIncluded,
                        installationServiceType,
                        notificationOfShipment,
                        shipmentDetailsOther,
                        arrivalConfirmationNotes,
                        stationWeight,
                        incoTerms,
                        certificationOfOriginRequired,
                        letterOfCredit,
                        pointOfDestination,
                        splitLoad,
                        watertronicsCoversInsurance,
                        containerTerms,
                        hsCode,
                        zone,
                        hasTBD
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
                        INSERT INTO dbo.SoldToShipTo (
                            ProjectID, SaleQuoteID, SoldToCustomerPO, SoldToCompanyName, SoldToAddress, SoldToAddress2, SoldToCity, SoldToState, SoldToZipCode, 
                            SoldToCountry, SoldToFirstName, SoldToLastName, SoldToMobilePhone, SoldToPhone, SoldToFax, SoldToEmail, ShipToCompanyName, 
                            InternationalShip, ShipToAddress, ShipToAddress2, ShipToCity, ShipToState, ShipToZipCode, ShipToCountry, ShipToFirstName, 
                            ShipToLastName, ShipToMobilePhone, ShipToPhone, ShipToFax, ShipToEmail, InvoicePrice, GrossMarginPercent, InvoicePriceCorrected, 
                            PaymentTerms, SpecialTermsApprovedBy, CustomerCarrierCallAhead, Carrier, SelectJobSiteServicesIncluded, InstallationServiceType, 
                            NotificationOfShipment, ShipmentDetailsOther, ArrivalConfirmationNotes, StationWeight, IncoTerms, CertificationOfOriginRequired, LetterOfCredit, 
                            PointOfDestination, SplitLoad, WatertronicsCoversInsurance, ContainerTerms, HSCode, Zone, HasTBD
                        ) VALUES (
                            ${projectID}, ${saleQuoteID}, ${soldToCustomerPO}, ${soldToCompanyName}, ${soldToAddress}, ${soldToAddress2}, ${soldToCity}, ${soldToState}, 
                            ${soldToZipCode}, ${soldToCountry}, ${soldToFirstName}, ${soldToLastName}, ${soldToMobilePhone}, ${soldToPhone}, ${soldToFax}, ${soldToEmail}, 
                            ${shipToCompanyName}, ${internationalShip}, ${shipToAddress}, ${shipToAddress2}, ${shipToCity}, ${shipToState}, ${shipToZipCode}, ${shipToCountry}, 
                            ${shipToFirstName}, ${shipToLastName}, ${shipToMobilePhone}, ${shipToPhone}, ${shipToFax}, ${shipToEmail}, ${invoicePrice}, ${grossMarginPercent}, 
                            ${invoicePriceCorrected}, ${paymentTerms}, ${specialTermsApprovedBy}, ${customerCarrierCallAhead}, ${carrier}, ${selectJobSiteServicesIncluded}, 
                            ${installationServiceType}, ${notificationOfShipment}, ${shipmentDetailsOther}, ${arrivalConfirmationNotes}, ${stationWeight}, 
                            ${incoTerms}, ${certificationOfOriginRequired}, ${letterOfCredit}, ${pointOfDestination}, ${splitLoad}, ${watertronicsCoversInsurance}, 
                            ${containerTerms}, ${hsCode}, ${zone}, ${hasTBD}
                        )`;

                    return {
                        status: 201,
                        body: 'New SoldToShipTo Info Added Successfully'
                    };
                } catch (err) {
                    context.log('SQL error during INSERT:', err);
                    return {
                        status: 500,
                        body: `Error inserting new SoldToShipTo info: ${err.message}`
                    };
                }
            } else if (method === 'PUT') {
                // Handle PUT request: Update an existing sold to ship to info
                try {
                    // Ensure the request body is parsed as JSON
                    const body = await request.json();

                    // Log the body for debugging
                    context.log('Request Body:', body);

                    // Destructure the necessary fields from the body
                    const {
                        ID: id,
                        ProjectID: projectID,
                        SaleQuoteID: saleQuoteID,
                        SoldToCustomerPO: soldToCustomerPO,
                        SoldToCompanyName: soldToCompanyName,
                        SoldToAddress: soldToAddress,
                        SoldToAddress2: soldToAddress2,
                        SoldToCity: soldToCity,
                        SoldToState: soldToState,
                        SoldToZipCode: soldToZipCode,
                        SoldToCountry: soldToCountry,
                        SoldToFirstName: soldToFirstName,
                        SoldToLastName: soldToLastName,
                        SoldToMobilePhone: soldToMobilePhone,
                        SoldToPhone: soldToPhone,
                        SoldToFax: soldToFax,
                        SoldToEmail: soldToEmail,
                        ShipToCompanyName: shipToCompanyName,
                        InternationalShip: internationalShip,
                        ShipToAddress: shipToAddress,
                        ShipToAddress2: shipToAddress2,
                        ShipToCity: shipToCity,
                        ShipToState: shipToState,
                        ShipToZipCode: shipToZipCode,
                        ShipToCountry: shipToCountry,
                        ShipToFirstName: shipToFirstName,
                        ShipToLastName: shipToLastName,
                        ShipToMobilePhone: shipToMobilePhone,
                        ShipToPhone: shipToPhone,
                        ShipToFax: shipToFax,
                        ShipToEmail: shipToEmail,
                        InvoicePrice: invoicePrice,
                        GrossMarginPercent: grossMarginPercent,
                        InvoicePriceCorrected: invoicePriceCorrected,
                        PaymentTerms: paymentTerms,
                        SpecialTermsApprovedBy: specialTermsApprovedBy,
                        CustomerCarrierCallAhead: customerCarrierCallAhead,
                        Carrier: carrier,
                        SelectJobSiteServicesIncluded: selectJobSiteServicesIncluded,
                        InstallationServiceType: installationServiceType,
                        NotificationOfShipment: notificationOfShipment,
                        ShipmentDetailsOther: shipmentDetailsOther,
                        ArrivalConfirmationNotes: arrivalConfirmationNotes,
                        StationWeight: stationWeight,
                        IncoTerms: incoTerms,
                        CertificationOfOriginRequired: certificationOfOriginRequired,
                        LetterOfCredit: letterOfCredit,
                        PointOfDestination: pointOfDestination,
                        SplitLoad: splitLoad,
                        WatertronicsCoversInsurance: watertronicsCoversInsurance,
                        ContainerTerms: containerTerms,
                        HSCode: hsCode,
                        Zone: zone,
                        HasTBD: hasTBD
                    } = body;


                    if (!id) {
                        return {
                            status: 400,
                            body: 'Missing required field: ID'
                        };
                    }

                    const result = await sql.query`
                        UPDATE dbo.SoldToShipTo
                        SET 
                            ProjectID = ${projectID},
                            SaleQuoteID = ${saleQuoteID},
                            SoldToCustomerPO = ${soldToCustomerPO},
                            SoldToCompanyName = ${soldToCompanyName},
                            SoldToAddress = ${soldToAddress},
                            SoldToAddress2 = ${soldToAddress2},
                            SoldToCity = ${soldToCity},
                            SoldToState = ${soldToState},
                            SoldToZipCode = ${soldToZipCode},
                            SoldToCountry = ${soldToCountry},
                            SoldToFirstName = ${soldToFirstName},
                            SoldToLastName = ${soldToLastName},
                            SoldToMobilePhone = ${soldToMobilePhone},
                            SoldToPhone = ${soldToPhone},
                            SoldToFax = ${soldToFax},
                            SoldToEmail = ${soldToEmail},
                            ShipToCompanyName = ${shipToCompanyName},
                            InternationalShip = ${internationalShip},
                            ShipToAddress = ${shipToAddress},
                            ShipToAddress2 = ${shipToAddress2},
                            ShipToCity = ${shipToCity},
                            ShipToState = ${shipToState},
                            ShipToZipCode = ${shipToZipCode},
                            ShipToCountry = ${shipToCountry},
                            ShipToFirstName = ${shipToFirstName},
                            ShipToLastName = ${shipToLastName},
                            ShipToMobilePhone = ${shipToMobilePhone},
                            ShipToPhone = ${shipToPhone},
                            ShipToFax = ${shipToFax},
                            ShipToEmail = ${shipToEmail},
                            InvoicePrice = ${invoicePrice},
                            GrossMarginPercent = ${grossMarginPercent},
                            InvoicePriceCorrected = ${invoicePriceCorrected},
                            PaymentTerms = ${paymentTerms},
                            SpecialTermsApprovedBy = ${specialTermsApprovedBy},
                            CustomerCarrierCallAhead = ${customerCarrierCallAhead},
                            Carrier = ${carrier},
                            SelectJobSiteServicesIncluded = ${selectJobSiteServicesIncluded},
                            InstallationServiceType = ${installationServiceType},
                            NotificationOfShipment = ${notificationOfShipment},
                            ShipmentDetailsOther = ${shipmentDetailsOther},
                            ArrivalConfirmationNotes = ${arrivalConfirmationNotes},
                            StationWeight = ${stationWeight},
                            IncoTerms = ${incoTerms},
                            CertificationOfOriginRequired = ${certificationOfOriginRequired},
                            LetterOfCredit = ${letterOfCredit},
                            PointOfDestination = ${pointOfDestination},
                            SplitLoad = ${splitLoad},
                            WatertronicsCoversInsurance = ${watertronicsCoversInsurance},
                            ContainerTerms = ${containerTerms},
                            HSCode = ${hsCode},
                            Zone = ${zone},
                            HasTBD = ${hasTBD}                   
                        WHERE ID = ${id}`;

                    return {
                        status: 200,
                        body: 'SoldToShipTo info updated successfully'
                    };
                } catch (err) {
                    context.log('SQL error during UPDATE:', err);
                    return {
                        status: 500,
                        body: `Error updating general SoldToShipTo info: ${err.message}`
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
                    const result = await sql.query`DELETE FROM dbo.SoldToShipTo WHERE ID = ${id}`;

                    if (result.rowsAffected[0] === 0) {
                        return {
                            status: 404,
                            body: `SoldToShipTo info with ID ${id} not found`
                        };
                    }

                    return {
                        status: 200,
                        body: `SoldToShipTo info with ID ${id} deleted successfully`
                    };
                } catch (err) {
                    return {
                        status: 500,
                        body: `Error executing DELETE query: ${err.message}`
                    };
                }
            } else if (method === 'PATCH') {
                // Handle PATCH request: Partially update an existing sold to ship to info
                try {
                    const body = await request.json();
                    const { ID: id, ...updateFields } = body; // Extract ID and other fields

                    if (!id) {
                        return { status: 400, body: 'Missing required field: ID' };
                    }

                    context.log('Updating SoldToShipTo info with ID:', id);
                    context.log('Fields to update:', updateFields);

                    // Create the SQL query dynamically
                    const setClauses = [];
                    const values = [];

                    for (const [key, value] of Object.entries(updateFields)) {
                        setClauses.push(`${key} = @${key}`); // Use parameterized queries
                        values.push({ name: key, type: sql.VarChar, value }); // Adjust type as necessary
                    }

                    const query = `UPDATE dbo.SoldToShipTo SET ${setClauses.join(', ')} WHERE ID = @ID`;
                    values.push({ name: 'ID', type: sql.Int, value: id }); // Add ID to values

                    // Connect to the database
                    await sql.connect(sqlConfig);

                    // Create a new SQL request
                    const sqlRequest = new sql.Request();
                    values.forEach(param => sqlRequest.input(param.name, param.type, param.value));
                    await sqlRequest.query(query); // Execute the query

                    return { status: 200, body: 'SoldToShipTo info updated successfully' };
                } catch (err) {
                    context.log('SQL error during UPDATE:', err);
                    return { status: 500, body: `Error updating SoldToShipTo info: ${err.message}` };
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
