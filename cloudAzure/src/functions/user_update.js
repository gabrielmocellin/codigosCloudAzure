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


async function updateUserDb(id, email, nickname) {
    const sql = require("mssql");
    try {
        await sql.connect(sqlConfig)
        const result = await sql.query(`UPDATE dbo.users SET dbo.users.email = '${email}', dbo.users.nickname = '${nickname}' WHERE dbo.users.id = ${id};`);
        if (result.rowsAffected == 1) { return true };
        return false;
    } catch (err) {
        return false;
    }
}

app.http('user_update', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`[HTTP] para URL: "${request.url}"`);
        // Acessar o corpo da requisição (request.body)
        try {
            const body = await request.json();
            const id = body.id;
            const email = body.email;
            const nickname = body.nickname;

            if (id && email && nickname) {
                const response = await updateUserDb(id, email, nickname);

                if (response) {
                    return {
                        status: 200,
                        body: "Usuário atualizado com sucesso!"
                    };
                }
            }

            return {
                status: 400,
                body: "Parâmetros 'id', 'email' e 'nickname' são obrigatórios."
            };
        } catch (e) {
            return {
                status: 500,
                body: "Erro ao atualizar o usuário."
            };
        }
    }
});
