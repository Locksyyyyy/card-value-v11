import { NextRequest, NextResponse } from 'next/server';

type Sale = { price:number; postage?:number; shipping?:number; date?:string; soldDate?:string; condition?:string; variant?:string; title?:string; cardId?:string; source?:string; url?:string };
function median(a:number[]){ if(!a.length)return 0; const s=[...a].sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2; }
function stats(values:number[]){ if(!values.length)return {filtered:[],excluded:0}; if(values.length<4)return {filtered:values,excluded:0}; const s=[...values].sort((a,b)=>a-b); const q1=s[Math.floor((s.length-1)*.25)],q3=s[Math.floor((s.length-1)*.75)],iqr=q3-q1; const filtered=values.filter(v=>v>=q1-1.5*iqr&&v<=q3+1.5*iqr); return {filtered,excluded:values.length-filtered.length}; }
function queryFor(card:any){ return [card.name,card.set,card.number,card.variant&&card.variant!=='Unknown'?card.variant:''].filter(Boolean).join(', '); }
function conditionMatch(a:string,b:string){ if(!a||!b)return true; const aa=a.toLowerCase().replace(/[^a-z]/g,''); const bb=b.toLowerCase().replace(/[^a-z]/g,''); return aa.includes(bb)||bb.includes(aa); }
function normaliseSales(items:any[]):Sale[]{ return items.map((x:any)=>({ price:Number(x.price?.value ?? x.price ?? 0), postage:Number(x.shippingOptions?.[0]?.shippingCost?.value ?? x.shipping?.value ?? x.shipping ?? 0), date:x.soldDate||x.date, condition:x.condition?.conditionDisplayName||x.condition, variant:x.itemSpecifics?.find?.((a:any)=>/variant|finish/i.test(a.name))?.value||x.variant||'Unknown', title:x.title||'', source:'eBay Marketplace Insights', url:x.itemWebUrl||x.itemHref||'' })).filter(x=>Number.isFinite(x.price)&&x.price>=0); }

async function ebaySold(card:any):Promise<{sales:Sale[]; error?:string}> {
 const client=process.env.EBAY_CLIENT_ID, secret=process.env.EBAY_CLIENT_SECRET;
 if(!client||!secret) return {sales:[]};
 try {
   const basic=Buffer.from(`${client}:${secret}`).toString('base64');
   const tokenRes=await fetch('https://api.ebay.com/identity/v1/oauth2/token',{method:'POST',headers:{Authorization:`Basic ${basic}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',scope:'https://api.ebay.com/oauth/api_scope/commerce.marketplace.insights.readonly'}),cache:'no-store'});
   if(!tokenRes.ok) return {sales:[],error:`eBay OAuth ${tokenRes.status}`};
   const token=(await tokenRes.json()).access_token;
   const q=[card.name,card.set,card.number,card.variant&&card.variant!=='Unknown'?card.variant:''].filter(Boolean).join(',');
   const url=new URL('https://api.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search');
   url.searchParams.set('q',q); url.searchParams.set('category_ids',process.env.EBAY_POKEMON_CATEGORY_ID||'183454'); url.searchParams.set('limit','200');
   const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`,'X-EBAY-C-MARKETPLACE-ID':'EBAY_GB','Accept':'application/json'},cache:'no-store'});
   if(!r.ok) return {sales:[],error:`eBay Marketplace Insights ${r.status}`};
   const data=await r.json(); return {sales:normaliseSales(data.itemSales||[])};
 } catch(e){ return {sales:[],error:e instanceof Error?e.message:'eBay request failed'}; }
}

export async function POST(req:NextRequest){
 const body=await req.json(); const card=body.card||body; const supplied:Array<Sale>=Array.isArray(body.sales)?body.sales:[]; const query=queryFor(card);
 let source='No live provider', sales=supplied, liveError='';
 if(!sales.length){ const live=await ebaySold(card); sales=live.sales; liveError=live.error||''; if(sales.length) source='eBay Marketplace Insights API'; }
 const cardId=String(card.cardId||'').trim();
 const exact=sales.filter(s=>Number.isFinite(s.price)&&s.price>=0&&(!cardId||!s.cardId||String(s.cardId).trim()===cardId)&&(!card.variant||card.variant==='Unknown'||!s.variant||s.variant==='Unknown'||s.variant.toLowerCase()===String(card.variant).toLowerCase())&&(!card.condition||card.condition==='Unknown'||!s.condition||conditionMatch(String(s.condition),String(card.condition))));
 const withPost=exact.map(s=>({...s,total:Number(s.price)+(Number(s.postage??s.shipping)||0)})); const raw=withPost.map(s=>s.total); const f=stats(raw); const filtered=withPost.filter(s=>f.filtered.includes(s.total));
 const market=median(f.filtered); const avg=f.filtered.length?f.filtered.reduce((a,b)=>a+b,0)/f.filtered.length:0;
 return NextResponse.json({provider:source,isLive:source==='eBay Marketplace Insights API',marketplace:'EBAY_GB',query,stats:f.filtered.length?{average:Number(avg.toFixed(2)),median:Number(market.toFixed(2)),low:Number(Math.min(...f.filtered).toFixed(2)),high:Number(Math.max(...f.filtered).toFixed(2)),excluded:f.excluded,sales:withPost,filteredSales:filtered}:null,nextStep:source==='eBay Marketplace Insights API'?'Live eBay sold data matched and outliers filtered.':'Connect approved eBay Marketplace Insights access or import eBay Product Research CSV.',liveError});
}
