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


async function getInfoFromDb(sqlQuery) {
    const sql = require("mssql");
    try {
        await sql.connect(sqlConfig)
        const result = await sql.query(sqlQuery);
        return result;
    } catch (err) {
        console.log("[ERRO] Nao foi possivel realizar a busca.");
    }
}

app.http('user_info', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`[HTTP] para URL: "${request.url}"`);
        
        const identifier = request.query.get('id') || await request.text() || 1;
        const response = await getInfoFromDb(`SELECT * FROM dbo.users WHERE id = ${identifier}`);

        if (response.recordset.length > 0) return {
            status: 200,
            body: JSON.stringify(response.recordset)
        };

        return {
            status: 404,
            body: "Usuário não encontrado!"
        };
    }
});
