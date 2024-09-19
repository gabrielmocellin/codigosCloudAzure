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


async function createUserDb(email, nickname) {
    const sql = require("mssql");
    try {
        await sql.connect(sqlConfig)
        const result = await sql.query(`INSERT INTO dbo.users (dbo.users.email, dbo.users.nickname) VALUES ('${email}', '${nickname}');`);
        if (result.rowsAffected == 1) { return true };
        return false;
    } catch (err) {
        return false;
    }
}

app.http('user_create', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`[HTTP] para URL: "${request.url}"`);
        // Acessar o corpo da requisição (request.body)
        const body = await request.json();
        const email = body.email;
        const nickname = body.nickname;

        if (email && nickname) {
            const response = await createUserDb(email, nickname);

            if (response) {
                return {
                    status: 201,
                    body: "Usuário criado com sucesso!"
                };
            }

            return {
                status: 500,
                body: "Erro ao criar o usuário."
            };
        }

        return {
            status: 400,
            body: "Parâmetros 'email' e 'nickname' são obrigatórios."
        };
    }
});
