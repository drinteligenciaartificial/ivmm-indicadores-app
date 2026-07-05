export function TrafficBadge({value}:{value:string}){return <span className={`badge ${value}`}>{value==="SEM_META"?"Sem meta":value}</span>}
