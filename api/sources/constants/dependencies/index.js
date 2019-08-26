module.exports =
    () =>
        ({
            express: require(`express`),
            cors: require(`cors`),
            rethinkdb: require(`rethinkdb`),
            parser: require(`body-parser`),
            helmet: require(`helmet`),
            compression: require(`compression`),
            morgan: require(`morgan`)
        })
