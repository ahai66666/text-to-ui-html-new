#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {parseArgs} from "./navigation-index-lib.mjs";
const args=parseArgs(process.argv.slice(2));
if(args.help){console.log("preview-page.mjs --project <root> [--port 4173] [--dist <relative-directory>]");process.exit(0);}
if(!args.project)throw new Error("Provide --project");
const root=fs.realpathSync(path.resolve(args.project)),port=Number(args.port||4173);
if(!args.dist){
 const marker=path.join(root,'.text-to-ui/offline-preview.json');
 if(!fs.existsSync(marker))throw new Error('Generate the offline preview first, or provide --dist <preview-directory>');
 const report=JSON.parse(fs.readFileSync(marker,'utf8'));
 if(report.distribution!=='multi-file')throw new Error('Provide --dist for a legacy single-file export');
 args.dist=path.dirname(report.output);
}
{
 const directory=path.resolve(root,args.dist);if(!directory.startsWith(root+path.sep))throw new Error("Distribution must be inside project");
 const real=fs.realpathSync(directory);
 const server=http.createServer((req,res)=>{
  try{const url=new URL(req.url,"http://127.0.0.1"),file=path.resolve(directory,"."+decodeURIComponent(url.pathname));
   if(file!==directory&&!file.startsWith(directory+path.sep))throw new Error("Forbidden path");
   const target=fs.statSync(file).isDirectory()?path.join(file,"index.html"):file;
   if(!fs.realpathSync(target).startsWith(real+path.sep))throw new Error("Forbidden link");
   const types={".html":"text/html; charset=utf-8",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
   res.setHeader("Content-Type",types[path.extname(target)]||"application/octet-stream");res.end(fs.readFileSync(target));
  }catch{res.statusCode=404;res.end("Not found");}
 });server.listen(port,"127.0.0.1",()=>console.log(JSON.stringify({url:"http://127.0.0.1:"+server.address().port,bridgeStarted:false})));
}
