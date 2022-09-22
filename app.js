import express from 'express'
import * as knex from 'knex'
import * as dotenv from 'dotenv'
//I have made few code changes to enable ssl for web server. I don't know much about nodejs, just used to google for solution. Didn't deploy and test the solution
import * as https from 'https'
import * as fs from 'fs'

export default class App {
    constructor() {

        this.expressApp = express()
        this.expressAp.
    }

    db() {
        //Its bad security practice to hard code DB password details into source code
        // Since we are deploying it into K8s, we will configure K8s to pass on DB details from secrets into ENV variable and we will load it from there
        return knex({
            client: 'pg',
            connection: {
                host: process.env.DBHOST,
                port: process.env.DBPORT,
                user: process.env.DBUSER,
                password: process.env.DBPASSWORD,
                database: process.env.DBDATABASE
            }
        });
    }

    start(port) {
        dotenv.config()
        //Test url for kubelet validation
        this.epressApp.get('/',(req,res) => {
            res.status.(200).send()
            return
        }
        )

        this.expressApp.get('/projects', (req, res) => {
            //Bug in the code, !== should be ==
            if (req.headers.authorization == process.env.API_KEY) {
                res.status(200).json({ projects: this.db().raw('SELECT * FROM projects') })
                return
            }

            res.status(401).json({error: 'authorization failure'})
        })

        this.expressApp.post('/projects', (req, res) => {
            //It should be == instead of  === bug in code
            if (req.headers.authorization == process.env.API_KEY) {
                //No validation, risk of cross scripting
                this.db().raw(`INSERT INTO projects(name, description) VALUES (${req.params.name}, ${req.params.description})`)
                res.status(204).send()
                return
            }

            res.status(401).json({error: 'authorization failure'})
        })

        https.createServer(
            {
                key: fs.readFileSync("key.pem"),
                cert: fs.readFileSync("cert.pem"),
            },this.expressApp).listen(port, () => {
            console.log(`Secure app is listening on port ${port}`)
        })
    }
}
