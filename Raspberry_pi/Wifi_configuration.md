configuration of raspberry pi wifi for hotspot / access poin
=============

my scenario for this wase, wifi on board and dongle which I plugged into the raspberry pi
in this case, we have two WLAN0 and WLAN1, wlan0 must onboard wifi and wlan1 must be for wifi dongle.

so I want to configure one access point for the outdoor device to connect to RaspberryPi and communicate and 
get an order from it, like IOT device, the other wifi is for internet connection and bring out internet from another access point to RPI device.

after installing raspberry pi on SD card and run it, follow step by step configuration below:

# How to use

`
$ sudo apt update
`
This command will not actually update any software on the system but will download the latest package lists from the software repositories so that Raspbian will be aware of all new software available along with dependencies.

Next, run the following command to upgrade any packages installed on your system that need upgrades:
`
$ sudo apt full-upgrade -y
`

This is important to keep your RasPi system synchronized with security updates, etc. These two commands should be issued together and run periodically.

### Remote Access 

yes raspberry has its own Cncserv build on
but these two you can skip it if you comfortable with Vncserve build on
`
$ sudo apt install -y tightvncserver
$ sudo apt install -y xrdp
`
### Remote Access 
one of the most important things we should do it install last stable version of Nodejs
You now have an amazing general-purpose Raspberry Pi system that can be used for a variety of tasks and inter-operates well in the Windows world (it even looks like a Windows machine to the other Windows machines!) – and can play nicely in the Mac and Linux world too.  Let’s go ahead and install Node.js so we will be ready to do some fun projects in the future.  Here are the steps:

Our friends at NodeSource host and maintain some excellent Node.js binary distributions.  We will leverage a command they have written to add another package repository to our RasPi so that we will be able to “apt install” a modern version of Node.js from their repository.  This is beneficial since the Debian/Raspbian versions may not always be up to date.  By adding the NodeSource repository, we will also be able to receive updates rather than just installing a standalone (.deb) file version of Node that cannot be updated easily.

`
$ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

`
Now that we have added the NodeSource package repository, we can move on and install Node.js!

`
$ sudo apt install -y nodejs
`

We can then test and see what version of Node we are running and launch the Node REPL as we discussed in the previous article as a quick test to confirm the installation was successful.

`
$ node -v
v10.3.0
$ node
> 1 + 3
4
> # We can hit Ctrl-C twice to exit the REPL and get back to the bash (shell) prompt.
`



### Remote Access 
Why do I think Node-RED is a great solution?
Node-RED is open source and developed by IBM.

The Raspberry Pi runs Node-RED perfectly.

With Node-RED you can spend more time making cool stuff, rather than spending countless hours writing code.

Don’t get me wrong. I love programming and there is code that needs to be written throughout this course, but Node-RED allows you to prototype a complex home automation system quickly.


###Installing Node-RED
Getting Node-RED installed in your Raspberry Pi is quick and easy. It just takes a few commands.

Having an SSH connection established with your Raspberry Pi, enter the following commands to install Node-RED:

` 
$ bash <(curl -sL https://raw.githubusercontent.com/node-red/raspbian-deb-package/master/resources/update-nodejs-and-nodered)
`
The installation should be completed after a couple of minutes.

###Autostart Node-RED on boot

To automatically run Node-RED when the Pi boots up, you need to enter the following command:
`
 $ sudo systemctl enable nodered.service
`
Now, restart your Pi so the autostart takes effect:
`
$ sudo reboot
`

###Testing the Installation

When your Pi is back on, you can test the installation by entering the IP address of your Pi in a web browser followed by the 1880 port number:

`
http://YOUR_RPi_IP_ADDRESS:1880
`
In my case is:
`
http://192.168.1.107:1880
`
one of the most important thing is install <a href="https://github.com/node-red/node-red-dashboard">node-red-dashboard</a>

To install the stable version use the Menu - `Manage palette option` and search for `node-red-dashboard`, or run the following command in your Node-RED user directory (typically `~/.node-red`):

`npm i node-red-dashboard`



##wifi hotspot


I quite check all tutorial from internet and all of them have worked well when scenario is for one wifi and ethernet, but when you bring out two wifi (one is onboard the other one is dongle) in `ifconfig` after reboot you will be facing a problem, sometimes both `wlan` connect to interface you chose for one of them, or sometimes wlan specific name change randomly after each time you reboot or shutdown.( i mean some time wifi dongle register faster than onboard wifi, I really don't know why it happens)
so i follow main <a href="https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md">documantation</a> for configuration hotspot, and add some conf to fixe a litter the problem:

in `/etc/dhcpcd.conf`, I set specific metric parameters:

`
interface wlan0
    startic ip_address=192.168.4.1
    metric 300

interface wlan1
    metric 200    
`
after than in `/etc/network/interfaces` file set particulary `wpa_conf` for each interfaces:

`
iface wlan0 inet auto
    wpa_conf /etc/wpa_supplicant/wpa_supplicant_wlan0.conf

iface wlan1 inet auto 
    wpa_conf /etc/wpa_sipplicant/wpa_supplicant_wlan1.conf
`
after these two changes, my problem fixed and hotspot work as I wanted.
but somehow problems remain, so for fixed it, I set manually interfaces in `/etc/wpa_supplicant/wpa_supplican.conf` and the specific wlan that I want to connect to internet, in my case it was 'wlan1' (`/etc/wpa_supplicant/wpa_supplican_wlan1.conf`) and put away the other `wpa_supplicant` which is `wlan0`.
this setup works most of the time, it does not work well! for example like when you shutdown device, I waiting for boot up if hotspot was on my interfaces scan list so it's work well, but if it's not I `sudo reboot` device then it will be applied in my scan list.

for more configuration i found <a href="https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md">this link</a> witch explan quite good for these senario, but beceful affter this touretial, add metric parameter to interfaces.

