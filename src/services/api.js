// Use Vite's same-origin proxy during local development. This keeps the
// session and CSRF cookies on whichever host the browser used for the UI.
const base = import.meta.env.VITE_API_BASE_URL || '/api';
function cookie(name){return document.cookie.split('; ').find(x=>x.startsWith(name+'='))?.split('=')[1]}
export async function api(path, options={}) {
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  const method=(options.method||'GET').toUpperCase();
  if(!['GET','HEAD','OPTIONS'].includes(method)&&!cookie('XSRF-TOKEN'))await fetch(`${base}/auth/csrf`,{credentials:'include'});
  if(!['GET','HEAD','OPTIONS'].includes(method)){const token=cookie('XSRF-TOKEN');if(token)headers['X-XSRF-TOKEN']=decodeURIComponent(token)}
  const response=await fetch(`${base}${path}`,{...options,method,headers,credentials:'include'});
  const data=response.status===204?null:await response.json().catch(()=>null);
  if(!response.ok)throw new Error(data?.message||`Request failed (${response.status})`);
  return data;
}
