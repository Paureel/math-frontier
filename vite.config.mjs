import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {getFrontier,frontierResponse} from './lib/service.mjs';
import {packFrontier} from './lib/transport.mjs';
import {researchAssets} from './lib/build-assets.mjs';
const api={name:'local-frontier-api',configureServer:attach,configurePreviewServer:attach};
function attach(server){server.middlewares.use('/api/frontier',async(req,res)=>{const response=await frontierResponse(req.method,req.url?.split('?')[0]??'',async()=>packFrontier(await getFrontier()));res.statusCode=response.status;for(const [key,value] of response.headers)res.setHeader(key,value);res.end(await response.text());});}
export default defineConfig({plugins:[react({jsxImportSource:'preact'}),researchAssets(),api],resolve:{alias:[
  {find:'react-dom/client',replacement:'preact/compat/client'},
  {find:'react-dom',replacement:'preact/compat'},
  {find:'react/jsx-runtime',replacement:'preact/jsx-runtime'},
  {find:'react/jsx-dev-runtime',replacement:'preact/jsx-dev-runtime'},
  {find:'react',replacement:'preact/compat'}
]},server:{host:'127.0.0.1',port:5178,strictPort:true},preview:{host:'127.0.0.1',port:5178,strictPort:true},build:{sourcemap:false}});
