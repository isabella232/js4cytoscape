async function cyrestGET(t="",e="",n=defaultBaseUrl){let a=n.concat("/",t);if(""!=e){const t=e;a=a.concat("?",t)}const o=await fetch(a,{method:"GET",headers:{Accept:"application/json","Content-Type":"application/json"}});return await o.json()}async function cyrestDELETE(t="",e="",n=defaultBaseUrl){let a=n.concat("/",t);if(""!=e){const t=e;a=a.concat("?",t)}const o=await fetch(a,{method:"DELETE",headers:{Accept:"application/json","Content-Type":"application/json"}});return await o.text()}async function cyrestPOST(t="",e="",n={},a=defaultBaseUrl){let o=a.concat("/",t);if(""!=e){const t=e;o=o.concat("?",t)}const c=JSON.stringify(n),s=await fetch(o,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:c});return await s.json()}async function cyrestPUT(t="",e="",n={},a=defaultBaseUrl){let o=a.concat("/",t);if(""!=e){const t=e;o=o.concat("?",t)}const c=JSON.stringify(n),s=await fetch(o,{method:"PUT",headers:{Accept:"application/json","Content-Type":"application/json"},body:c});return await s.json()}async function commandsGET(t,e=defaultBaseUrl){const n=command2PostQueryUrl(t,e),a=command2PostQueryBody(t);await fetch(n,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:a}).then(t=>t.json()).then(t=>{console.log(t)})}async function commandsRun(t,e=defaultBaseUrl){commandsGET(t,e=e)}async function commandsPOST(t,e=defaultBaseUrl){const n=command2getQuery(t,e);await fetch(n,{method:"POST",headers:{Accept:"text/plain","Content-Type":"text/plain"}}).then(t=>t.text()).then(t=>{console.log(t)})}function command2getQuery(t,e=defaultBaseUrl){let n=t.replace(/\ [A-Za-z0-9_-]*=/g,"XXXXXX$&").split("XXXXXX"),a=n[0].replace(" ","/"),o=e.concat("/commands/"),c=encodeURI(o.concat(a)),s=n.slice(1).join(" "),l="",i=[],p=[];if(void 0!==s&&0!=s.length){const t=/[A-Za-z0-9_-]+=/g;i=(i=(s=s.replace(/['"]+/g,"")).match(t)).map(function(t){return t.replace(/=/g,"")});const e=/\ *[A-Za-z0-9_-]+=/g;p=s.split(e).slice(1),l=i[0]+"="+encodeURI(p[0]);for(var r=1;r<i.length;r++){l=l+"&"+(i[r]+"="+encodeURI(p[r]))}return c+"?"+l}return c}function command2PostQueryUrl(t,e=defaultBaseUrl){let n=t.replace(/\ [A-Za-z0-9_-]*=/g,"XXXXXX$&").split("XXXXXX")[0].replace(" ","/"),a=e.concat("/commands/");return encodeURI(a.concat(n))}function command2PostQueryBody(t){}async function deleteAllNetworks(t=defaultBaseUrl){cyrestDELETE("networks",t=t);console.log("All networks are deleted.")}async function cytoscapeVersionInfo(t=defaultBaseUrl){let e=cyrestGET("version",t=t);e.then(t=>{console.log("apiVersion: "+t.apiVersion)}),e.then(t=>{console.log("cytoscapeVersion: "+t.cytoscapeVersion)})}async function cytoscapeMemoryStatus(t=defaultBaseUrl){cyrestGET("","",t=t).then(t=>{console.log(t.memoryStatus)})}const defaultBaseUrl="http://127.0.0.1:1234/v1";async function getAvailableApps(t=defaultBaseUrl){commandsGET("apps list available",t=t)}async function getInstalledApps(t=defaultBaseUrl){commandsGET("apps list installed",t=t)}async function getDisabledApps(t=defaultBaseUrl){commandsGET("apps list disabled",t=t)}async function getAppUpdates(t=defaultBaseUrl){commandsGET("apps list updates",t=t)}async function openAppStore(t,e=defaultBaseUrl){commandsGET("apps open appstore app='"+t+"'",e=e)}