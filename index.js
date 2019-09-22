const _ = require('lodash');
const express = require('express');
const mysql = require('mysql');
const Web3 = require('web3');

var app = express();

app.use(express.static('.'))

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gaga0224',
    database: 'log'
});

connection.connect(function(err) {
    if (err)
        throw err;
    else
        console.log("connect mysql~~~~~~~ :)");
});

// var level_num = ['0xDF51a9e8CE57E7787E4A27DD19880Fd7106b9A5C', '0x234094AAC85628444a82DaE0396C680974260bE7', '0x220BEEE334f1C1f8078352D88Bcc4E6165b792F6', '0xD340de695BbC39E72DF800DFde78a20d2ed94035', '0x6b7b4A5260B67c1ee9196a42dD1ed8633231bA0a', '0x6545DF87f57d21CB096a0BFCc53a70464D062512', '0x68756Ad5E1039E4f3b895cfaa16a3a79A5a73C59', '0x24d661BeB31b85a7d775272d7841f80e662c283b', '0xE77b0BEa3F019b1Df2c9663c823a2Ae65AfB6a5f', '0x32D25A51C4690960F1D18fADFa98111F71de5fA7', '0xF70706DB003E94cfe4B5e27ffd891d5C81b39488', '0xCD596b3E7063B068f54054Beb4FB4074C87E8AD8', '0x76b9FADe124191ff5642bA1731a8279b30EbE644', '0x95850e2aC424804043086321DDAE90aDd5c90651', '0x65d2dd3360086Cf306E700A0703Ee38650D28413', '0xddf4eab541bf1373B70022C4cd81fe2a4ccf476A', '0xE3545eBAa3A0381ebd9f0868ae61b5dc89962ef5', '0xe83Cf387Ddfd13A2Db5493D014ba5B328589Fb5f', '0xDE038A41CAD4236c2B32A5ff1002C61a0cc424a0', '0x7640ADB7aA5F07ea42483Ad3F30b0280d4E595f0', '0x73048cec9010E92C298B016966BDE1CC47299DF5', '0x601C7951500f83ed1Da63Ab031b435d4E551683a']
// const address = "0xC833A73D33071725143d7Cf7dFD4f4bBa6B5cED2";
var level_num = ["0x8b1b00Be6B60739F8602f6CDdA67a79f746555c0", "0xE04D0f4fDe42df86941d2B1c54Bd22185F4219B0"]
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

// let web3_1 = new Web3(`https://ropsten.infura.io/v3/${INFURA_API_KEY}`);
let web3 = new Web3('wss://ropsten.infura.io/ws');

var contract = new web3.eth.Contract(ABI, address);

//Get past all event from block: x
async function get_table() {
    contract.getPastEvents('LevelCompletedLog', { fromBlock: 6400000 }, async function(error, event) {
        if (error)
            throw error;
        else {
            // console.log(event);
            for (var i = 0; i < event.length; i++) {
                var player_add = event[i].returnValues.player;
                var level_int = level_num.indexOf(event[i].returnValues.level);
                var block_num = event[i].blockNumber;
                var block_index = event[i].logIndex;

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
        console.log("level_arr : " + level_arr + " level_int : " + level_int + " " + find_repeat_level(level_arr, level_int));
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
        console.log("*************** Repeted Data !!!!!!!!!!! ***************")
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