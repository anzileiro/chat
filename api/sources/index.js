const connection = async ({ rethinkdb }) => await rethinkdb.connect({
    host: process.env.rethinkdb_host,
    port: process.env.rethinkdb_port,
    password: process.env.rethinkdb_pass,
    db: process.env.rethinkdb_db
})

const controller = {
    messages: {
        create: (connection) => async (request, response, next) => {


console.log('conn => ', connection)
            
            const insert = await require('rethinkdb').table('messages').insert(request.body).run(connection)

            console.log('insert => ', insert)

            return response.status(201).json({ status: 'created' })
        }
    }
}

const endpoints = [
    {
        action: `/v1/messages`,
        method: `get`,
        handler: (connection) => (request, response, next) => {
            response.status(200).json({ rooms: [`messages`] })
        }
    },
    {
        action: `/v1/messages`,
        method: `post`,
        handler: (connection) => async (request, response, next) => {
            return await controller.messages.create(connection)(request, response, next)
        }
    }
]

const routes = (router, connection) => (api) => {

    api.use(endpoints.map(endpoint => router[endpoint.method](endpoint.action, endpoint.handler(connection))))

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
            routes(dependencies.express.Router(), connection)(middlewares(dependencies))
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

