export const PLANS = {
  free:{name:'Free',price:0,scans:5},
  collector:{name:'Collector',price:3.99,scans:100},
  pro:{name:'Pro Seller',price:7.99,scans:500},
  business:{name:'Business',price:14.99,scans:2000},
} as const;
export type PlanKey=keyof typeof PLANS;
export function scanLimit(plan:string){ return PLANS[plan as PlanKey]?.scans ?? PLANS.free.scans; }
