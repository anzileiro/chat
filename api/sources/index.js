const endpoints = [
    {
        action: `/v1/rooms`,
        method: `get`,
        handler: (request, response, next) =>
            response.status(200).json({ rooms: [`rooms`] })
    },
    {
        action: `/v1/messages`,
        method: `get`,
        handler: (request, response, next) =>
            response.status(200).json({ messages: [`messages`] })
    }
]

const routes = (router) => (api) => {

    api.use(endpoints.map(endpoint => router[endpoint.method](endpoint.action, endpoint.handler)))

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
        () =>
            routes(dependencies.express.Router())(middlewares(dependencies))
})

//CLOSURES
const server = ({ dependencies }) =>
    init(dependencies())
        .routes()
        .listen()

const start = () =>
    server(require(`./constants/index`))

start()

