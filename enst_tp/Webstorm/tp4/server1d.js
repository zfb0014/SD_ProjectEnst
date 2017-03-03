"use strict";
var http = require('http');
var fs = require('fs');
var path = require("path");
var url = require("url");
var list = [];
list = readMyFile();
/*
Dans ce cas, la vulnérabilité est plus grave parce que le js va 
mémoriser tous les XSS histoire dans 'data.json'.
Donc si il avais un fois de XSS, 
il va avoir lieu chaque fois lorsqu'on utilise les formulaires.

Pour résoudre ce problem, on peut utiliser 'string.replace()' 
avant on ecrit le requêtes dans la reponse. 

Pour enrégistrer les utilisateurs qui ont déjà visités, 
on mémorise l'utilisateur dans une array global à chaque fois
qu'il y a une requête. 
Ensuite, on enrégistre le array dans un fichier du type de .json.

Chaque fois on démarre le serveur, on lit l'histoire dans le array.
*/
http.createServer(function (request, response){
    var my_path = url.parse(request.url).pathname;
    var full_path = path.join(process.cwd(),my_path);
    var queryData = url.parse(request.url, true).query;
    if(my_path=="/"){
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("Welcome to the Home Page de Fubang");
        response.end();
    }
    else if (queryData.name) {
        var value = queryData.name.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&#34;");     
        list.push(value);
        writeMyFile(list);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write("Bonjour " + value + ", les utilisateurs suivants ont déjà visités cette page: ");
        for (var i =0;i<list.length-1;i++){
            response.write(list[i]+", ");
        }
        response.write(list[list.length-1]);
        response.end();
    }
    else{
        fs.exists(full_path, function(exists){  
            if(!exists){  
                response.writeHeader(404, {"Content-Type": "text/plain"});    
                response.write("404 Not Found\n");    
                response.end();  
            }  
            else{  
                fs.readFile(full_path, "binary", function(err, file) {
                     if(err) {    
                         response.writeHeader(500, {"Content-Type": "text/plain"});    
                         response.write(err + "\n");    
                         response.end();    
                     
                     }    
                     else{console.log(my_path);
                        response.writeHeader(200);    
                        response.write(file, "binary");    
                        response.end();  
                    }  
                           
                });
            }  
        });
    }
}).listen(8000, '127.0.0.1');

console.log('Server running on port 8000.');

function readMyFile(){
    var temp = require('./data.json');
    return temp.visiters;
}

function writeMyFile(list){
    var vlist = {};
    vlist.visiters = list;
    var json = JSON.stringify(vlist);
    fs.writeFile('./data.json', json);
}










