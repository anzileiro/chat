const connection = async ({ rethinkdb }) => await rethinkdb.connect({
    host: process.env.rethinkdb_host,
    port: process.env.rethinkdb_port,
    password: process.env.rethinkdb_pass,
    db: process.env.rethinkdb_db
})

const controller = {
    messages: {
        create: (rethinkdb, connection) => async (request, response, next) => {

            console.log('conn => ', connection)

            const data = await rethinkdb.table('messages').insert(request.body).run(connection)

            return response.status(201).json({ status: 'created', data })
        },
        get: (rethinkdb, connection) => async (request, response, next) => {

            const data = await rethinkdb.table('messages').filter({}).run(connection)

            const list = await data.toArray()

            return response.status(200).json({ status: 'ok', data: list })

        }
    }
}

const endpoints = [
    {
        action: `/v1/messages`,
        method: `get`,
        handler: (rethinkdb, connection) => async (request, response, next) => {
            return await controller.messages.get(rethinkdb, connection)(request, response, next)
        }
    },
    {
        action: `/v1/messages`,
        method: `post`,
        handler: (rethinkdb, connection) => async (request, response, next) => {
            return await controller.messages.create(rethinkdb, connection)(request, response, next)
        }
    }
]

const routes = (router, rethinkdb, connection) => (api) => {

    api.use(endpoints.map(endpoint => router[endpoint.method](endpoint.action, endpoint.handler(rethinkdb, connection))))

    return {
        listen: () =>
            api.listen(process.env.http, () => {
                console.log(`server started`)
            })
    }
}

const middlewares = ({
    express,
    cors,
    compression,
    helmet,
    morgan,
    parser:
    {
        urlencoded,
        json
    }
}) =>
    express()
        .use([
            cors(),
            compression(),
            helmet(),
            morgan(`dev`),
            urlencoded({ extended: true }),
            json()
        ])

const init = (dependencies) => ({

    routes:
        (connection) =>
            routes(dependencies.express.Router(), dependencies.rethinkdb, connection)(middlewares(dependencies))
})

//CLOSURES
const server = async ({ dependencies }) => {

    const _connection = await connection(dependencies())

    init(dependencies())
        .routes(_connection)
        .listen()

}

const start = () =>
    server(require(`./constants/index`))

start()

