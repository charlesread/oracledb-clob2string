'use strict'

const config = require('./config')
const oracledb = require('oracledb')
const stream = require('stream')
const co = require('co')

//create a connectin pool, you don't have to create a pool
function createPool() {
    return oracledb.createPool(config.db)
}

function *run() {
    const pool = yield createPool()
    //but you so have to somehow get a connection
    const conn = yield pool.getConnection()
    //run the query and get the results, this query should return a LOB column, but you knew that
    const results = yield conn.execute('select * from tasks_clob')
    //here are the meat and potatoes
    const stringedResults = yield stringer(results)
    yield conn.close()
    return stringedResults
}

//let's just loop through each of the result values and see if one is a readable stream
function *stringer(result) {
    let i = 0
    while (i < result.rows.length) {
        let j = 0
        while (j < result.rows[i].length) {
            if (result.rows[i][j] instanceof stream.Readable) {
                //if it is lets convert it to a string
                result.rows[i][j] = yield processClob(result.rows[i][j])
            }
            j++
        }
        i++
    }
    return result
}

//read from the stream that is the LOB, then return the string representation
function processClob(stream) {
    return new Promise((resolve, reject) => {
        let output = ''
        stream.on('data', (data) => {
            output += data
        })
        stream.on('end', () => {
            resolve(output)
        })
        stream.on('error', (err) => {
            reject(err)
        })
    })
}

//kick it all off
co(run)
    .then(console.log)
    .catch(console.error)