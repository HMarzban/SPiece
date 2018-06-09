#!/usr/bin/env node
'use strict';
const {exec, execSync} = require("child_process");
const fs = require('fs');
const chalk = require('chalk');
var inquirer = require('inquirer');
const program = require('commander');
const log = console.log;

//TODO: Set chalk for beauty of oulog.
//TODO: Set auto set interface for auto connect wifi
//TODO: make all these steps intractive with user 
//TODO: make all setting for wifi and ethernet configuration, like set static ip and so on.
//TODO: chack, if interfaces base on ssid was add befor, remove it then append it again.





//set Wifi connect to accespoint

program
.version('0.0.1')
.command('wifi [options]')
.option('-c, --connect', 'Wifi Connect')
.option('-s, --scan [op]', 'Wifi Scan and show list')
.option('-i, --interfaces', 'wifi interfaces avilable')
.description('Wifi command, you fin interfaces available and base on it you can scan network fo AP and then connect to them.')
.action( async (env,options) => {
    if(options.scan){
        env = env || 'wlan0';
        console.log( await wifi_scanList(env));
    }else if(options.connect){
        wifi_connecttoAP();
    }else if(options.interfaces){
        console.log(await wifi_interfaceList());
    }
})

program.parse(process.argv);


function wifi_scanList(_interfac){
    let wifiList = [];
    return new Promise((resolve, reject) => {
        exec(`sudo iwlist ${_interfac} scan`,function(error, stdout, stderr){
            stdout.split("\n").forEach(function(element,index){
                if(element.indexOf("ESSID")>-1){
                    log(chalk.green(`[ Scan Wifi ]: ${element.trim()}`) );
                    wifiList.push(element.split(":")[1])
                }
            });
            resolve(wifiList)
        });
    })//promis
}//fn wifi_scanList

function wifi_interfaceList(){
    let interfaceList = 0;
    return new Promise((resolve, reject) => {
        exec("sudo ifconfig",function(error, stdout, stderr){
            stdout.split("\n").forEach(function(element,index){
                if(element.indexOf("wlan")>-1)
                    interfaceList++
            });
            resolve(interfaceList)
        });
    })//promis
}//fn wifi_interfaceList

async function wifi_connecttoAP(_interfac){
    let wlanList=[];

    if(!_interfac)
        _interfac = await wifi_interfaceList();

    for (let i = 0 ;i<_interfac ; i++){
        wlanList.push(`wlan${i}`);
    }

    const options1 = [
        {
            type: 'list',
            name: 'wlan',
            message: 'Chose witch wlan you wana use to connetc wifi:',
            choices:wlanList
        }

    ]

    inquirer.prompt(options1).then(async answers1 => {

        let wifiList = await wifi_scanList(answers1.wlan);
        const options2 = [
            {
                type: 'list',
                name: 'ssid',
                message: 'Chose wifi name of list to wana connect to:',
                choices:wifiList
            },{
                type: 'input',
                name: 'pass',
                message: "what is password of wifi> "
              }
        ]

        inquirer.prompt(options2).then(answers2 => {
            console.log(answers1)
            console.log(answers2)
            SetWifi_interface(""+answers2.ssid+"",""+answers2.pass+"",answers1.wlan)
        })

    })
}

function SetWifi_interface(_SSID,_PASS,_wlan){
    //if _PASS has dobule qutetion mark put password in on qutaiton mark and so on.
    
    _PASS = _PASS.indexOf('"') >-1 ? `'${_PASS}'` : `"${_PASS}"`;
    exec(`wpa_passphrase "${_SSID}" ${ _PASS}`,(error, stdout, stderr)=>{
        if(error || stderr ) throw Error(error || stderr);
        console.log(stdout)
        if(stdout){
            fs.appendFileSync(`/etc/wpa_supplicant/wpa_supplicant_${_wlan}.conf`, stdout);
            fs.appendFileSync(`/etc/wpa_supplicant/wpa_supplicant.conf`, stdout);
        }
    });  
}

//sudo nano /etc/network/interfaces

function setWifi_autoConnect(){
    let conf = `'auto wlan0 \n     allow-hotplug wlan0 \n     iface wlan0 int dhcp \n     wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf \n'`;
    exec(` sudo sh -c "echo ${conf}  >> /etc/network/interfaces" `,(error, stdout, stderr)=>{
        if(error || stderr ) throw Error(error || stderr);
        console.log(stdout)
    });
}
//SetWifi_interface(ssid, pass)

////etc/network/interfaces

/**
 * Execcute "$sudo ifconfig" command and Search and count wifi interface.
 * Peomis Base function
 * @returns {Promise} As Number
 */
function count_wlan (){
    try {
        return new Promise((resolve, reject) => {
           let wlanCount = 0;
            exec("sudo ifconfig",function(error, stdout, stderr){
                stdout.split("\n").forEach(function(element,index){
                    if(element.indexOf("wlan")>-1)
                        wlanCount++;
                });
                resolve(wlanCount)
            });
        });//return Pomis   
    } catch (error) {
        console.error(error)
    }
}

/**
 * Search in file for find @param _string and Resolve @returns {Boolean};
 * @param {directory and fiel path} _path 
 * @param {text you want find} _string 
 * @returns {Promise} ad Boolean
 */
function FindString (_path,_string){
    return new Promise((resolve, reject) => {
        fs.readFile(_path, function (err, data) {
            if (err) throw err;
            data.indexOf(_string) >= 0 ? resolve(true) : resolve(false);   
          });
    });
}


/**
 * craet file in directory name /etc/wpa_supplicant/
 * add wpa_supplicant_wlanX for each of wlan device hsac 
 */
async function SetInterfaces(){
    let wlanCont = await count_wlan();
    // creat wpa_supplicant for each wlan spesificly
    for (let i = 0 ; i < wlanCont ; i++){
        try {     
            if (!fs.existsSync(`wpa_supplicant_wlan${i}.conf`)) {
                execSync(`sudo touch /etc/wpa_supplicant/wpa_supplicant_wlan${i}.conf`);
                console.info(`Creat File: wpa_supplicant_wlan${i}.conf`);
            }

            let existConf = await FindString("/etc/network/interfaces",`iface wlan${i} inet auto`);
            if(!existConf){
                let conf = `iface wlan${i} inet auto\n      wpa_conf /etc/wpa_supplicant/wpa_supplicant_wlan${i}.conf \n \n`;
                fs.appendFileSync('/etc/network/interfaces', conf);
                console.info(`Set Conf: ${conf}`);
            }
        } catch (error) {
            console.error(error);
        }        
    }
}//fn SetInterfaces

