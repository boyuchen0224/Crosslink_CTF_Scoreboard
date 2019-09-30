require('dotenv').config();
const _ = require('lodash');
const express = require('express');
const mysql = require('mysql');
const Web3 = require('web3');

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_TABLE } = process.env;
var app = express();

app.use(express.static('.'))

var connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
});

connection.connect(function(err) {
    if (err)
        throw err;
    else {
        console.log("connect mysql~~~~~~~ :)");
        clean_database();
    }
});

var level_num = ["0x8b1b00Be6B60739F8602f6CDdA67a79f746555c0", "0xE04D0f4fDe42df86941d2B1c54Bd22185F4219B0", "0x16Ab2bfe41acd8bc97a6e6b5570A93F701fd47b8", "0x3EDa5a1E2b0740FF9fBFeDE007D9C23Fb263FD24", "0x2bF68732c42718180ba6b6dAFaa0E8a6Ff51E2eC", "0xE84D57528D48a22EFFBBD48311d31c8B4dD48236", "0xAc3343c290E07FFD61b5E7C440541B6B274D9183", "0x5A5c66acCDE55765AE10a4BAD1F436b6f404AB1e", "0x6A250E76b574b5b26B8953A5229B623f5E68EAB3", "0xA3e933a5b77f70896973E21F7921F70ffd9Ff1f8"]
const address = "0x794f3861768519a809d31cb305e00be568fb29bf"
const ABI = [{
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [{
            "name": "",
            "type": "address"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "newOwner",
            "type": "address"
        }],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "instance",
                "type": "address"
            }
        ],
        "name": "LevelInstanceCreatedLog",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "level",
                "type": "address"
            }
        ],
        "name": "LevelCompletedLog",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_level",
            "type": "address"
        }],
        "name": "registerLevel",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_level",
            "type": "address"
        }],
        "name": "createLevelInstance",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
            "name": "_instance",
            "type": "address"
        }],
        "name": "submitLevelInstance",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

app.listen(3000, function() {
    console.log("Listen on port 3000 :)")
    setInterval(get_table, 10000);
    // get_table();
});

app.get('/', function(req, res) {
    res.send("Successfull!");
});

app.get("/get_info", function(req, res) {
    var sql = "select * from user_info order by user_level_total desc";

    connection.query(sql, function(err, result) {
        if (err)
            throw err;
        else {
            res.send(result);
        }
    })
})

//Get past all event from block: x
async function get_table() {

    // let web3_1 = new Web3(`https://ropsten.infura.io/v3/${INFURA_API_KEY}`);
    let web3 = new Web3('wss://ropsten.infura.io/ws');

    var contract = new web3.eth.Contract(ABI, address);

    contract.getPastEvents('LevelCompletedLog', { fromBlock: 0 }, async function(error, event) {
        if (error)
            throw error;
        else {
            // console.log(event);
            for (var i = 0; i < event.length; i++) {
                var player_add = event[i].returnValues.player;
                var level_int = level_num.indexOf(event[i].returnValues.level);
                var block_num = event[i].blockNumber;
                var block_index = event[i].logIndex;

                if (level_int == -1) {
                    console.log("---------------------------------------------------------")
                    console.log("The level is not in level_num please update level_num")
                    console.log("Player address : " + player_add + " Level : " + level_int)
                    continue;
                }

                console.log("---------------------------------------------------------")
                console.log("Player address : " + player_add + " Level : " + level_int);
                console.log("block_num : " + block_num + " block_index : " + block_index);
                await go_to_table(player_add, level_int, block_num, block_index);
            }
        }
    });
}

//Input data to table
async function go_to_table(player_add, level_int, block_num, block_index) {
    if (await check_address(player_add)) {
        console.log("*************** update ***************")
        await update(player_add, level_int, block_num, block_index);
    } else {
        console.log("*************** insert ***************")
        await insert(player_add, level_int, block_num, block_index);
    }
}

//Check user is new or not
function check_address(player) {
    var sql = `select * from user_info where user_add = '${player}';`;

    return new Promise((resolve, reject) => {
        connection.query(sql, function(err, result) {
            if (err)
                reject(err);
            else {
                if (result[0] !== undefined)
                    resolve(true);
                else
                    resolve(false);
            }
        })
    });
}

//New user use insert
function insert(player_add, level_int, block_num, block_index) {
    var sql = `insert into user_info(user_add,user_level_total,user_level_each,block_num,block_index) values ('${player_add}','1','${level_int}','${block_num}','${block_index}')`;

    return new Promise((resolve, reject) => {
        connection.query(sql, function(err, result) {
            if (err)
                reject(err);
            else
                resolve(result);
        })
    });
}

//Old user use update
async function update(player_add, level_int, block_num, block_index) {
    var level_each = await find_level(player_add);
    var level_arr = (level_each).split(',');
    var repeat = await find_repeat_level(level_arr, level_int);

    if (!repeat) {
        console.log("level_arr : " + level_arr + " level_int : " + level_int);
        level_arr.push(level_int);

        var user_level_total = level_arr.length;
        var user_level_each = level_arr.join();
        var sql = `update user_info set user_level_total = ${user_level_total}, user_level_each = '${user_level_each}' , block_num = '${block_num}',block_index = '${block_index}' where user_add = '${player_add}'`;

        return new Promise((resolve, reject) => {
            connection.query(sql, function(err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            })
        });
    } else {
        console.log("level_arr : " + level_arr + " level_int : " + level_int);
        console.log("*************** Repeated Data !!!!!!!!!!! ***************")
    }
}

//Find each completed level of user
async function find_level(player_add) {
    var sql = `select user_level_each from user_info where user_add ='${player_add}';`;

    return new Promise((resolve, reject) => {
        connection.query(sql, function(err, result) {
            if (err)
                reject(err);
            else
                resolve(result[0].user_level_each);
        })
    });
}

//Check each completed level is repeated or not
function find_repeat_level(level_arr, level_int) {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < level_arr.length; i++) {
            if (level_arr[i] == level_int)
                resolve(true);
        }
        resolve(false);
    })
}

//clean databases when i update new level or restart server
function clean_database() {
    var sql = `truncate table ${DB_TABLE};`;
    return new Promise((resolve, reject) => {
        connection.query(sql, function(err, result) {
            if (err)
                reject(err);
            else {
                console.log(`Table ${DB_TABLE} has benn cleaned`)
                resolve(result);
            }
        })
    });
}