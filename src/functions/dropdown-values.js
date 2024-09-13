const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('dropdown-values', {
    methods: ['GET', 'POST'],
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

            // Run SQL query
            const result = await sql.query`SELECT * FROM dbo.DropdownValues`;

            // Return the result
            // return { body: result.recordset };
            return {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.recordset, null, 2) // Format the JSON with indentation
            };
        } catch (err) {
            // Log error using context.log
            context.log('SQL error:', err);
            return { status: 500, body: `Error connecting to SQL Database: ${err.message}` };
        } finally {
            // Close the connection
            await sql.close();
        }
    }
});
