#CRN Install Instructions for Testing 

Ubuntu 16.04 is recommended and can be downloaded from: [https://www.ubuntu.com/download/server](https://www.ubuntu.com/download/server)

## Secure WebSockets
Secure WebSockets should be used for the production wallet server. This will require a SSL certificate. In this example we are using Let's Encrypt, but other SSL certificates will also work. They should be placed in
```
ssl_key = /etc/casinocoind/ssl/privkey.pem
ssl_cert = /etc/casinocoind/ssl/cert.pem
ssl_chain = /etc/casinocoind/ssl/fullchain.pem
```
The location can be changed, but changes need to be reflected in the config file.


## Important Information
- The daemon is _NOT_ a wallet<br>
- Configuration takes place in `/etc/casinocoind/casinocoind.cfg`<br>
- Servers should be secured by setting strict firewall rules and allow SSH key-based authentication only<br>

## Daemon Setup
Commands need to be executed via the command line and can be used to create a script.

```bash
adduser ubuntu # if you are working as root
sudo apt-get update -y && sudo apt-get upgrade -y && sudo apt-get dist-upgrade -y
sudo timedatectl set-timezone Etc/UTC
sudo apt-get install ufw -y
sudo ufw allow ssh
sudo ufw allow to any port 17771
sudo ufw allow to any port 7771
sudo ufw allow 443
sudo ufw allow 4443
sudo ufw enable
sudo ufw status
sudo apt-get install htop nano -y
sudo mkdir $HOME/src
cd $HOME/src
sudo mkdir casinocoind
cd casinocoind
sudo apt install python-software-properties curl git g++ scons ctags cmake pkg-config protobuf-compiler libprotobuf-dev libssl-dev python-software-properties libboost-all-dev -y
sudo wget http://www.explorerz.top/random/casinocoind
sudo chmod 777 casinocoind
sudo cp $HOME/src/casinocoind/casinocoind /usr/bin
sudo mkdir /var/log/casinocoind
sudo mkdir /etc/casinocoind
sudo mkdir -p /var/lib/casinocoind/db
sudo adduser casinocoin
sudo chown ubuntu:casinocoin /var/log/casinocoind
sudo chown -R ubuntu:casinocoin /var/lib/casinocoind
sudo chown ubuntu:casinocoin /var/log/casinocoind
sudo wget https://raw.githubusercontent.com/casinocoin/casinocoind/develop/doc/casinocoind-example-testnet.cfg
sudo mv casinocoind-example-testnet.cfg /etc/casinocoind/casinocoind.cfg
sudo wget https://raw.githubusercontent.com/casinocoin/casinocoind/develop/doc/validators-example-testnet.txt
sudo mv validators-example-testnet.txt /etc/casinocoind/validators.txt
sudo wget https://raw.githubusercontent.com/casinocoin/casinocoind/develop/doc/casinocoind-example.service
sudo mv casinocoind-example.service /etc/systemd/system/casinocoind.service
sudo usermod -aG casinocoin ubuntu
sudo usermod -aG casinocoin casinocoin
sudo chown -R ubuntu:casinocoin /var/lib/casinocoind/db
sudo chmod -R 774 /var/lib/casinocoind/db
sudo systemctl enable casinocoind.service

## Reboot the system and check if the deamon is running
## Stop the daemon and delete files in /var/lib/casinocoind/db

sudo systemctl stop casinocoind.service
sudo rm -R /var/lib/casinocoind/db/*

##### Obtain SSL Certificate

sudo ufw allow 80
sudo apt-get install software-properties-common

sudo add-apt-repository ppa:certbot/certbot

sudo apt-get update

sudo apt-get install certbot

sudo certbot certonly

## Follow the instructions
# Choose 1 for temporary webserver
# put in your email (one you really read)
# Agree to TOS
# press N
# put in the domain that connects to the system without http://

##### Finish deamon setup

sudo mkdir /etc/casinocoind/ssl/
sudo cp /etc/letsencrypt/live/crntest.casinocoin.org/privkey.pem /etc/casinocoind/ssl/privkey.pem
sudo cp /etc/letsencrypt/live/crntest.casinocoin.org/cert.pem /etc/casinocoind/ssl/cert.pem
sudo cp /etc/letsencrypt/live/crntest.casinocoin.org/fullchain.pem /etc/casinocoind/ssl/fullchain.pem
sudo chown casinocoin:root /etc/casinocoind/ssl/*
sudo chmod 400 /etc/casinocoind/ssl/*

## Edit the config

nano /etc/casinocoind/casinocoind.cfg

## Locate the [server] block and add

ssl_key = /etc/casinocoind/ssl/privkey.pem
ssl_cert = /etc/casinocoind/ssl/cert.pem
ssl_chain = /etc/casinocoind/ssl/fullchain.pem

## change

#port_ws_admin_local

## Locate the [port_peer] block and

ip = PUTYOURPUBLICIPHERE

## Locate the [port_ws_public] block and

port = 4443
ip = PUTYOURPUBLICIPHERE
protocol = wss

## Locate the [ssl_verify] and change

0 to 1

## Save and exit
## Start the daemon again

sudo systemctl start casinocoind.service

## Wait till all ledgers are synced, keep in mind the server syncs backwards, check with

casinocoind --conf=/etc/casinocoind/casinocoind.cfg server_state

## Once the server is synced run the following command

casinocoind --conf=/etc/casinocoind/casinocoind.cfg crn_create YOURDOMAINNAMEHERE

## copy the output of command into a textfile and save it! DO NOT LOOSE IT!
## Back to the config

nano /etc/casinocoind/casinocoind.cfg

## uncomment 
#[relaynode_config]
# domain
# publickey
# signature

## Out in the correct data according to your notepad output
## Example:
{
   "id" : 1,
   "result" : {
      "crn_account_id" : "cpKbQ3fiaorBQmmBBNHNFHpDKMd2dnGCt3",
      "crn_domain_name" : "crntest.casinocoin.org",
      "crn_domain_signature" : "3045022100E11E8A1CA732732B98FD5C0AD0D185F56B3A8E5A2C1A290D511AE2C39A3672CA02200CCA8CC0BA23CF99E7D40C48C6838B7F2D24F965E57C26F775AA985434E4EDFB",
      "crn_key" : "RAG DAYS BLAB IVY FACT WAST LIST GYM ACRE FOIL CAB JUTE",
      "crn_key_type" : "secp256k1",
      "crn_private_key" : "paPkXAj9XWAXez8ugJU6jeSoR9pVnMvzFkwSJE4cwxNR33sHrkp",
      "crn_public_key" : "n9KQKv7FTquws6BjS3uosjBFhbH1X5zhsAkiaMyPG7CW5Qkz417p",
      "crn_public_key_hex" : "027124403EEB7ED39C7E5185426FB0E4D0875E9793A2870423C1E32483B516568F",
      "crn_seed" : "ss5oJguwoNuo6CBPZJ2FiyMeiXryf",
      "status" : "success"
   }
}

############################

sudo apt-get install curl
bash <(curl -Ss https://my-netdata.io/kickstart-static64.sh)
sudo ufw allow 19999
http://your_server_ip:19999/
```