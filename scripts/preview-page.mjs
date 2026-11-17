#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {parseArgs} from "./navigation-index-lib.mjs";
const args=parseArgs(process.argv.slice(2));
if(args.help){console.log("preview-page.mjs --project <root> [--port 4173] [--dist <relative-directory>]");process.exit(0);}
if(!args.project)throw new Error("Provide --project");
const root=fs.realpathSync(path.resolve(args.project)),port=Number(args.port||4173);
let projectFiles = null;
let directory;
if(args.dist){
 directory=path.resolve(root,args.dist);
 if(!directory.startsWith(root+path.sep))throw new Error("Distribution must be inside project");
}else{
 const marker=path.join(root,'.text-to-ui/offline-preview.json');
 if(!fs.existsSync(marker))throw new Error('Generate the offline preview first, or provide --dist <preview-directory>');
 const report=JSON.parse(fs.readFileSync(marker,'utf8'));
 if(report.distribution==='project'&&report.output==='index.html'){
  directory=root;
  projectFiles=new Set(Object.keys(report.files));
 }else if(report.distribution==='multi-file'){
  directory=path.resolve(root,path.dirname(report.output));
  if(!directory.startsWith(root+path.sep))throw new Error("Distribution must be inside project");
 }else throw new Error('Provide --dist for a legacy single-file export');
}
{
 const real=fs.realpathSync(directory);
 const server=http.createServer((req,res)=>{
  try{const url=new URL(req.url,"http://127.0.0.1"),file=path.resolve(directory,"."+decodeURIComponent(url.pathname));
   if(file!==directory&&!file.startsWith(directory+path.sep))throw new Error("Forbidden path");
   const target=file===directory?path.join(directory,"index.html"):file;
   if(projectFiles&&!projectFiles.has(path.relative(root,target).split(path.sep).join("/")))throw new Error("File is not part of the preview");
   const entry=fs.statSync(target).isDirectory()?path.join(target,"index.html"):target;
   if(!fs.realpathSync(entry).startsWith(real+path.sep))throw new Error("Forbidden link");
   const types={".html":"text/html; charset=utf-8",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
   res.setHeader("Content-Type",types[path.extname(entry)]||"application/octet-stream");res.end(fs.readFileSync(entry));
  }catch{res.statusCode=404;res.end("Not found");}
 });server.listen(port,"127.0.0.1",()=>console.log(JSON.stringify({url:"http://127.0.0.1:"+server.address().port,bridgeStarted:false})));
}
