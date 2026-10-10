// Netlify's SDK retries thrown fetch errors and 429/5xx responses five times,
// with waits that exceed the scheduled job's 30s limit. Public-source caching
// uses one bounded attempt; failure must reach the saved fallback promptly.
function within(work,signal) {
  signal.throwIfAborted();
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(signal.reason);
    signal.addEventListener('abort',abort,{once:true});
    Promise.resolve(work).then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));
  });
}

export function boundedBlobFetch({fetcher=fetch,signal,timeoutMs=5000,limit=2*1024*1024}={}) {
  return async function fetchOnce(url,options={}) {
    const deadline=AbortSignal.any([AbortSignal.timeout(timeoutMs),...[signal,options.signal].filter(Boolean)]);
    let reader;
    try {
      deadline.throwIfAborted();
      const response=await within(fetcher(url,{...options,signal:deadline}),deadline);
      if(response.status===429 || response.status>=500 || response.status===403) {
        void response.body?.cancel().catch(()=>{});
        return new Response('Public source cache unavailable.',{status:408});
      }
      if(Number(response.headers.get('content-length'))>limit)throw Error('Cache response too large.');
      reader=response.body?.getReader();
      const chunks=[];let size=0;
      if(reader)while(true) {
        const {done,value}=await within(reader.read(),deadline);
        if(done)break;
        size+=value.length;
        if(size>limit)throw Error('Cache response too large.');
        chunks.push(value);
      }
      const body=[204,205,304].includes(response.status)?null:Buffer.concat(chunks,size);
      return new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});
    } catch {
      void reader?.cancel().catch(()=>{});
      // A non-retryable internal status lets the SDK reject immediately without
      // throwing into its retry loop. This response is never sent to visitors.
      return new Response('Public source cache unavailable.',{status:408});
    }
  };
}
