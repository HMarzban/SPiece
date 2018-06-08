const {exec, execSync} = require("child_process");
var fs = require('fs');

//TODO: Set chalk for beauty of oulog.
//TODO: Set auto set interface for auto connect wifi
//TODO: make all these steps intractive with user 
//TODO: make all setting for wifi and ethernet configuration, like set static ip and so on.

/*exec("sudo iwlist wlan1 scan",function(error, stdout, stderr){
	stdout.split("\n").forEach(function(element,index){
		if(element.indexOf("ESSID")>-1){
			console.log(element)
		}
	});
})*/

/*const exec = require("child_process").exec;

function SetWifi_interface(_SSID,_PASS){
    //if _PASS has dobule qutetion mark put password in on qutaiton mark and so on.
    _PASS = _PASS.indexOf('"') >-1 ? `'${_PASS}'` : `"${_PASS}"`;
    exec(`wpa_passphrase "${_SSID}" ${ _PASS}`,(error, stdout, stderr)=>{
        if(error || stderr ) throw Error(error || stderr);
        console.log(stdout)
        if(stdout){
            exec(` sudo sh -c "echo '${stdout}'  >> /etc/wpa_supplicant/wpa_supplicant.conf" `,(error, stdout, stderr)=>{
                if(error || stderr ) throw Error(error || stderr);
                    console.log(stdout)
            })
        }
    });  
}
JSON.stringify()

let ssid = "Weldix";
let pass = `@98765432"[Tata]"01@@@`;*/


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
                let conf = `ifcae wlan${i} inet auto\n      wpa_conf /etc/wpa_supplicant/wpa_supplicant_wlan${i}.conf \n \n`;
                fs.appendFileSync('/etc/network/interfaces', conf);
                console.info(`Set Conf: ${conf}`);
            }
        } catch (error) {
            console.error(error);
        }        
    }
}//fn SetInterfaces

