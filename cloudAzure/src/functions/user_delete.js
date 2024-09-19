const { app } = require('@azure/functions');
const sqlConfig = {
    user: "XXXXXX",
    password: "XXXXXX",
    database: 'gb_database',
    server: 'clouddatabasegb.database.windows.net',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 3000000
    },
    options: {
        encrypt: true, // Azure
        trustServerCertificate: false
    }
}


async function deleteInfoDb(identifier) {
    const sql = require("mssql");
    try {
        await sql.connect(sqlConfig)
        const result = await sql.query(`DELETE FROM dbo.users WHERE id = ${identifier}`);
        if (result.rowsAffected == 1) { return true };
        return false;
    } catch (err) {
        return false;
    }
}

app.http('user_delete', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`[HTTP] para URL: "${request.url}"`);
        
        if (request.query.get('id')) {
            const identifier = request.query.get('id');
            const response = await deleteInfoDb(identifier);

            if (response) {
                return {
                    status: 204,
                    body: null
                }
            }
    
            return {
                status: 404,
                body: "Usuário não encontrado!"
            };
        }

        return {
            status: 404,
            body: "Id não inserido!"
        };
    }
});
