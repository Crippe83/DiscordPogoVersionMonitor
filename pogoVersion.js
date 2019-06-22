const Discord=require('discord.js');
const bot=new Discord.Client();
const request = require('request');
const config = require('./config.json');

bot.login(config.token);

var version = "";
var message = "";
var lastUpdate = "";

bot.on('ready', () => {
    return UpdateLoop();
});

function VersionQuery()
{
    return new Promise(function(resolve) {
        request('https://pgorelease.nianticlabs.com/plfe/version', function(error, response, body) {

            if(response.statusCode != 200)
            {
                return resolve("Version Query Failed");
            }        
            lastUpdate = new Date().toLocaleTimeString();
            return resolve(body.slice(2));
        });
    });
}

async function UpdateLoop()
{
    currentVersion = await VersionQuery();
    let queryDelay = config.queryDelay;

    if(!version) { version = currentVersion; }

    let messageToSend = "Current PoGo forced version is: "+version+" Last updated at: "+lastUpdate;

    if(version != currentVersion)
    {
        messageToSend = "PoGo version FORCED to: "+currentVersion+" from: "+version+" Last updated at: "+lastUpdate+"\n";
        for(var i = 0; i < config.users.length; i++)
        {
            messageToSend += "<@"+config.users[i]+">";
        }
        version = currentVersion;
        queryDelay = config.delayAfterForce;
    }

    if(!message)
    {
        message = await bot.channels.get(config.channel).send(messageToSend).catch(console.error);
        message = message.id;
        
    }
    else
    {
        bot.channels.get(config.channel).messages.get(message).edit(messageToSend).catch(console.error);
    }

    console.log("Waiting "+queryDelay/1000+" seconds to check for version update");
    setTimeout(UpdateLoop,queryDelay);
    return;
    
}
